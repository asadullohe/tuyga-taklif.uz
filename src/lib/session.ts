import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { getUserById } from "@/lib/db";
import type { AppUser } from "@/types";

const COOKIE_NAME = "tuyga_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type SessionPayload = {
  userId: string;
  role: AppUser["role"];
  exp: number;
};

function getSecret() {
  return process.env.APP_SESSION_SECRET || "dev-session-secret-change-before-production";
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createSessionToken(user: Pick<AppUser, "id" | "role">) {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function parseSessionToken(token?: string): SessionPayload | null {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }

  if (!payload.userId || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export function setSessionCookie(response: NextResponse, user: AppUser) {
  response.cookies.set(COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const payload = parseSessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!payload) return null;

  return getUserById(payload.userId);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
