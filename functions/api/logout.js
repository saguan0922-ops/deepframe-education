import { json } from "../_lib/auth.js";

export async function onRequestPost() {
  return json({ ok:true }, 200, {
    "Set-Cookie":"df_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
  });
}
