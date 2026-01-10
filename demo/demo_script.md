# FlowPay Hackathon Demo Script

**Title**: FlowPay - The "EzPass" for AI Agents
**Presenter**: Ola
**Time**: 2 Minutes

---

### Scene 1: The Problem (Terminal)
*Context: Agents today hit paywalls and get stuck.*

1. **Start Provider**: `npx ts-node demo/provider.ts`
   - "Here is an Agent Gatekeeper protecting premium data."
   - "It demands streaming payments (0.0001 MNEE/sec)."

2. **Run Standard Request (Fail)**:
   - *Show curl or simple failure if time permits, or jump to solution.*

### Scene 2: The Solution (Agent Interaction) (Terminal)
*Context: FlowPay SDK handles the negotiation autonomously.*

1. **Run Consumer**: `npx ts-node demo/consumer.ts`
2. **Narrate Output**:
   - **"Blind Request"**: The Agent tries to fetch data.
   - **"402 Intercepted"**: SDK catches the payment demand.
   - **"AI Decision"**: "Volume is high -> I will open a Stream."
   - **"Signature"**: The Agent signs **ONE** transaction.
   - **"Access Granted"**: Data received.

### Scene 3: The "Magic" (Efficiency) (Terminal Output)
*Context: Why is this better than per-request payments?*

1. **Highlight Loop**:
   - "Watch as the Agent sends 5 more requests..."
   - "NO new signatures. NO new transactions."
   - "It reuses the open stream ID."
2. **Show Metrics**:
   - `Total Requests`: 6
   - `Signatures`: 1
   - **"We solved the N+1 Transaction Problem for Agents."**

### Scene 4: The Dashboard (Visuals) (Localhost:5173)
*Context: Visibility for the Human Operator.*

1. **Open Dashboard**: `http://localhost:5173`
2. **Show Elements**:
   - **Live Balance**: "Money streaming in real-time."
   - **AI Logs**: "See the agent deciding to stream."
   - **Emergency Stop**: "Human control is always prioritized."

---

### Closing
"FlowPay enables the Multi-Agent Economy by removing financial friction. Agents can now stream value as easily as they stream bytes."
