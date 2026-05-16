const Client = require('../models/Client');
const { SESSION_EXCHANGES_LIMIT } = require('../config/constants');

const getOrCreateClient = async (phone) => {
  let client = await Client.findOne({ phone });
  if (!client) {
    client = await Client.create({ phone, lastSeen: new Date() });
  } else {
    client.lastSeen = new Date();
    await client.save();
  }
  return client;
};

const addToHistory = async (phone, role, content) => {
  await Client.updateOne(
    { phone },
    {
      $push: {
        sessionHistory: {
          $each: [{ role, content, timestamp: new Date() }],
          $slice: -SESSION_EXCHANGES_LIMIT * 2, // keep last N pairs
        },
      },
    }
  );
};

const getHistory = async (phone) => {
  const client = await Client.findOne({ phone });
  if (!client) return [];
  return client.sessionHistory.map(({ role, content }) => ({ role, content }));
};

const clearHistory = async (phone) => {
  await Client.updateOne({ phone }, { $set: { sessionHistory: [] } });
};

module.exports = { getOrCreateClient, addToHistory, getHistory, clearHistory };
