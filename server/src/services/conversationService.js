const { getRepository } = require('../repositories');

class ConversationService {
  async saveConversation(data) {
    if (!data || !Array.isArray(data.messages)) {
      throw new Error('Invalid conversation payload: messages array is required');
    }
    const repo = await getRepository();
    const result = await repo.saveConversation({
      messages: data.messages,
      timestamp: data.timestamp || new Date()
    });
    return result;
  }

  async getConversationById(id) {
    if (!id) {
      throw new Error('Conversation id is required');
    }
    const repo = await getRepository();
    return repo.getConversationById(id);
  }

  async listConversations(limit = 50) {
    const repo = await getRepository();
    return repo.listConversations(limit);
  }

  async getStorageStatus() {
    const repo = await getRepository();
    return repo.getStorageType();
  }
}

module.exports = ConversationService;
