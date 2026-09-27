const ConversationRepository = require('./conversationRepository');

class InMemoryConversationRepository extends ConversationRepository {
  constructor() {
    super();
    this.conversations = new Map();
    this.counter = 1;
  }

  async connect() {
    return true;
  }

  async saveConversation(data) {
    const id = `mem_${Date.now()}_${this.counter++}`;
    const record = {
      _id: id,
      messages: data.messages || [],
      timestamp: data.timestamp || new Date(),
      createdAt: new Date().toISOString()
    };
    this.conversations.set(id, record);
    return { insertedId: id };
  }

  async getConversationById(id) {
    return this.conversations.get(id) || null;
  }

  async listConversations(limit = 50) {
    const all = Array.from(this.conversations.values());
    all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return all.slice(0, limit);
  }

  getStorageType() {
    return 'in-memory-fallback';
  }

  async close() {
    this.conversations.clear();
  }
}

module.exports = InMemoryConversationRepository;
