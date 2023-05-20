import "server-only";

export const GITHUB_TOKEN = getEnv("GITHUB_TOKEN");
export const BLOG_WEBHOOK_SECRET = getEnv("BLOG_WEBHOOK_SECRET");

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
}
