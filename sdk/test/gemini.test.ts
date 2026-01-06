import { expect } from 'chai';
import { GeminiPaymentBrain } from '../src/GeminiPaymentBrain';
import { FlowPaySDK } from '../src/FlowPaySDK';
import { Wallet } from 'ethers';

// Mock GoogleGenerativeAI
const mockGenerateContent = async (prompt: string) => {
    // Check prompt content to simulate response
    if (prompt.includes("analyze these payment metrics")) {
        return {
            response: {
                text: () => "Spending Analysis: You have high request volume. Streaming is recommended."
            }
        };
    }
    if (prompt.includes("Decide the most cost-effective payment mode")) {
        // Return JSON
        if (prompt.includes("Estimated Requests: 10")) {
            return {
                response: {
                    text: () => JSON.stringify({ mode: "stream", reasoning: "High volume justifies open cost." })
                }
            };
        }
        if (prompt.includes("Estimated Requests: 1")) {
            return {
                response: {
                    text: () => JSON.stringify({ mode: "direct", reasoning: "Low volume, direct is cheaper." })
                }
            };
        }
    }
    if (prompt.includes("User Query: Hello")) {
        return {
            response: {
                text: () => "Hello! How can I help with your payments?"
            }
        };
    }
    return { response: { text: () => "Mock Response" } };
};

// Mock Class replacement strategy logic
// Since we can't easily mock the import inside the TS file without a library like proxyquire/sinon in this setup,
// we will verify the GeminiPaymentBrain logic itself by mocking the 'model' property if possible or extending it.

class MockGeminiPaymentBrain extends GeminiPaymentBrain {
    constructor() {
        super("MOCK_KEY");
        // Inject mock model
        (this as any).model = {
            generateContent: mockGenerateContent
        };
    }
}

describe('Gemini AI Integration', () => {
    let brain: MockGeminiPaymentBrain;

    beforeEach(() => {
        brain = new MockGeminiPaymentBrain();
    });

    it('Should analyze spending metrics', async () => {
        const analysis = await brain.analyzeSpending({ requestsSent: 100, signersTriggered: 2 });
        expect(analysis).to.include("Spending Analysis");
        expect(analysis).to.include("Streaming is recommended");
    });

    it('Should decide to Stream for high volume', async () => {
        const result = await brain.shouldStream(10);
        expect(result.mode).to.equal('stream');
        expect(result.reasoning).to.include("High volume");
    });

    it('Should decide to Direct Pay for low volume', async () => {
        const result = await brain.shouldStream(1);
        expect(result.mode).to.equal('direct');
        expect(result.reasoning).to.include("Low volume");
    });

    it('Should answer natural language questions', async () => {
        const answer = await brain.ask("Hello", {});
        expect(answer).to.equal("Hello! How can I help with your payments?");
    });
});

describe('FlowPaySDK with AI', () => {
    let sdk: FlowPaySDK;

    beforeEach(() => {
        sdk = new FlowPaySDK({
            privateKey: Wallet.createRandom().privateKey,
            rpcUrl: 'http://localhost:8545',
            apiKey: 'test-key'
        });

        // Inject Mock Brain
        sdk.brain = new MockGeminiPaymentBrain();
    });

    it('SDK should use Brain for mode selection', async () => {
        const mode = await sdk.selectPaymentMode(10);
        expect(mode).to.equal('stream');
    });

    it('SDK should expose Ask Agent', async () => {
        const response = await sdk.askAgent("Hello");
        expect(response).to.equal("Hello! How can I help with your payments?");
    });
});
