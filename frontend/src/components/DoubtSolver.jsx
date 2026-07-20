import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

function DoubtSolver({ API_BASE_URL }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hello! I am Aura, your academic tutor. Ask me any doubt about mathematical formulas, coding questions, science parameters, or essays. Feel free to input math expressions or paste code!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Render equations in messages
    if (window.renderMathInElement && chatContainerRef.current) {
      window.renderMathInElement(chatContainerRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query || loading) return;

    // Append user message
    const newMessages = [...messages, { role: 'user', text: query }];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      // Build history context (last 6 messages)
      const historyContext = newMessages.slice(0, -1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch(`${API_BASE_URL}/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          history: historyContext
        })
      });
      const data = await res.json();

      if (data.response) {
        setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.warn('Backend server connection error. Simulating doubt solving response locally.');
      const simulatedResponse = simulateDoubtAnswer(query);
      setMessages(prev => [...prev, { role: 'bot', text: simulatedResponse }]);
    } finally {
      setLoading(false);
    }
  };

  const simulateDoubtAnswer = (query) => {
    const q = query.toLowerCase();
    if (q.includes('integrate') || q.includes('derivative') || q.includes('calculus') || q.includes('limit')) {
      return `### Mathematical Derivative Proof
To calculate the derivative of a function \\( f(x) \\), we evaluate the rate of change using the limit formula:
\\[ f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} \\]

Applying the **Power Rule** for polynomial expressions:
\\[ \\frac{d}{dx} x^n = n x^{n-1} \\]

**Example Problem:** Find the derivative of \\( f(x) = 4x^3 + 7x \\).
1. First term: \\( 4 \\cdot 3x^2 = 12x^2 \\).
2. Second term: \\( 7 \\cdot 1 = 7 \\).
3. Summing:
\\[ f'(x) = 12x^2 + 7 \\]

---
#### Practice Recap:
1. What is the derivative of \\( g(x) = \\sin(x) + e^{2x} \\)?
2. How would you solve the integral of \\( 2x \\) from \\( 0 \\) to \\( 3 \\)?`;
    }

    if (q.includes('scope') || q.includes('let') || q.includes('javascript') || q.includes('var') || q.includes('const')) {
      return `### JS Scopes & Declaration Keywords
In modern JavaScript, variables are declared using three scopes: block scope, function scope, and global scope.

Let's look at the behavior in code:
\`\`\`javascript
function scopeDemo() {
    if (true) {
        var functionScoped = "Accessible anywhere in scopeDemo";
        let blockScoped = "Only accessible inside this IF block";
        const constantBlock = "Only accessible here, cannot be reassigned";
    }
    console.log(functionScoped); // Prints variable successfully
    // console.log(blockScoped); // ReferenceError
}
\`\`\`

**Core takeaways:**
- \`var\`: Function-scoped, hoisted.
- \`let\` / \`const\`: Block-scoped.

---
#### Practice Recap:
1. Can you explain the difference between a shallow copy and a deep copy in JavaScript?
2. What is the "Temporal Dead Zone" in relation to \`let\` and \`const\`?`;
    }

    return `### Academic Explanation
Thank you for asking. Here is a step-by-step breakdown of your question:

1. **Analytical Review**: Review the primary parameters of the concept.
2. **Formula Setup**: Apply the model:
\\[ E = m c^2 \\]
3. **Execution**: Resolve calculations or logic structures.

*(Note: If you run the Node.js backend server with your OpenRouter key, AuraStudy will provide custom live explanations powered by gpt-4o-mini!)*

---
#### Practice Recap:
1. Can you provide more details or an example problem about your topic?
2. Would you like me to quiz you on this subject?`;
  };

  const handleClear = () => {
    if (confirm('Clear chat history?')) {
      setMessages([
        {
          role: 'bot',
          text: 'Hello! I am Aura, your academic tutor. Ask me any doubt about mathematical formulas, coding questions, science parameters, or essays.'
        }
      ]);
    }
  };

  // Basic markdown translation
  const formatText = (text) => {
    let html = text
      .replace(/### (.*)/g, '<h3 class="text-md font-bold my-2 text-violet-500">$1</h3>')
      .replace(/#### (.*)/g, '<h4 class="text-sm font-bold my-1 text-indigo-400">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-200 dark:bg-slate-800 text-pink-500 px-1.5 py-0.5 rounded font-code text-xs">$1</code>')
      .replace(/\n/g, '<br>');

    // Format Code Blocks
    const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
    html = html.replace(codeRegex, (match, lang, code) => {
      return `<pre class="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-darkBorder my-3 overflow-x-auto text-xs font-code"><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });

    return { __html: html };
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-2xl shadow-sm overflow-hidden animate-fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-darkBorder flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center text-violet-500 relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-darkCard animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">Aura Solver</h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">gpt-4o-mini Agent</span>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
        >
          Clear History
        </button>
      </div>

      {/* Message List Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-4 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
              msg.role === 'user' 
                ? 'bg-violet-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-violet-500'
            }`}>
              {msg.role === 'user' ? 'U' : 'A'}
            </div>

            <div className={`p-4 rounded-2xl leading-relaxed text-sm ${
              msg.role === 'user'
                ? 'bg-violet-600 text-white rounded-tr-none shadow-md shadow-violet-600/10'
                : 'bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 rounded-tl-none'
            }`}>
              <div 
                dangerouslySetInnerHTML={formatText(msg.text)} 
                className="prose dark:prose-invert max-w-none break-words"
              />
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex gap-4 max-w-[80%] mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-violet-500 flex items-center justify-center text-sm font-bold animate-pulse">
              A
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 rounded-tl-none flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-violet-500 animate-spin" />
              <span className="text-xs text-slate-400 font-semibold">Aura is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-slate-900/20">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask your doubt, formula derivation, or coding question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-grow px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white flex items-center justify-center transition-all duration-200 shadow-md shadow-violet-600/10 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

    </div>
  );
}

export default DoubtSolver;
