/**
 * Base Conversation Repository Interface
 */
class ConversationRepository {
  async connect() {
    throw new Error('Not implemented');
  }

  async saveConversation(conversation) {
    throw new Error('Not implemented');
  }

  async getConversationById(id) {
    throw new Error('Not implemented');
  }

  async listConversations(limit = 50) {
    throw new Error('Not implemented');
  }

  getStorageType() {
    throw new Error('Not implemented');
  }

  async close() {
    throw new Error('Not implemented');
  }
}

module.exports = ConversationRepository;
