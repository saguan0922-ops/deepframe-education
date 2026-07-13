const enc = new TextEncoder();

function b64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signature(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]
  );
  const output = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return b64url(new Uint8Array(output));
}

export async function createSession(secret) {
  const payload = b64url(enc.encode(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60
  })));
  return `${payload}.${await signature(payload, secret)}`;
}

export async function verifySession(token, secret) {
  if (!token || !secret) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || (await signature(payload, secret)) !== sig) return false;
  try {
    const raw = payload.replace(/-/g, "+").replace(/_/g, "/");
    const data = JSON.parse(atob(raw));
    return Number(data.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function cookie(request, name) {
  const source = request.headers.get("Cookie") || "";
  const hit = source.split(";").map(v => v.trim()).find(v => v.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type":"application/json; charset=utf-8",
      "Cache-Control":"no-store",
      "X-Content-Type-Options":"nosniff",
      ...extraHeaders
    }
  });
}
