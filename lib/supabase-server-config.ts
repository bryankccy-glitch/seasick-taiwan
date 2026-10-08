type Environment = Record<string, string | undefined>;

export function getSupabaseServerConfig(environment: Environment = process.env) {
  const url = environment.SUPABASE_URL?.trim();
  const secretKey = environment.SUPABASE_SECRET_KEY?.trim();

  if (!url) throw new Error("SUPABASE_URL is not configured");
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("SUPABASE_URL is invalid");
  }
  if (parsedUrl.protocol !== "https:") throw new Error("SUPABASE_URL must use HTTPS");
  if (!secretKey) throw new Error("SUPABASE_SECRET_KEY is not configured");
  if (!secretKey.startsWith("sb_secret_")) {
    throw new Error("SUPABASE_SECRET_KEY must be a server-only Supabase secret key");
  }
  return { url: parsedUrl.origin, secretKey };
}

export function isUniqueConstraintError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "23505");
}
