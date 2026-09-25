const { initDatabaseSchema } = require('../database/schema');
const { seedDatabase } = require('../database/seed');

let isInitialized = false;
let initPromise = null;

async function ensureDbInitialized(req, res, next) {
  if (isInitialized) {
    return next();
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        await initDatabaseSchema();
        await seedDatabase();
        isInitialized = true;
        console.log('Serverless database initialized successfully.');
      } catch (err) {
        console.error('Failed to initialize serverless database:', err);
        initPromise = null; // reset on error so retry works
        throw err;
      }
    })();
  }

  try {
    await initPromise;
    next();
  } catch (err) {
    return res.status(500).json({ error: `Database initialization error: ${err.message}` });
  }
}

module.exports = { ensureDbInitialized };
