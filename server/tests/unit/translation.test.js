const { TranslationService } = require('../../src/services/translationService');

describe('TranslationService (Simulation Mode)', () => {
  let service;

  beforeEach(() => {
    service = new TranslationService('', true); // No API key, mockMode = true
  });

  it('should translate known English clinical phrase to Spanish', async () => {
    const result = await service.translateText(
      'I need to check your symptoms',
      'english',
      'spanish'
    );
    expect(result.translatedText).toBe('Necesito revisar sus síntomas');
    expect(result.source).toBe('lexicon-simulation');
  });

  it('should translate known Spanish patient phrase to English', async () => {
    const result = await service.translateText(
      'Me duele la cabeza desde hace dos días',
      'spanish',
      'english'
    );
    expect(result.translatedText).toBe("I've had a headache for two days");
    expect(result.source).toBe('lexicon-simulation');
  });

  it('should provide fallback format for unmapped phrases in mock mode', async () => {
    const result = await service.translateText(
      'Unusual phrase not in dictionary',
      'english',
      'spanish'
    );
    expect(result.translatedText).toContain('Unusual phrase not in dictionary');
    expect(result.source).toBe('fallback-simulation');
  });

  it('should throw error when text is empty', async () => {
    await expect(service.translateText('', 'english', 'spanish')).rejects.toThrow();
  });
});
