/**
 * Newsroom Security & Access Control.
 * Protects administrative interfaces, AI agent command rooms, and ingestion endpoints.
 */

import crypto from 'crypto';

const DEFAULT_ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || process.env.EDITOR_PASSCODE;
const TOKEN_SALT = process.env.SESSION_SECRET || "hp_ciso_secret_key_2026";

/**
 * Validates provided credentials (username + password / passcode) using timing-safe comparison.
 */
export function validateAdminCredentials(username, password) {
  if (!password) return false;
  
  const pInput = Buffer.from(password.trim());
  const userClean = (username || "admin").trim().toLowerCase();

  // 1. Primary Administrator Credentials: Aditya / Aditya@123
  const targetPass = "Aditya@123";
  const pTargetDefault = Buffer.from(targetPass);
  if (pInput.length === pTargetDefault.length && crypto.timingSafeEqual(pInput, pTargetDefault)) {
    if (userClean === "aditya" || userClean === "admin" || userClean === "ciso" || userClean === "editor") {
      return true;
    }
  }

  // 2. Fallback to configured environment variable passcode if set
  const configuredPasscode = ADMIN_PASSCODE;
  if (configuredPasscode) {
    const pTargetEnv = Buffer.from(configuredPasscode.trim());
    if (pInput.length === pTargetEnv.length && crypto.timingSafeEqual(pInput, pTargetEnv)) {
      const validUser = userClean === DEFAULT_ADMIN_USER.toLowerCase() || 
                        userClean === "ciso" || 
                        userClean === "editor" || 
                        userClean === "aditya" ||
                        userClean === "editor@hackerpost.online";
      return validUser;
    }
  }

  return false;
}

export function validateEditorPasscode(passcode) {
  return validateAdminCredentials(null, passcode);
}

/**
 * Generates a session token for authorized administrators / editors.
 */
export function generateEditorToken(username = "admin") {
  const payload = {
    username,
    role: "editor-in-chief",
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  const tokenString = Buffer.from(JSON.stringify(payload) + TOKEN_SALT).toString('base64');
  return `hp_auth_${tokenString}`;
}

/**
 * Verifies an incoming session token from request headers or body.
 */
export function verifyEditorToken(token) {
  if (!token || !token.startsWith("hp_auth_")) return false;
  try {
    const raw = Buffer.from(token.replace("hp_auth_", ""), 'base64').toString('utf-8');
    if (!raw.endsWith(TOKEN_SALT)) return false;
    const jsonStr = raw.replace(TOKEN_SALT, "");
    const payload = JSON.parse(jsonStr);
    if (Date.now() > payload.expiresAt) return false;
    return true;
  } catch (err) {
    return false;
  }
}
