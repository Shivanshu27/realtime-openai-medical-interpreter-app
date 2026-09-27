const express = require('express');
const { generateEphemeralKey } = require('../controllers/sessionController');
const { translateText } = require('../controllers/translationController');
const { saveConversation } = require('../controllers/conversationController');
const { getHealth } = require('../controllers/healthController');

const router = express.Router();

// Root health check
router.get('/health', getHealth);

// Exact legacy endpoints expected by original client code
router.post('/generate-ephemeral-key', generateEphemeralKey);
router.post('/translate', translateText);
router.post('/conversations', saveConversation);

module.exports = router;
