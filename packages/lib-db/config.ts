export const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  // ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  ssl: false,
  max: 20,                  // Max number of connections
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Wait up to 2s for a new connection
};

export interface DBLogger {
  info(obj: unknown, msg?: string): void;
  error(obj: unknown, msg?: string): void;
}