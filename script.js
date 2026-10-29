// ---------- Edit these ----------
const CONFIG = {
	her: "Trang",
	from: "Đức",
	date: "Thứ Sáu, ngày 30 tháng 10",
	time: "7 giờ 30 tối",
	place: "Coastal Saigon",
	mapUrl: "https://www.google.com/maps/place/Coastal+Saigon/data=!4m2!3m1!1s0x317527a2dface6db:0xda2de9497136dae4?sa=X&ved=1t:242&ictx=111",
	// 19:30–21:30 Asia/Ho_Chi_Minh (UTC+7), expressed in UTC
	startUtc: "20261030T123000Z",
	endUtc: "20261030T143000Z",
	// Push notifications via https://ntfy.sh — subscribe to this topic in the ntfy app.
	// Set to "" to turn off.
	ntfyTopic: "doug-date-6def9872f6d5f567",
};
// --------------------------------

function notify(title, message, tags = []) {
	if (!CONFIG.ntfyTopic) return;
	// JSON publish to the root URL; plain-text body avoids a CORS preflight
	fetch("https://ntfy.sh/", {
		method: "POST",
		body: JSON.stringify({ topic: CONFIG.ntfyTopic, title, message, tags, priority: 4 }),
		keepalive: true,
	}).catch(() => { });
}

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const d = (t) => (reduceMotion ? 0.001 : t);

// Remember progress on her device so a reload resumes where she left off.
// Visit with ?reset to start over.
const STATE_KEY = "invitation-state";
if (new URLSearchParams(location.search).has("reset")) {
	try { localStorage.removeItem(STATE_KEY); } catch { }
	history.replaceState(null, "", location.pathname);
}
let state = {};
try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || {}; } catch { }
function saveState(patch) {
	state = { ...state, ...patch };
	try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch { }
}

function fillText() {
	$$("[data-her]").forEach((el) => (el.textContent = CONFIG.her));
	$$("[data-from]").forEach((el) => (el.textContent = CONFIG.from));
	$$("[data-date]").forEach((el) => (el.textContent = CONFIG.date));
	$$("[data-time]").forEach((el) => (el.textContent = CONFIG.time));
	$$("[data-place]").forEach((el) => (el.textContent = CONFIG.place));
	$$("[data-map]").forEach((el) => (el.href = CONFIG.mapUrl));

	const details = `Ăn tối cùng ${CONFIG.from} ❤️`;
	const gcal = new URL("https://calendar.google.com/calendar/render");
	gcal.search = new URLSearchParams({
		action: "TEMPLATE",
		text: `Hẹn ăn tối với ${CONFIG.from} ❤️`,
		dates: `${CONFIG.startUtc}/${CONFIG.endUtc}`,
		details: `${details}\n${CONFIG.mapUrl}`,
		location: CONFIG.place,
	}).toString();
	$$("[data-gcal]").forEach((el) => (el.href = gcal.toString()));

	const ics = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//invitation//EN",
		"BEGIN:VEVENT",
		`UID:${CONFIG.startUtc}-date@invitation`,
		`DTSTAMP:${CONFIG.startUtc}`,
		`DTSTART:${CONFIG.startUtc}`,
		`DTEND:${CONFIG.endUtc}`,
		`SUMMARY:Hẹn ăn tối với ${CONFIG.from} ❤️`,
		`LOCATION:${CONFIG.place}`,
		`DESCRIPTION:${CONFIG.mapUrl}`,
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");
	$$("[data-ics]").forEach((el) => {
		el.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
		el.download = "dinner-date.ics";
	});
}

function makePetals() {
	if (reduceMotion) return;
	const box = $(".petals");
	for (let i = 0; i < 14; i++) {
		const p = document.createElement("span");
		p.className = "petal";
		p.style.left = `${Math.random() * 100}%`;
		p.style.setProperty("--s", `${10 + Math.random() * 10}px`);
		p.style.setProperty("--d", `${11 + Math.random() * 10}s`);
		p.style.setProperty("--delay", `${-Math.random() * 20}s`);
		box.appendChild(p);
	}
}

// ---------- Envelope → letter ----------
const float = gsap.to(".envelope", {
	y: -10,
	rotation: 0.6,
	duration: 2.4,
	ease: "sine.inOut",
	yoyo: true,
	repeat: reduceMotion ? 0 : -1,
});

