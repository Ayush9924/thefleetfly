const mongoose = require('mongoose');
require('dotenv').config();

jest.setTimeout(30000);

// Connect to test database
beforeAll(async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required for integration tests');
  }
  await mongoose.connect(process.env.MONGO_URI);
});

// Disconnect after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Clear database between tests
afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});