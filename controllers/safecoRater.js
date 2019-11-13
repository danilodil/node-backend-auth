const { safecoAutoQueue, safecoHomeQueue } = require('../jobs/safeco');

module.exports = {
  addToAutoQueue: async (req, res, next) => {
    const raterData = {
      raterStore: req.session.raterStore,
      body: req.body,
    };
    const job = await safecoAutoQueue.add(raterData);
    req.session.data = { jobId: job.id };
    return next();
  },
  addToHomeQueue: async (req, res, next) => {
    const raterData = {
      raterStore: req.session.raterStore,
      body: req.body,
    };
    const job = await safecoHomeQueue.add(raterData);
    req.session.data = { jobId: job.id };
    return next();
  },
};
