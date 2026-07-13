const $ = (selector) => document.querySelector(selector);
const gate = $("#gate");
const library = $("#library");
const gateForm = $("#gate-form");
const gateError = $("#gate-error");
const grid = $("#course-grid");
const dialog = $("#player-dialog");
const playerArea = $("#player-area");
const playerTitle = $("#player-title");
const playerLesson = $("#player-lesson");

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "요청을 처리하지 못했습니다.");
  return data;
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function availableCourses() {
  return window.DEEPFRAME_COURSES.filter(c => c.id && !c.id.startsWith("VIDEO_ID_"));
}

function showLibrary() {
  gate.hidden = true;
  library.hidden = false;
  grid.replaceChildren();

  availableCourses().forEach((course, i) => {
    const watched = localStorage.getItem(`df-watched-${course.id}`) === "1";
    const card = document.createElement("button");
    card.className = `course${watched ? " watched" : ""}`;
    card.type = "button";
    card.style.setProperty("--shade1", course.cover?.[0] || "#444");
    card.style.setProperty("--shade2", course.cover?.[1] || "#111");
    card.style.setProperty("--glow", course.cover?.[2] || "rgba(255,255,255,.3)");
    card.innerHTML = `
      <div class="course-art">
        <span class="course-index">LESSON ${String(i + 1).padStart(2,"0")}</span>
        <span class="play">▶</span>
      </div>
      <div class="course-body">
        <h3>${esc(course.title)}</h3>
        <div class="course-meta"><span>${esc(course.label || "교육영상")}</span><span>·</span><span>${esc(course.duration || "")}</span></div>
        <div class="progress"><span></span></div>
      </div>`;
    card.addEventListener("click", () => openPlayer(course, i, card));
    grid.append(card);
  });
}

async function openPlayer(course, index, card) {
  playerTitle.textContent = course.title;
  playerLesson.textContent = `LESSON ${String(index + 1).padStart(2,"0")}`;
  playerArea.innerHTML = `<div class="loader"><span></span><p>보안 플레이어를 불러오는 중입니다…</p></div>`;
  dialog.showModal();

  try {
    const auth = await api("/api/otp", {
      method: "POST",
      body: JSON.stringify({ videoId: course.id })
    });
    const iframe = document.createElement("iframe");
    iframe.allow = "encrypted-media; autoplay";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.src = `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(auth.otp)}&playbackInfo=${encodeURIComponent(auth.playbackInfo)}`;
    playerArea.replaceChildren(iframe);
    localStorage.setItem(`df-watched-${course.id}`, "1");
    card.classList.add("watched");
  } catch (error) {
    playerArea.innerHTML = `<div class="loader"><p>${esc(error.message)}</p></div>`;
  }
}

async function boot() {
  try {
    await api("/api/session");
    showLibrary();
  } catch {
    gate.hidden = false;
    library.hidden = true;
  }
}

gateForm.addEventListener("submit", async event => {
  event.preventDefault();
  gateError.textContent = "";
  try {
    await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ passcode: $("#passcode").value })
    });
    showLibrary();
  } catch (error) {
    gateError.textContent = error.message;
  }
});

$("#logout").addEventListener("click", async () => {
  await api("/api/logout", { method:"POST", body:"{}" }).catch(() => {});
  location.reload();
});

$("#player-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => playerArea.replaceChildren());

boot();
