import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export class GeminiPaymentBrain {
    private model: GenerativeModel | null = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        }
    }

    /**
     * Analyzes spending metrics and provides natural language insights
     */
    public async analyzeSpending(metrics: { requestsSent: number, signersTriggered: number }): Promise<string> {
        if (!this.model) return "AI Analysis Unavailable: No API Key provided.";

        const prompt = `
        As a financial optimization agent, analyze these payment metrics:
        Total Requests: ${metrics.requestsSent}
        Transactions Signed: ${metrics.signersTriggered}

        Provide 1-2 sentences on efficiency and whether streaming would save costs compared to individual transactions.
        Assume 1 transaction = 21000 gas, 1 stream = 2 transactions (open/close).
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Analysis Failed:", error);
            return "AI Analysis Temporarily Unavailable.";
        }
    }

    /**
     * Decides whether to use Streaming or Direct payments based on context.
     * Returns JSON string with reasoning.
     */
    public async shouldStream(estimatedRequests: number, gasPriceGwei: number = 20): Promise<{ mode: 'stream' | 'direct', reasoning: string }> {
        if (!this.model) {
            // Fallback heuristic if no AI
            const mode = estimatedRequests >= 3 ? 'stream' : 'direct';
            return {
                mode,
                reasoning: `Heuristic: Volume ${estimatedRequests} ${mode === 'stream' ? '>=' : '<'} 3.`
            };
        }

        const prompt = `
        You are an autonomous payment agent. 
        Context:
        - Estimated Requests: ${estimatedRequests}
        - Current Gas Price: ${gasPriceGwei} gwei
        - Direct Cost per Request: ~21,000 gas
        - Stream Overhead: ~150,000 gas (open) + ~50,000 gas (close)
        
        Task: Decide the most cost-effective payment mode ('stream' or 'direct').
        Return ONLY valid JSON: { "mode": "stream" | "direct", "reasoning": "short explanation" }
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const text = (await result.response).text();
            // Clean markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Gemini Decision Failed:", error);
            // Fallback
            return { mode: estimatedRequests >= 3 ? 'stream' : 'direct', reasoning: "Fallback due to AI error" };
        }
    }

    /**
     * General Natural Language Interface for the Agent
     */
    public async ask(query: string, context: any): Promise<string> {
        if (!this.model) return "I cannot answer questions without a Gemini API Key.";

        const prompt = `
        System: You are FlowPay Agent, an AI payment assistant.
        Context: ${JSON.stringify(context)}
        User Query: ${query}
        
        Answer concisely as the agent.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            return (await result.response).text();
        } catch (error) {
            return "Sorry, I am unable to process that query right now.";
        }
    }
}
