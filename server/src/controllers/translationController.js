const { TranslationService } = require('../services/translationService');

const translationService = new TranslationService();

async function translateText(req, res, next) {
  try {
    const { text, source_language, target_language } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: {
          message: 'Missing or invalid "text" field in request body',
          statusCode: 400
        }
      });
    }

    const result = await translationService.translateText(
      text,
      source_language || 'english',
      target_language || 'spanish'
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  translateText
};
