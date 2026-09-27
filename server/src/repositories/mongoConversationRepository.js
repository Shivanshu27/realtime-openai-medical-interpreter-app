const { MongoClient, ObjectId } = require('mongodb');
const ConversationRepository = require('./conversationRepository');

class MongoConversationRepository extends ConversationRepository {
  constructor(uri, dbName = 'medical-interpreter', timeoutMs = 2500) {
    super();
    this.uri = uri;
    this.dbName = dbName;
    this.timeoutMs = timeoutMs;
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(this.uri, {
      serverSelectionTimeoutMS: this.timeoutMs,
      connectTimeoutMS: this.timeoutMs
    });
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    return true;
  }

  async saveConversation(data) {
    if (!this.db) throw new Error('Database not connected');
    const result = await this.db.collection('conversations').insertOne({
      messages: data.messages || [],
      timestamp: data.timestamp || new Date(),
      createdAt: new Date().toISOString()
    });
    return { insertedId: result.insertedId.toString() };
  }

  async getConversationById(id) {
    if (!this.db) throw new Error('Database not connected');
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    return this.db.collection('conversations').findOne(query);
  }

  async listConversations(limit = 50) {
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection('conversations')
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  getStorageType() {
    return 'mongodb';
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

module.exports = MongoConversationRepository;
