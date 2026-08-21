/**
 * Newsroom Security & Access Control.
 * Protects administrative interfaces, AI agent command rooms, and ingestion endpoints.
 */

const DEFAULT_EDITOR_PASSCODE = process.env.ADMIN_PASSCODE || "ciso-hackerpost-2026";
const TOKEN_SALT = "hp_ciso_secret_key_2026";

/**
 * Validates provided editor passcode.
 */
export function validateEditorPasscode(passcode) {
  if (!passcode) return false;
  return passcode.trim() === DEFAULT_EDITOR_PASSCODE;
}

/**
 * Generates a session token for authorized editors.
 */
export function generateEditorToken() {
  const payload = {
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
