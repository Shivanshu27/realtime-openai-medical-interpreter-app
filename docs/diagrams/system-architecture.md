# System Architecture Topology

Visual breakdown of the application tiers, network flows, and data boundaries.

```mermaid
graph TB
    subgraph Client ["Client Tier (Browser SPA)"]
        UI["React 18 Clinical UI"]
        State["Redux Toolkit Store<br/>(User, Messages, Summary)"]
        Analyzer["Clinical Analyzer<br/>(Follow-up, Labs, Meds)"]
        RTC["WebRTC RTCPeerConnection"]
        WebAudio["AudioContext & Web Speech Fallback"]
        Sim["Clinical Simulation Engine"]

        UI --> State
        UI --> Analyzer
        UI --> RTC
        UI --> WebAudio
        UI --> Sim
    end

    subgraph Backend ["Backend Tier (Node.js / Express)"]
        Router["Express Router<br/>(/api/session, /api/translate, /health)"]
        AuthService["Session Service<br/>(Ephemeral Key Broker)"]
        TransService["Translation Service<br/>(GPT-4o / Mock Engine)"]
        RepoFactory["Repository Factory"]
        MongoRepo["MongoConversationRepository"]
        MemRepo["InMemoryConversationRepository"]

        Router --> AuthService
        Router --> TransService
        Router --> RepoFactory
        RepoFactory -.->|Primary| MongoRepo
        RepoFactory -.->|Graceful Fallback| MemRepo
    end

    subgraph External ["External Infrastructure"]
        OAI_Realtime["OpenAI Realtime Gateway<br/>(v1/realtime WebRTC)"]
        OAI_API["OpenAI REST API<br/>(v1/realtime/sessions)"]
        MongoDB[("MongoDB Database<br/>(Optional)")]
    end

    %% Network flows
    UI -.->|1. Fetch Ephemeral Key| Router
    AuthService -.->|2. Request Session| OAI_API
    RTC ==>|3. Direct WebRTC Media & Events (PCM16)| OAI_Realtime
    MongoRepo -.->|4. Transcripts| MongoDB

    classDef client fill:#1e3a2f,stroke:#4ade80,color:#e8f5e9;
    classDef server fill:#2a2a3e,stroke:#818cf8,color:#eef;
    classDef external fill:#3b2d18,stroke:#fbbf24,color:#fffbeb;

    class UI,State,Analyzer,RTC,WebAudio,Sim client;
    class Router,AuthService,TransService,RepoFactory,MongoRepo,MemRepo server;
    class OAI_Realtime,OAI_API,MongoDB external;
```
