const express = require('express');
const { getHealth } = require('../controllers/healthController');
const { generateEphemeralKey } = require('../controllers/sessionController');
const { translateText } = require('../controllers/translationController');
const {
  saveConversation,
  getConversationById,
  listConversations
} = require('../controllers/conversationController');

const router = express.Router();

// Health check
router.get('/health', getHealth);

// WebRTC Session Authentication
router.post('/session/ephemeral-key', generateEphemeralKey);

// Translation
router.post('/translate', translateText);

// Conversations
router.post('/conversations', saveConversation);
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversationById);

module.exports = router;
