/**
 * BYD KDS - Cache Configuration
 * In-memory cache with NodeCache
 */
const NodeCache = require('node-cache');

const cache = new NodeCache({
    stdTTL: parseInt(process.env.CACHE_TTL) || 300,
    checkperiod: 60,
    useClones: false
});

// Cache keys
const CACHE_KEYS = {
    CITIES_LIST: 'cities:list',
    CITY_DETAIL: (id) => `city:${id}`,
    LATEST_METRICS: 'metrics:latest',
    CITY_METRICS: (id) => `metrics:city:${id}`,
    TOPSIS_LATEST: 'topsis:latest',
    TOPSIS_RUN: (id) => `topsis:run:${id}`,
    SCENARIOS: 'scenarios:presets',
    FORECAST: (cityId, target) => `forecast:${cityId}:${target}`
};

// Cache wrapper for async functions
const withCache = async (key, ttl, fetchFn) => {
    const cached = cache.get(key);
    if (cached !== undefined) {
        return cached;
    }

    const data = await fetchFn();
    cache.set(key, data, ttl);
    return data;
};

// Invalidate patterns
const invalidatePattern = (pattern) => {
    const keys = cache.keys();
    keys.forEach(key => {
        if (key.startsWith(pattern)) {
            cache.del(key);
        }
    });
};

module.exports = {
    cache,
    CACHE_KEYS,
    withCache,
    invalidatePattern
};
