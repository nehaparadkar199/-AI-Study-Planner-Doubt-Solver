import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const generateStudyPlan = async (req, res) => {
    const { subjects, examDate, hours, style = 'balanced', difficulty = 'intermediate', divisionMethod = 'equal' } = req.body;

    if (!subjects || !examDate || !hours) {
        return res.status(400).json({ error: 'Subjects, examDate, and study hours are required.' });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
        console.warn('⚠️ Missing OPENROUTER_API_KEY. Using simulated study planner.');
        const plan = simulatePlanner(subjects, examDate, hours, style, difficulty, divisionMethod);
        return res.json({ plan, simulated: true });
    }

    try {
        const prompt = `You are AuraStudy AI. Create a detailed, week-by-week study timetable.
Inputs:
- Subjects: ${subjects}
- Target Exam/Goal Date: ${examDate}
- Daily Hours: ${hours}
- Style: ${style}
- Difficulty: ${difficulty}
- Hour Division Method: ${divisionMethod}

You MUST return a JSON object without markdown code blocks. The JSON schema must be:
{
  "weeks": [
    {
      "title": "Week 1: [Topic]",
      "tasks": [
        {
          "name": "[Task Name]",
          "desc": "[Task description]"
        }
      ]
    }
  ]
}`;

        const openRouterModel = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: openRouterModel,
            messages: [
                { role: 'user', content: prompt }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://aurastudy.ai',
                'X-Title': 'AuraStudy AI'
            },
            timeout: 15000
        });

        const rawContent = response.data?.choices?.[0]?.message?.content || '';
        
        // Clean markdown code blocks if present
        const cleanedJson = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsedPlan = JSON.parse(cleanedJson);
        
        if (parsedPlan && parsedPlan.weeks) {
            parsedPlan.weeks.forEach(week => {
                if (week.tasks) {
                    week.tasks.forEach(task => {
                        task.completed = false;
                    });
                }
            });
            return res.json({ plan: parsedPlan });
        } else {
            throw new Error('Parsed plan did not contain weeks array');
        }

    } catch (error) {
        console.warn('⚠️ OpenRouter Planner Error (using fallback simulator):', error.response?.data || error.message);
        // Fail-safe fallback study plan generator
        const plan = simulatePlanner(subjects, examDate, hours, style, difficulty, divisionMethod);
        return res.json({ plan, simulated: true, apiError: error.message });
    }
};

// Local simulation fallback
function simulatePlanner(subjects, examDate, hours, style, difficulty, divisionMethod) {
    const list = subjects.split(',').map(s => s.trim());
    
    const today = new Date('2026-07-20');
    const exam = new Date(examDate);
    const diffTime = Math.abs(exam - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeksCount = Math.max(2, Math.min(8, Math.round(diffDays / 7)));

    const weeks = [];
    for (let w = 1; w <= weeksCount; w++) {
        const activeSubject = list[(w - 1) % list.length];
        
        const tasks = [
            {
                name: `Core Study: ${activeSubject}`,
                desc: `Master parameters and foundations of ${activeSubject}. Style: ${style}. Daily target: ${hours} hrs (${divisionMethod} division).`,
                completed: false
            },
            {
                name: `Practice Session: ${activeSubject}`,
                desc: `Complete exercises and review flashcards at ${difficulty} level.`,
                completed: false
            }
        ];

        if (w === weeksCount) {
            tasks.push({
                name: 'Final Mock Exam & Review',
                desc: 'Review weak topics, solve mock papers, and ensure rest before exam date.',
                completed: false
            });
        } else {
            tasks.push({
                name: `Self Recall Quiz: ${activeSubject}`,
                desc: 'Active recall exercises and memory check.',
                completed: false
            });
        }

        weeks.push({
            title: `Week ${w}: Deepening ${activeSubject}`,
            tasks: tasks
        });
    }

    return { weeks, hours, subjects, examDate, divisionMethod };
}
