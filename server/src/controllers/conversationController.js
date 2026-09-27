const ConversationService = require('../services/conversationService');

const conversationService = new ConversationService();

async function saveConversation(req, res, next) {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: {
          message: 'Field "messages" must be an array',
          statusCode: 400
        }
      });
    }

    const result = await conversationService.saveConversation({ messages });
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    next(err);
  }
}

async function getConversationById(req, res, next) {
  try {
    const { id } = req.params;
    const conversation = await conversationService.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({
        error: {
          message: `Conversation with id "${id}" not found`,
          statusCode: 404
        }
      });
    }
    res.json(conversation);
  } catch (err) {
    next(err);
  }
}

async function listConversations(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const conversations = await conversationService.listConversations(limit);
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  saveConversation,
  getConversationById,
  listConversations
};
