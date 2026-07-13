import { createSession, json } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.SITE_PASSCODE || !env.SESSION_SECRET) {
    return json({ error:"Cloudflare 비밀값 설정이 필요합니다." }, 500);
  }
  const body = await request.json().catch(() => ({}));
  if (String(body.passcode || "") !== String(env.SITE_PASSCODE)) {
    return json({ error:"접속코드가 올바르지 않습니다." }, 401);
  }
  const token = await createSession(env.SESSION_SECRET);
  return json({ ok:true }, 200, {
    "Set-Cookie":`df_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200`
  });
}
