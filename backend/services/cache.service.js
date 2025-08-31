const redis = require('../config/redis');

const CACHE_KEY = 'decision_tree_model';
const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

class CacheService {
  // Store decision tree in Redis
  async setDecisionTree(modelJson) {
    try {
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(modelJson));
      console.log('💾 Decision Tree saved to Redis');
      return true;
    } catch (error) {
      console.error('Error saving to Redis:', error);
      return false;
    }
  }

  // Get decision tree from Redis
  async getDecisionTree() {
    try {
      const data = await redis.get(CACHE_KEY);
      if (data) {
        console.log('✅ Decision Tree retrieved from Redis');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving from Redis:', error);
      return null;
    }
  }

  // Delete decision tree from Redis
  async deleteDecisionTree() {
    try {
      await redis.del(CACHE_KEY);
      console.log('🗑️ Decision Tree deleted from Redis');
      return true;
    } catch (error) {
      console.error('Error deleting from Redis:', error);
      return false;
    }
  }

  // Get remaining TTL
  async getTTL() {
    try {
      return await redis.ttl(CACHE_KEY);
    } catch (error) {
      console.error('Error getting TTL:', error);
      return -2; // Key doesn't exist
    }
  }
}

module.exports = new CacheService();