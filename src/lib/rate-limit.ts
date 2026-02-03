type RateLimitStore = Map<string, { count: number; reset: number }>;

const store: RateLimitStore = new Map();

export function rateLimit(
  ip: string, 
  limit: number = 100, 
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.reset) {
    store.set(ip, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.reset };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, reset: record.reset };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.reset) {
      store.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour
