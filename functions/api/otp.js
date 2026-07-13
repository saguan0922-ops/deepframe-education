import { cookie, verifySession, json } from "../_lib/auth.js";

/*
  courses.js에 추가한 영상 ID를 이 목록에도 똑같이 추가하세요.
  API 요청자가 임의의 다른 영상 ID를 넣는 것을 막는 허용 목록입니다.
*/
const ALLOWED_VIDEO_IDS = new Set([
  "8c2b329c0a9541d4906668e6e0ba7f4b",
  "a9ad600d13504c9b8f3858b9f4333f35","a7215a410fab40358469bf595550132c","d39d648e5a08405597e8b273fb3344c9","a3c34c175c82402d9d4f0a92206dbc21",
  "469174a9622641319781d68f34149472","e25c5e1bec69428592ab6a6fb640b2bd","VIDEO_ID_8"
]);

export async function onRequestPost({ request, env }) {
  const loggedIn = await verifySession(cookie(request, "df_session"), env.SESSION_SECRET);
  if (!loggedIn) return json({ error:"접속 인증이 만료되었습니다. 다시 입장해 주세요." }, 401);

  const body = await request.json().catch(() => ({}));
  const videoId = String(body.videoId || "");
  if (!ALLOWED_VIDEO_IDS.has(videoId)) return json({ error:"허용되지 않은 영상입니다." }, 403);
  if (!env.VDOCIPHER_API_SECRET) return json({ error:"VdoCipher API Secret이 설정되지 않았습니다." }, 500);

  const watermark = JSON.stringify([{
    type:"rtext",
    text:"CONFIDENTIAL · DEEPFRAME",
    alpha:"0.45",
    color:"0xFFFFFF",
    size:"14",
    interval:"5000",
    skip:"5000"
  }]);

  const response = await fetch(
    `https://dev.vdocipher.com/api/videos/${encodeURIComponent(videoId)}/otp`,
    {
      method:"POST",
      headers:{
        "Accept":"application/json",
        "Content-Type":"application/json",
        "Authorization":`Apisecret ${env.VDOCIPHER_API_SECRET}`
      },
      body:JSON.stringify({
        ttl:300,
        whitelisthref:env.PLAYBACK_WHITELIST || "deepframekr.art",
        annotate:watermark
      })
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.otp || !data.playbackInfo) {
    return json({
      error:data.message || data.error || "VdoCipher 재생권한을 만들지 못했습니다."
    }, 502);
  }

  return json({ otp:data.otp, playbackInfo:data.playbackInfo });
}