gsap.set(".panel-top", { rotationX: -180, z: 2 });
gsap.set(".panel-bot", { rotationX: 180, z: 1 });
gsap.set(".ink", { opacity: 0, y: 8, filter: "blur(3px)" });

let opened = false;

function openLetter() {
	if (opened) return;
	opened = true;
	saveState({ opened: true });
	float.kill();
	$(".seal").classList.add("cracked");

	const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

	tl.to(".seal", { scale: 1.12, duration: d(0.15), ease: "back.out(3)" })
		.to(".seal-l", { x: -28, y: 140, rotation: -50, opacity: 0, duration: d(0.9), ease: "power2.in" })
		.to(".seal-r", { x: 28, y: 140, rotation: 45, opacity: 0, duration: d(0.9), ease: "power2.in" }, "<")
		.to(".hint, .kicker", { opacity: 0, duration: d(0.3) }, "<")
		.to(".env-flap-shadow", { opacity: 0, duration: d(0.2) }, "<0.2")
		.add("flap", "<0.1")
		.to(".env-flap", { rotationX: 180, duration: d(0.8) }, "flap")
		.set(".env-flap", { zIndex: 1 }, `flap+=${d(0.4)}`)
		.to(".env-letter", { yPercent: -62, duration: d(0.9), ease: "power2.out" })
		.to(".envelope-scene", { y: "65vh", opacity: 0, duration: d(0.8), ease: "power2.in" }, `+=${d(0.25)}`)
		.set(".letter-scene", { autoAlpha: 1 }, "<0.3")
		.fromTo(".letter-wrap",
			{ y: 90, scale: 0.75, opacity: 0 },
			{ y: 0, scale: 1, opacity: 1, duration: d(0.9), ease: "power3.out" }, "<")
		.set(".envelope-scene", { display: "none" })
		// unfold: top flap first, then bottom
		.to(".panel-top", { rotationX: 0, z: 0, duration: d(1.1) }, `+=${d(0.15)}`)
		.to(".panel-top .shade", { opacity: 0, duration: d(1.1) }, "<")
		.to(".panel-bot", { rotationX: 0, z: 0, duration: d(1.1) }, `-=${d(0.35)}`)
		.to(".panel-bot .shade", { opacity: 0, duration: d(1.1) }, "<")
		.set(".sheet", { visibility: "visible" })
		.set(".fold", { display: "none" })
		// ink the words onto the page
		.to(".ink", {
			opacity: 1,
			y: 0,
			filter: "blur(0px)",
			duration: d(0.9),
			stagger: d(0.32),
			ease: "power1.out",
			clearProps: "filter",
		});
}

$(".envelope").addEventListener("click", openLetter);

// ---------- RSVP ----------
const yesBtn = $(".btn-yes");
const noBtn = $(".btn-no");
const noLabels = [
	"Không",
	"Em chắc chưa?",
	"Chắc thật không?",
	"Nghĩ lại đi mà 🥺",
	"Năn nỉ em đó…",
	"Tim anh vỡ mất 💔",
	"Cơ hội cuối nha…",
	"Thôi được, đồng ý 😌",
];
let attempts = 0;
const yesScale = () => Math.min(1 + attempts * 0.14, 1.9);
let lastPointer = { x: -999, y: -999 };

window.addEventListener("pointermove", (e) => (lastPointer = { x: e.clientX, y: e.clientY }), { passive: true });

function dodge(e) {
	if (attempts >= noLabels.length - 1) return;
	e?.preventDefault();
	if (e?.clientX != null) lastPointer = { x: e.clientX, y: e.clientY };

	attempts++;
	saveState({ attempts });
	noBtn.textContent = noLabels[attempts];
	if (attempts === 1) notify(`${CONFIG.her} định bấm Không…`, "Nút Không đã bỏ chạy. Bình tĩnh nhé.", ["eyes"]);

	// Escape the transformed letter so `position: fixed` is relative to the viewport
	if (!noBtn.classList.contains("loose")) {
		const r = noBtn.getBoundingClientRect();
		document.body.appendChild(noBtn);
		noBtn.classList.add("loose");
		gsap.set(noBtn, { left: r.left, top: r.top });
	}

	const w = noBtn.offsetWidth;
	const h = noBtn.offsetHeight;
	const pad = 16;
	let x, y, tries = 0;
	do {
		x = pad + Math.random() * Math.max(0, window.innerWidth - w - pad * 2);
		y = pad + Math.random() * Math.max(0, window.innerHeight - h - pad * 2);
		tries++;
	} while (tries < 30 && Math.hypot(x + w / 2 - lastPointer.x, y + h / 2 - lastPointer.y) < 160);

	gsap.to(noBtn, { left: x, top: y, rotation: gsap.utils.random(-12, 12), duration: d(0.35), ease: "back.out(1.6)" });
	gsap.to(yesBtn, { scale: yesScale(), duration: d(0.3), ease: "back.out(2)" });

	if (attempts === noLabels.length - 1) {
		gsap.to(noBtn, { rotation: 0, duration: d(0.3) });
		noBtn.classList.remove("btn-no");
	}
}

