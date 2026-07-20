import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const generateStudyPlan = async (req, res) => {
    const { subjects, examDate, hours, style = 'balanced', difficulty = 'intermediate' } = req.body;

    if (!subjects || !examDate || !hours) {
        return res.status(400).json({ error: 'Subjects, examDate, and study hours are required.' });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
        console.warn('⚠️ Missing OPENROUTER_API_KEY. Using simulated study planner.');
        const plan = simulatePlanner(subjects, examDate, hours, style, difficulty);
        return res.json({ plan, simulated: true });
    }

    try {
        const prompt = `You are AuraStudy AI. Create a detailed, week-by-week study timetable.
Inputs:
- Subjects: ${subjects}
- Target Exam/Goal Date: ${examDate} (Assume current date is July 20, 2026)
- Study Hours per Day: ${hours}
- Learning Style: ${style}
- Difficulty Level: ${difficulty}

You MUST return a JSON object. Do NOT wrap the JSON in code fences or add extra text. The response must match this schema:
{
  "weeks": [
    {
      "title": "Week 1: [Short Week Topic]",
      "tasks": [
        {
          "name": "[Task Name]",
          "desc": "[Description of what to study/practice, tailored to style - 1-2 sentences]"
        }
      ]
    }
  ]
}
Distribute tasks across weeks leading up to the target date. Provide 2-4 concrete tasks per week. Make sure the response is valid JSON.`;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" }
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://aurastudy.ai',
                'X-Title': 'AuraStudy AI'
            }
        });

        const rawContent = response.data.choices[0].message.content;
        const parsedPlan = JSON.parse(rawContent.trim());
        
        // Add default completed: false flag to all tasks
        if (parsedPlan && parsedPlan.weeks) {
            parsedPlan.weeks.forEach(week => {
                if (week.tasks) {
                    week.tasks.forEach(task => {
                        task.completed = false;
                    });
                }
            });
        }

        return res.json({ plan: parsedPlan });

    } catch (error) {
        console.error('❌ OpenRouter Planner error:', error.response?.data || error.message);
        // Fallback to simulator on API error
        const plan = simulatePlanner(subjects, examDate, hours, style, difficulty);
        return res.json({ plan, simulated: true, error: 'API failed, loaded fallback plan.' });
    }
};

// Local simulation fallback
function simulatePlanner(subjects, examDate, hours, style, difficulty) {
    const list = subjects.split(',').map(s => s.trim());
    
    // Calculate weeks between now and examDate (capped between 2 and 8 weeks)
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
                desc: `Understand major parameters and foundations of ${activeSubject} based on a ${style} layout.`,
                completed: false
            },
            {
                name: `Practice Session for ${activeSubject}`,
                desc: `Spend ${hours} hours solving exercises or writing test scripts at ${difficulty} level.`,
                completed: false
            }
        ];

        if (w === weeksCount) {
            tasks.push({
                name: 'Final Mock Exam Review',
                desc: 'Assess weak points and review flashcards. Ensure 8+ hours of rest before final date.',
                completed: false
            });
        } else {
            tasks.push({
                name: `Self Quiz: ${activeSubject}`,
                desc: 'Generate flashcards or do active recall exercises to test retention.',
                completed: false
            });
        }

        weeks.push({
            title: `Week ${w}: Master ${activeSubject}`,
            tasks: tasks
        });
    }

    return { weeks };
}
