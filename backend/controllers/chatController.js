import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const askAcademicDoubt = async (req, res) => {
    const { query, history = [] } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;

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
For code snippets, format using Markdown fences specifying the language (e.g. \`\`\`javascript ... \`\`\`).
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

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openai/gpt-4o-mini',
            messages: messages
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://aurastudy.ai', // Optional referer for OpenRouter
                'X-Title': 'AuraStudy AI'
            }
        });

        const aiResponse = response.data.choices[0].message.content;
        return res.json({ response: aiResponse });

    } catch (error) {
        console.error('❌ OpenRouter API error:', error.response?.data || error.message);
        return res.status(500).json({ 
            error: 'Failed to communicate with OpenRouter API.', 
            details: error.response?.data || error.message 
        });
    }
};

// Simulated academic backup logic
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

    if (q.includes('scope') || q.includes('let') || q.includes('javascript') || q.includes('var') || q.includes('const')) {
        return `### Computer Science: JavaScript Scopes
In JavaScript, scopes determine where variables are accessible. ES6 introduced \`let\` and \`const\` which are block-scoped, solving issues associated with the function-scoped \`var\`.

Let's look at the behavior in code:
\`\`\`javascript
function scopeDemo() {
    if (true) {
        var functionScoped = "Accessible anywhere in scopeDemo";
        let blockScoped = "Only accessible inside this IF block";
        const constantBlock = "Only accessible here, cannot be reassigned";
    }
    console.log(functionScoped); // Works fine
    // console.log(blockScoped); // ReferenceError: blockScoped is not defined
}
\`\`\`

**Core takeaways:**
- \`var\`: Function-scoped, hoisted to the top of the context.
- \`let\` / \`const\`: Block-scoped, safer to prevent variable leakage.

---
#### Follow-up Practice Questions:
1. Can you explain the difference between a shallow copy and a deep copy in JavaScript?
2. What is the "Temporal Dead Zone" in relation to \`let\` and \`const\`?`;
    }

    return `### AuraStudy AI Tutor: Response
This is a simulated response because no **`OPENROUTER_API_KEY`** was detected in the backend configurations.

1. **Analytical Review**: Understand the basic mechanics of your query.
2. **Formula Setup**: If math is involved, establish the system model:
\\[ E_k = \\frac{1}{2} m v^2 \\]
3. **Execution**: Step through calculations or code logic.

To unlock full interactive explanations customized to your questions, please configure your OpenRouter API Key inside the backend environment files.

---
#### Follow-up Practice Questions:
1. Can you provide more details or an example problem about your topic?
2. Would you like me to quiz you on this subject?`;
}
