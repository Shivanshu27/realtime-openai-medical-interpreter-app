const MongoConversationRepository = require('./mongoConversationRepository');
const InMemoryConversationRepository = require('./inMemoryConversationRepository');
const config = require('../config');

let currentRepository = null;

async function getRepository() {
  if (currentRepository) {
    return currentRepository;
  }

  // If in test mode and no explicit mongo URI requested, use in-memory
  if (config.isTest && (!process.env.TEST_USE_MONGO)) {
    currentRepository = new InMemoryConversationRepository();
    await currentRepository.connect();
    return currentRepository;
  }

  if (config.mongoUri) {
    const mongoRepo = new MongoConversationRepository(
      config.mongoUri,
      config.mongoDbName,
      config.mongoTimeoutMs
    );

    try {
      await mongoRepo.connect();
      console.log(`[Storage] Connected to MongoDB database: ${config.mongoDbName}`);
      currentRepository = mongoRepo;
      return currentRepository;
    } catch (err) {
      console.warn(`[Storage] Could not connect to MongoDB (${err.message}).`);
      console.warn('[Storage] Gracefully falling back to InMemoryConversationRepository.');
      console.warn('[Storage] Transcripts will be stored in-memory during this session.');
    }
  }

  currentRepository = new InMemoryConversationRepository();
  await currentRepository.connect();
  return currentRepository;
}

function resetRepositoryForTesting(repo = null) {
  currentRepository = repo;
}

module.exports = {
  getRepository,
  resetRepositoryForTesting,
  InMemoryConversationRepository,
  MongoConversationRepository
};
