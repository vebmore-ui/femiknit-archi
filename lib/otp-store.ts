import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

type OtpEntry = {
  otp: string;
  expiresAt: number;
};

type SessionEntry = {
  email: string;
  createdAt: number;
};

const otpStore = new Map<string, OtpEntry>();

const SESSIONS_FILE = path.join(process.cwd(), "lib", "admin-sessions.json");

export const OTP_EXPIRY_MS = 5 * 60 * 1000;
export const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

function loadSessions(): Record<string, SessionEntry> {
  try {
    if (!existsSync(SESSIONS_FILE)) {
      writeFileSync(SESSIONS_FILE, JSON.stringify({}, null, 2));
      return {};
    }
    const data = readFileSync(SESSIONS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Record<string, SessionEntry>;
  } catch {
    return {};
  }
}

function saveSessions(sessions: Record<string, SessionEntry>): void {
  try {
    writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (err) {
    console.error("Failed to save admin sessions:", err);
  }
}

export function generateAndStoreOtp(email: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
  return otp;
}

export function verifyAndConsumeOtp(email: string, otp: string): boolean {
  const entry = otpStore.get(email);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  if (entry.otp !== otp) return false;
  otpStore.delete(email);
  return true;
}

export function createSession(email: string): string {
  const token = randomUUID();
  const sessions = loadSessions();
  sessions[token] = { email, createdAt: Date.now() };
  saveSessions(sessions);
  return token;
}

export function validateSession(token: string): string | null {
  if (!token) return null;
  const sessions = loadSessions();
  const session = sessions[token];
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_EXPIRY_MS) {
    delete sessions[token];
    saveSessions(sessions);
    return null;
  }
  return session.email;
}

export function destroySession(token: string): void {
  if (!token) return;
  const sessions = loadSessions();
  if (sessions[token]) {
    delete sessions[token];
    saveSessions(sessions);
  }
}
