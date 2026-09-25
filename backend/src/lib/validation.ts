import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1).max(120),
    lastName: z.string().min(1).max(120),
    /** @deprecated Prefer firstName + lastName; kept for older clients */
    displayName: z.string().min(1).max(120).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1).max(128),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export function displayNameFromRegister(input: RegisterInput): string {
  const fromParts = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  return fromParts || input.displayName?.trim() || "";
}
