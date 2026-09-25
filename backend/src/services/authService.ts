import type { User, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  hashRefreshToken,
  newRefreshToken,
  refreshExpiresAt,
  signAccessToken,
} from "../lib/tokens.js";
import type { LoginInput, RegisterInput } from "../lib/validation.js";
import { displayNameFromRegister } from "../lib/validation.js";

export type PublicUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
  };
}

function assertAccountUsable(user: User): void {
  if (!user.isActive || user.suspendedAt) {
    throw new AuthError("ACCOUNT_DISABLED", "This account is not active");
  }
}

export async function registerUser(
  input: RegisterInput,
): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError("EMAIL_TAKEN", "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const displayName = displayNameFromRegister(input) || null;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      displayName,
      role: "USER",
      isActive: true,
    },
  });

  return createSessionForUser(user);
}

export async function loginUser(
  input: LoginInput,
): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");
  }

  assertAccountUsable(user);

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");
  }

  return createSessionForUser(user);
}

async function createSessionForUser(user: User) {
  const refreshToken = newRefreshToken();
  const refreshHash = hashRefreshToken(refreshToken);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshHash,
      expiresAt: refreshExpiresAt(),
    },
  });

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function logoutByRefreshToken(refreshToken: string): Promise<void> {
  const refreshHash = hashRefreshToken(refreshToken);
  await prisma.session.deleteMany({ where: { refreshHash } });
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !user.isActive || user.suspendedAt) return null;
  return toPublicUser(user);
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
