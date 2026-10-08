import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(2, "名稱至少需要 2 個字元")
  .max(30, "名稱最多 30 個字元")
  .refine((value) => !/[\u0000-\u001f\u007f<>]/u.test(value), "名稱包含不支援的字元");

export const passwordSchema = z
  .string()
  .min(8, "密碼至少需要 8 個字元")
  .max(72, "密碼最多 72 個字元");

export function normalizeUsername(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("zh-Hant");
}
