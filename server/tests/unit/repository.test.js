const InMemoryConversationRepository = require('../../src/repositories/inMemoryConversationRepository');

describe('InMemoryConversationRepository', () => {
  let repo;

  beforeEach(async () => {
    repo = new InMemoryConversationRepository();
    await repo.connect();
  });

  afterEach(async () => {
    await repo.close();
  });

  it('should save a conversation and return an insertedId', async () => {
    const payload = {
      messages: [
        { sender: 'doctor', text: 'Hello', timestamp: new Date().toISOString() }
      ]
    };
    const result = await repo.saveConversation(payload);
    expect(result.insertedId).toBeDefined();
    expect(result.insertedId).toContain('mem_');
  });

  it('should retrieve a saved conversation by id', async () => {
    const payload = {
      messages: [{ sender: 'patient', text: 'Me duele la cabeza' }]
    };
    const { insertedId } = await repo.saveConversation(payload);
    const retrieved = await repo.getConversationById(insertedId);

    expect(retrieved).toBeDefined();
    expect(retrieved.messages.length).toBe(1);
    expect(retrieved.messages[0].text).toBe('Me duele la cabeza');
  });

  it('should list conversations sorted by timestamp', async () => {
    await repo.saveConversation({ messages: [{ text: 'Session 1' }] });
    await repo.saveConversation({ messages: [{ text: 'Session 2' }] });

    const list = await repo.listConversations();
    expect(list.length).toBe(2);
  });

  it('should identify storage type as in-memory-fallback', () => {
    expect(repo.getStorageType()).toBe('in-memory-fallback');
  });
});
