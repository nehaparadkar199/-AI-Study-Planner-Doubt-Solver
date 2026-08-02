import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const askAcademicDoubt = async (req, res) => {
    const { query, history = [] } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // Fallback if key is missing
    if (!openRouterKey) {
        console.warn('⚠️ Missing OPENROUTER_API_KEY. Using simulated academic response.');
        const simulatedAnswer = getSimulatedDoubtAnswer(query);
        return res.json({ response: simulatedAnswer, simulated: true });
    }

    try {
        const systemMessage = {
            role: 'system',
            content: `You are AuraStudy AI, an elite academic chatbot tutor. 
Your goal is to answer student questions and solve academic doubts.
Provide clear step-by-step reasoning, calculations, or code explanations.
Format math symbols with standard LaTeX delimiters:
- Use \\( ... \\) for inline math equations (e.g. \\( E=mc^2 \\)).
- Use \\[ ... \\] for separate block math equations.
For code snippets, format using Markdown fences specifying the language.
End your response with 2 follow-up practice/recap questions to check the student's understanding.`
        };

        const messages = [
            systemMessage,
            ...history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            { role: 'user', content: query }
        ];

        const openRouterModel = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: openRouterModel,
            messages: messages
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://aurastudy.ai',
                'X-Title': 'AuraStudy AI'
            },
            timeout: 15000 // 15s timeout
        });

        if (response.data && response.data.choices && response.data.choices[0]?.message?.content) {
            const aiResponse = response.data.choices[0].message.content;
            return res.json({ response: aiResponse });
        } else {
            throw new Error('Invalid response structure from OpenRouter API.');
        }

    } catch (error) {
        console.warn('⚠️ OpenRouter API Error (loading fallback response):', error.response?.data || error.message);
        // Fail-safe fallback so the user ALWAYS gets a response
        const fallbackAnswer = getSimulatedDoubtAnswer(query);
        return res.json({ 
            response: fallbackAnswer, 
            simulated: true, 
            apiError: error.response?.data?.error?.message || error.message 
        });
    }
};

// Safe academic fallback logic without raw template backticks
function getSimulatedDoubtAnswer(query) {
    const q = query.toLowerCase();
    
    if (q.includes('integrate') || q.includes('derivative') || q.includes('calculus') || q.includes('limit')) {
        return `### Math: Calculus & Derivatives Explanation
To calculate the derivative of a function \\( f(x) \\), we evaluate the rate of change using the limit formula:
\\[ f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} \\]

Applying the **Power Rule** for polynomial expressions:
\\[ \\frac{d}{dx} x^n = n x^{n-1} \\]

**Step-by-step example:** Differentiate \\( f(x) = 4x^3 + 7x \\).
1. Apply power rule to the first term: \\( 4 \\cdot 3x^2 = 12x^2 \\).
2. Apply power rule to the second term: \\( 7 \\cdot 1x^0 = 7 \\).
3. Combine terms:
\\[ f'(x) = 12x^2 + 7 \\]

---
#### Follow-up Practice Questions:
1. What is the derivative of \\( g(x) = \\cos(x) + e^{2x} \\)?
2. How would you solve the integral of \\( 2x \\) from \\( 0 \\) to \\( 3 \\)?`;
    }

    if (q.includes('scope') || q.includes('let') || q.includes('javascript') || q.includes('var') || q.includes('const') || q.includes('code')) {
        return `### Computer Science: JavaScript Scopes & Variables
In JavaScript, scopes determine variable visibility. ES6 introduced 'let' and 'const' which are block-scoped.

\`\`\`javascript
function scopeDemo() {
    if (true) {
        var functionScoped = "Accessible anywhere in function";
        let blockScoped = "Only accessible inside this IF block";
        const constantBlock = "Cannot be reassigned";
    }
    console.log(functionScoped); // Works fine
}
\`\`\`

**Core takeaways:**
- 'var': Function-scoped, hoisted.
- 'let' / 'const': Block-scoped, safer for modern software development.

---
#### Follow-up Practice Questions:
1. Can you explain the difference between a shallow copy and a deep copy in JavaScript?
2. What is the Temporal Dead Zone in JavaScript?`;
    }

    return `### AuraStudy AI Academic Assistant
Here is a structured conceptual guide to help you master **"${query}"**:

1. **Core Fundamentals**:
   - Define key variables and underlying domain rules.
   - Establish initial equations or principles:
   \\[ E_k = \\frac{1}{2} m v^2 \\]

2. **Step-by-Step Problem Solving**:
   - Step 1: Identify given constraints and goal output.
   - Step 2: Formulate state equations.
   - Step 3: Verify edge cases.

3. **Key Study Tip**: Practice with active recall flashcards to reinforce memory retention.

---
#### Follow-up Practice Questions:
1. Would you like a step-by-step example problem related to this topic?
2. Shall we generate a quick 3-question quiz to test your understanding?`;
}
