import hashlib
import pickle

class Cache:
    def __init__(self):
        self.store = {}  # Dictionary to store cache
        self.cache_ttl = 3600  # Not needed for in-memory but kept for reference

    def get_cache_key(self, data):
        return hashlib.md5(str(data).encode()).hexdigest()

    def get(self, key):
        data = self.store.get(key)
        return pickle.loads(data) if data else None

    def set(self, key, value):
        self.store[key] = pickle.dumps(value)