noBtn.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && dodge(e));
noBtn.addEventListener("pointerdown", dodge);
noBtn.addEventListener("click", (e) => {
	if (attempts >= noLabels.length - 1) sayYes();
	else dodge(e);
});
yesBtn.addEventListener("click", sayYes);

function hearts() {
	if (typeof confetti !== "function") return;
	const heart = confetti.shapeFromPath?.({
		path: "M167 72c19-38 37-56 75-56 42 0 76 33 76 75 0 76-76 151-151 227-76-76-151-151-151-227 0-42 33-75 75-75 38 0 57 18 76 56z",
	});
	const base = {
		shapes: heart ? [heart, "circle"] : ["circle"],
		colors: ["#9e1f24", "#d0484b", "#f2a9b4", "#c9a45c", "#fbeee0"],
		scalar: 1.6,
		disableForReducedMotion: true,
		zIndex: 100,
	};
	confetti({ ...base, particleCount: 120, spread: 90, origin: { y: 0.6 } });
	setTimeout(() => confetti({ ...base, particleCount: 60, angle: 60, spread: 70, origin: { x: 0 } }), 250);
	setTimeout(() => confetti({ ...base, particleCount: 60, angle: 120, spread: 70, origin: { x: 1 } }), 450);
}

let said = false;
function sayYes() {
	if (said) return;
	said = true;
	saveState({ yes: true, attempts });
	hearts();
	notify(
		`${CONFIG.her} đồng ý rồi!`,
		attempts
			? `Sau ${attempts} lần cố bấm Không. Hẹn ${CONFIG.date}, ${CONFIG.time} tại ${CONFIG.place}.`
			: `Đồng ý ngay, không chút do dự. Hẹn ${CONFIG.date}, ${CONFIG.time} tại ${CONFIG.place}.`,
		["heart", "tada"],
	);
	if (noBtn.isConnected) gsap.to(noBtn, { opacity: 0, scale: 0.5, duration: d(0.3), onComplete: () => noBtn.remove() });

	gsap.timeline()
		.to(".sheet", { rotationY: 90, transformPerspective: 1400, duration: d(0.45), ease: "power2.in" })
		.add(() => {
			$(".letter-body").hidden = true;
			$(".success").hidden = false;
			$(".letter-scene").scrollTop = 0;
		})
		.fromTo(".sheet", { rotationY: -90 }, { rotationY: 0, transformPerspective: 1400, duration: d(0.6), ease: "power2.out" })
		.from(".success > *", { opacity: 0, y: 10, stagger: d(0.12), duration: d(0.5) }, "-=0.2");
}

// Skip straight to the letter (or the "yes" card) if she has been here before
function restore() {
	if (!state.opened && !state.yes) return;
	opened = true;
	float.kill();
	gsap.set(".envelope-scene", { display: "none" });
	gsap.set(".letter-scene", { autoAlpha: 1 });
	gsap.set(".fold", { display: "none" });
	gsap.set(".sheet", { visibility: "visible" });
	gsap.set(".ink", { opacity: 1, y: 0, clearProps: "filter" });

	attempts = Math.min(state.attempts || 0, noLabels.length - 1);
	if (attempts) {
		noBtn.textContent = noLabels[attempts];
		gsap.set(yesBtn, { scale: yesScale() });
		if (attempts === noLabels.length - 1) noBtn.classList.remove("btn-no");
	}

	if (state.yes) {
		said = true;
		noBtn.remove();
		$(".letter-body").hidden = true;
		$(".success").hidden = false;
	}

	gsap.from(".letter-wrap", { opacity: 0, y: 20, duration: d(0.8), ease: "power2.out" });
}

fillText();
makePetals();
restore();
