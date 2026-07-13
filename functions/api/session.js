import { cookie, verifySession, json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const ok = await verifySession(cookie(request, "df_session"), env.SESSION_SECRET);
  return ok ? json({ ok:true }) : json({ error:"인증이 필요합니다." }, 401);
}
