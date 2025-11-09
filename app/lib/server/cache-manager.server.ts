/**
 * Server-side cache manager with TTL support
 * Handles both global caches (USD prices) and per-user caches (balances)
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  lastAccessed: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  entries: Array<{
    key: string;
    age: number;
    ttl: number;
    size: number;
  }>;
}

/**
 * Generic cache with TTL support
 */
export class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private hits: number = 0;
  private misses: number = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private defaultTTL: number = 10 * 60 * 1000) {
    this.cache = new Map();
    // Run cleanup every 5 minutes to remove expired entries
    this.startCleanup();
  }

  /**
   * Set a value in the cache with optional custom TTL
   */
  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
      lastAccessed: Date.now(),
    };
    this.cache.set(key, entry);
  }

  /**
   * Get a value from the cache
   * Returns null if not found or expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update last accessed time
    entry.lastAccessed = now;
    this.hits++;
    return entry.data;
  }

  /**
   * Get entry with metadata
   */
  getEntry(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.lastAccessed = now;
    return entry;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl,
      size: JSON.stringify(entry.data).length,
    }));

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      entries,
    };
  }

  /**
   * Remove expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Start automatic cleanup
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get or set pattern: if key exists and not expired, return it
   * Otherwise, call the factory function and cache the result
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Get multiple keys at once
   */
  getMany(keys: string[]): Map<string, T | null> {
    const results = new Map<string, T | null>();
    for (const key of keys) {
      results.set(key, this.get(key));
    }
    return results;
  }

  /**
   * Set multiple entries at once
   */
  setMany(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.data, entry.ttl);
    }
  }
}

/**
 * Per-user cache manager
 * Stores data per user (address) with namespace support
 */
export class UserCacheManager<T = any> {
  private caches: Map<string, CacheManager<T>>;

  constructor(private defaultTTL: number = 10 * 60 * 1000) {
    this.caches = new Map();
  }

  /**
   * Get or create a cache for a specific user
   */
  private getUserCache(userId: string): CacheManager<T> {
    let cache = this.caches.get(userId);
    if (!cache) {
      cache = new CacheManager<T>(this.defaultTTL);
      this.caches.set(userId, cache);
    }
    return cache;
  }

  /**
   * Set data for a specific user
   */
  set(userId: string, key: string, data: T, ttl?: number): void {
    const cache = this.getUserCache(userId);
    cache.set(key, data, ttl);
  }

  /**
   * Get data for a specific user
   */
  get(userId: string, key: string): T | null {
    const cache = this.caches.get(userId);
    if (!cache) {
      return null;
    }
    return cache.get(key);
  }

  /**
   * Get entry with metadata for a specific user
   */
  getEntry(userId: string, key: string): CacheEntry<T> | null {
    const cache = this.caches.get(userId);
    if (!cache) {
      return null;
    }
    return cache.getEntry(key);
  }

  /**
   * Delete data for a specific user
   */
  delete(userId: string, key: string): boolean {
    const cache = this.caches.get(userId);
    if (!cache) {
      return false;
    }
    return cache.delete(key);
  }

  /**
   * Clear all data for a specific user
   */
  clearUser(userId: string): void {
    const cache = this.caches.get(userId);
    if (cache) {
      cache.clear();
      cache.stopCleanup();
      this.caches.delete(userId);
    }
  }

  /**
   * Clear all users' data
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.stopCleanup();
    }
    this.caches.clear();
  }

  /**
   * Get statistics for all users
   */
  getStats(): { userId: string; stats: CacheStats }[] {
    const stats: { userId: string; stats: CacheStats }[] = [];
    for (const [userId, cache] of this.caches.entries()) {
      stats.push({ userId, stats: cache.getStats() });
    }
    return stats;
  }

  /**
   * Get statistics for a specific user
   */
  getUserStats(userId: string): CacheStats | null {
    const cache = this.caches.get(userId);
    if (!cache) {
      return null;
    }
    return cache.getStats();
  }

  /**
   * Cleanup expired entries for all users
   */
  cleanup(): { userId: string; removed: number }[] {
    const results: { userId: string; removed: number }[] = [];
    for (const [userId, cache] of this.caches.entries()) {
      const removed = cache.cleanup();
      results.push({ userId, removed });
    }
    return results;
  }

  /**
   * Get or set pattern for user-specific data
   */
  async getOrSet(
    userId: string,
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cache = this.getUserCache(userId);
    return cache.getOrSet(key, factory, ttl);
  }
}
