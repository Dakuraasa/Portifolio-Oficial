const site = window.portfolioContent;
const select = (selector, parent = document) => parent.querySelector(selector);
const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
};
const svgNamespace = "http://www.w3.org/2000/svg";
const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

root.classList.add("js");
document.title = `Portfólio — ${site.name}`;
select('meta[name="description"]').content = `Portfólio editorial de ${site.name}.`;

document.querySelectorAll("[data-content]").forEach((element) => {
  const value = site[element.dataset.content];
  if (typeof value === "string") element.textContent = value;
});

function createSymbolIcon(id, className) {
  const icon = document.createElementNS(svgNamespace, "svg");
  const use = document.createElementNS(svgNamespace, "use");
  if (className) icon.setAttribute("class", className);
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  use.setAttribute("href", `#${id}`);
  icon.append(use);
  return icon;
}

const createStar = () => createSymbolIcon("star", "star");

function fillMarquee(track, text, copies) {
  track.replaceChildren();
  for (let index = 0; index < copies; index += 1) {
    track.append(createElement("span", "", text));
  }
}

function createIconTile({ icon, name, featured }, index = 0) {
  const tile = createElement("li", `icon-tile${featured ? " is-featured" : ""}`);
  tile.style.setProperty("--tile-index", String(index));
  const badge = createElement("span", "icon-badge");
  badge.append(createSymbolIcon(`icon-${icon}`, "icon-glyph"));
  if (featured) {
    const mark = createSymbolIcon("butterfly-mark", "icon-butterfly");
    mark.setAttribute("viewBox", "0 0 64 56");
    badge.append(mark);
  }
  tile.append(badge, createElement("span", "icon-name", name));
  if (featured) tile.setAttribute("aria-label", `${name} (destaque)`);
  return tile;
}

/* ---------- Apresentação ---------- */

select("#presentation-lead").textContent = site.presentation.lead;
site.presentation.paragraphs.forEach((paragraph) => {
  select("#presentation-text").append(createElement("p", "", paragraph));
});
const presentationIcons = select("#presentation-icons");
site.presentation.languages.forEach((key, index) => {
  presentationIcons.append(
    createIconTile({ icon: key, name: site.iconNames[key] || key }, index),
  );
});

fillMarquee(select("#top-marquee"), site.marqueeText, 8);

/* ---------- Caminhos: Edição / Programação ---------- */

const pathContent = select("#path-content");
const pathButtons = [...document.querySelectorAll(".path-option")];
let currentPath = null;

function renderPath(key) {
  const data = site.paths[key];

  fillMarquee(select("#path-marquee"), data.marqueeText, 8);

  const aboutText = select("#about-text");
  aboutText.replaceChildren(
    ...data.about.map((paragraph) => createElement("p", "", paragraph)),
  );

  const timeline = select("#timeline");
  timeline.replaceChildren();
  data.timeline.forEach((entry) => {
    const item = createElement("li");
    item.append(createStar(), createElement("strong", "", entry.year));
    const details = createElement("div");
    details.append(createElement("strong", "", entry.title));
    if (entry.place) details.append(createElement("small", "", entry.place));
    item.append(details);
    timeline.append(item);
  });

  const projectArea = select("#project-area");
  projectArea.replaceChildren();
  destroyGallery();
  data.projects.forEach((project) => {
    if (project.type === "gallery") {
      projectArea.append(buildGallery(data));
      return;
    }
    if (project.type !== "github") return;
    if (!site.github || !/^https:\/\//i.test(site.github)) return;
    const block = createElement("div", "project-github");
    block.append(createElement("h3", "", "GitHub"));
    const githubLink = createElement("a", "github-image-link");
    githubLink.href = site.github;
    githubLink.target = "_blank";
    githubLink.rel = "noopener noreferrer";
    githubLink.setAttribute("aria-label", `Abrir o perfil de ${site.name} no GitHub`);
    const githubImage = new Image();
    githubImage.src = site.githubImage;
    githubImage.alt = "Cabeçalho artístico em preto e branco para o GitHub";
    githubImage.decoding = "async";
    githubLink.append(githubImage);
    block.append(githubLink, buildRepoFeed());
    projectArea.append(block);
  });

  const skillsGrid = select("#skills-grid");
  skillsGrid.replaceChildren(
    ...data.skills.map((skill, index) => createIconTile(skill, index)),
  );
  skillsGrid.setAttribute("aria-label", data.skillsTitle);

  fillMarquee(
    select("#skills-marquee"),
    data.skills.map((skill) => skill.name).join(" ✦ "),
    6,
  );
}

function choosePath(key) {
  if (!site.paths[key]) return;
  const firstChoice = currentPath === null;
  if (key === currentPath) {
    select("#sobre").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    return;
  }

  pathButtons.forEach((button) => {
    const active = button.dataset.path === key;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("is-active", active);
  });
  root.dataset.path = key;
  currentPath = key;

  const swap = () => {
    renderPath(key);
    pathContent.hidden = false;
    pathContent.classList.remove("is-leaving");
    pathContent.classList.remove("is-entering");
    void pathContent.offsetWidth;
    pathContent.classList.add("is-entering");
    window.dispatchEvent(new Event("portfolio:layout"));
    window.setTimeout(
      () => select("#sobre").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" }),
      firstChoice ? 450 : 120,
    );
  };

  if (firstChoice || reducedMotion) {
    swap();
  } else {
    pathContent.classList.add("is-leaving");
    window.setTimeout(swap, 380);
  }
}

pathButtons.forEach((button) => {
  button.addEventListener("click", () => choosePath(button.dataset.path));
});

/* ---------- Contato ---------- */

function addSafeExternalLink(parent, label, url, outline = false) {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  const link = createElement("a", outline ? "outline" : "", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  parent.append(link);
  return true;
}

const contactActions = select("#contact-actions");
const contactStatus = select("#contact-status");

if (site.email) {
  const copyButton = createElement("button", "", "Copiar e-mail");
  copyButton.type = "button";
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      contactStatus.textContent = "E-mail copiado.";
    } catch {
      contactStatus.textContent = `Não foi possível copiar. E-mail: ${site.email}`;
    }
  });
  contactActions.append(copyButton);

  const emailLink = createElement("a", "outline", "Enviar e-mail");
  emailLink.href = `mailto:${site.email}`;
  contactActions.append(emailLink);
} else {
  contactStatus.textContent = "Adicione seu e-mail em content.js.";
}

site.links.forEach(({ label, url }) => {
  addSafeExternalLink(contactActions, `${label} ↗`, url, true);
});

select("#current-year").textContent = String(new Date().getFullYear());

/* ---------- Abertura (estilo Netflix) ---------- */

const intro = select("#intro");
const introGif = select("#intro-gif");
let introFinished = false;

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

function finishIntro() {
  if (introFinished) return;
  introFinished = true;
  intro.classList.add("is-leaving");
  window.setTimeout(() => {
    root.classList.remove("is-intro");
    root.classList.add("is-ready");
    window.dispatchEvent(new Event("portfolio:ready"));
  }, reducedMotion ? 0 : 700);
  window.setTimeout(() => intro.remove(), reducedMotion ? 50 : 2200);
}

function startIntro() {
  if (reducedMotion) {
    finishIntro();
    return;
  }
  // Linha do tempo: nome aparece -> nome some -> GIF toca UMA vez -> site entra
  const NAME_HOLD = 2600; // nome visível (inclui o surgir)
  const NAME_OUT = 800; // nome sumindo
  const gifDuration = Number(site.intro?.gifDuration) || 2700; // 27 quadros x 100 ms
  // Pré-carrega sem exibir: a animação só começa quando o GIF aparece na tela
  let gifReady = false;
  let gifFailed = !site.intro?.gif;
  if (site.intro?.gif) {
    const preload = new Image();
    preload.onload = () => {
      gifReady = true;
    };
    preload.onerror = () => {
      gifFailed = true;
    };
    preload.src = site.intro.gif;
  }

  window.requestAnimationFrame(() => intro.classList.add("is-playing"));

  window.setTimeout(() => {
    if (introFinished) return;
    intro.classList.add("is-name-out");
    window.setTimeout(() => {
      if (introFinished) return;
      const showGif = () => {
        if (introFinished) return;
        // um <img> novo garante que o GIF comece do primeiro quadro
        const gif = createElement("img", "intro-gif");
        gif.alt = "";
        gif.src = site.intro.gif;
        introGif.replaceWith(gif);
        window.requestAnimationFrame(() => intro.classList.add("is-gif"));
        // sai um pouco antes do último quadro para nunca repetir
        window.setTimeout(finishIntro, gifDuration - 300);
      };
      if (gifReady) {
        showGif();
        return;
      }
      if (gifFailed) {
        finishIntro();
        return;
      }
      const waitStart = performance.now();
      const wait = () => {
        if (gifReady) showGif();
        else if (gifFailed || performance.now() - waitStart > 1500) finishIntro();
        else window.setTimeout(wait, 60);
      };
      wait();
    }, NAME_OUT);
  }, NAME_HOLD);

  select("#intro-skip").addEventListener("click", finishIntro);
  intro.addEventListener("click", (event) => {
    if (event.target === intro || event.target.closest(".intro-stage")) finishIntro();
  });
  window.addEventListener("keydown", (event) => {
    if (["Escape", "Enter", " "].includes(event.key)) finishIntro();
  });
}

startIntro();

/* ---------- Borboletas ---------- */

const butterflyWorld = createElement("div", "butterfly-world");
butterflyWorld.setAttribute("aria-hidden", "true");
document.body.append(butterflyWorld);

const BUTTERFLY_COUNT = 30;
const IDLE_BEFORE_LANDING = 3200;
const FLEE_RADIUS = 170;
const PERCH_ALARM_RADIUS = 130;
const TAU = Math.PI * 2;

const pointer = { clientX: -9999, clientY: -9999, x: -9999, y: -9999, lastMove: -Infinity, hasMouse: false };

const random = (min, max) => min + Math.random() * (max - min);
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
function angleLerp(from, to, amount) {
  let difference = ((to - from + Math.PI) % TAU + TAU) % TAU - Math.PI;
  return from + difference * clamp(amount, 0, 1);
}

let worldHeight = 0;
function pageHeight() {
  return Math.max(
    document.documentElement.scrollHeight,
    select("main").scrollHeight,
    window.innerHeight,
  );
}

function createButterfly(index) {
  const element = createElement("span", "world-butterfly");
  const icon = createSymbolIcon("butterfly-mark");
  icon.setAttribute("viewBox", "0 0 64 56");
  element.append(icon);
  const size = [1.25, 1.05, 1.5, 1.15][index % 4];
  element.style.setProperty("--butterfly-size", `${size}rem`);
  butterflyWorld.append(element);
  return {
    element,
    icon,
    size: size * 16,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    heading: random(0, TAU),
    wander: random(0, TAU),
    state: "fly",
    target: null,
    perchHeading: 0,
    perchUntil: 0,
    flap: random(0, TAU),
    glide: 0,
    excite: 0,
    foldTimer: random(1, 4),
    foldProgress: -1,
    cruise: random(34, 58),
    f1: random(0.25, 0.6),
    f2: random(0.9, 1.7),
    s1: random(0, TAU),
    s2: random(0, TAU),
    wings: 1,
    bob: 0,
    takeoffBoost: 0,
  };
}

const butterflies = Array.from({ length: BUTTERFLY_COUNT }, (_, index) => createButterfly(index));

function scatterButterfly(butterfly, index, onlyBelow = 0) {
  const top = onlyBelow;
  const band = (worldHeight - top) / BUTTERFLY_COUNT;
  butterfly.x = random(60, window.innerWidth - 60);
  butterfly.y = clamp(top + band * (index + random(0.1, 0.9)), 60, worldHeight - 60);
  butterfly.state = "fly";
  butterfly.target = null;
  butterfly.vx = Math.cos(butterfly.wander) * butterfly.cruise;
  butterfly.vy = Math.sin(butterfly.wander) * butterfly.cruise;
}

function resizeWorld() {
  worldHeight = pageHeight();
  butterflyWorld.style.height = `${worldHeight}px`;
}

const landingSelectors = [
  ".section-heading h2",
  ".ghost-heading",
  ".presentation-lead",
  ".icon-badge",
  ".path-option-word",
  ".about-panel",
  ".timeline li",
  ".github-image-link",
  ".contact-panel",
  ".contact-band h2",
  ".cover-title figure",
  ".cover-subtitle",
  ".gallery-card.is-active",
  ".repo-feed",
];

function documentRect(element) {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height,
  };
}

function findLandingSpot(butterfly) {
  const viewTop = window.scrollY - 200;
  const viewBottom = window.scrollY + window.innerHeight + 200;
  const nearView = butterfly.y > viewTop && butterfly.y < viewBottom;
  const candidates = [];
  document.querySelectorAll(landingSelectors.join(",")).forEach((element) => {
    if (!element.getClientRects().length) return;
    const rect = documentRect(element);
    if (rect.width < 24 || rect.top < 40) return;
    const centerX = rect.left + rect.width / 2;
    const distance = Math.hypot(centerX - butterfly.x, rect.top - butterfly.y);
    if (distance > (nearView ? 650 : 900)) return;
    candidates.push({ rect, distance });
  });
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.distance - b.distance);
  const pick = candidates[Math.floor(Math.random() * Math.min(5, candidates.length))].rect;
  const taken = butterflies.some(
    (other) => other.target && Math.abs(other.target.y - pick.top) < 12 && other !== butterfly,
  );
  const x = pick.left + random(0.12, 0.88) * pick.width;
  if (taken && Math.random() < 0.6) return null;
  return { x: clamp(x, 20, window.innerWidth - 20), y: pick.top + 2 - butterfly.size * 0.2 };
}

function startLanding(butterfly) {
  const spot = findLandingSpot(butterfly);
  if (!spot) return;
  butterfly.state = "land";
  butterfly.target = spot;
  butterfly.perchHeading = -Math.PI / 2 + random(-0.55, 0.55);
}

function takeOff(butterfly, awayX, awayY) {
  butterfly.state = "fly";
  butterfly.target = null;
  butterfly.element.classList.remove("is-perched");
  let angle = random(-Math.PI * 0.85, -Math.PI * 0.15);
  if (awayX !== undefined) {
    angle = Math.atan2(butterfly.y - awayY, butterfly.x - awayX) + random(-0.5, 0.5);
    angle = angleLerp(angle, -Math.PI / 2, 0.35);
    butterfly.excite = 1;
  }
  butterfly.wander = angle;
  butterfly.takeoffBoost = 0.6;
  butterfly.vx = Math.cos(angle) * 70;
  butterfly.vy = Math.sin(angle) * 70;
  butterfly.glide = 0;
}

function updateButterfly(butterfly, dt, time, idle) {
  const width = window.innerWidth;

  if (butterfly.state === "perch") {
    butterfly.bob = 0;
    const distance = Math.hypot(butterfly.x - pointer.x, butterfly.y - pointer.y);
    if (distance < PERCH_ALARM_RADIUS) {
      takeOff(butterfly, pointer.x, pointer.y);
    } else if (time > butterfly.perchUntil || (!idle && Math.random() < dt / 14)) {
      takeOff(butterfly);
    } else {
      // Asas abertas, com uma fechadinha lenta de vez em quando
      if (butterfly.foldProgress < 0) {
        butterfly.foldTimer -= dt;
        butterfly.wings += (1 - butterfly.wings) * Math.min(1, dt * 3);
        if (butterfly.foldTimer <= 0) butterfly.foldProgress = 0;
      } else {
        butterfly.foldProgress += dt / 1.4;
        const p = Math.min(1, butterfly.foldProgress);
        butterfly.wings = 1 - 0.72 * Math.sin(Math.PI * p);
        if (p >= 1) {
          butterfly.foldProgress = -1;
          butterfly.foldTimer = random(1.8, 6);
        }
      }
      return;
    }
  }

  let desiredX;
  let desiredY;
  const excite = butterfly.excite;

  if (butterfly.state === "land" && butterfly.target) {
    const dx = butterfly.target.x - butterfly.x;
    const dy = butterfly.target.y - butterfly.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 2.5) {
      butterfly.state = "perch";
      butterfly.x = butterfly.target.x;
      butterfly.y = butterfly.target.y;
      butterfly.vx = 0;
      butterfly.vy = 0;
      butterfly.heading = butterfly.perchHeading;
      butterfly.perchUntil = time + random(14000, 38000);
      butterfly.foldTimer = random(0.6, 2);
      butterfly.foldProgress = -1;
      butterfly.element.classList.add("is-perched");
      return;
    }
    const approach = Math.min(butterfly.cruise, distance * 1.3 + 6);
    const wobble = Math.min(18, distance * 0.35) * Math.sin(time * 0.004 + butterfly.s1);
    desiredX = (dx / distance) * approach + (-dy / distance) * wobble;
    desiredY = (dy / distance) * approach + (dx / distance) * wobble;
  } else {
    butterfly.wander +=
      (Math.sin(time * 0.001 * butterfly.f1 * TAU + butterfly.s1) * 1.05 +
        Math.sin(time * 0.001 * butterfly.f2 * TAU + butterfly.s2) * 0.6) *
      dt *
      1.5;
    const speed = butterfly.cruise * (1 + excite * 1.4 + butterfly.takeoffBoost);
    desiredX = Math.cos(butterfly.wander) * speed;
    desiredY = Math.sin(butterfly.wander) * speed;

    const margin = 80;
    let steerX = 0;
    let steerY = 0;
    if (butterfly.x < margin) steerX += (margin - butterfly.x) * 1.6;
    if (butterfly.x > width - margin) steerX -= (butterfly.x - (width - margin)) * 1.6;
    if (butterfly.y < margin) steerY += (margin - butterfly.y) * 1.6;
    if (butterfly.y > worldHeight - margin) steerY -= (butterfly.y - (worldHeight - margin)) * 1.6;
    if (steerX || steerY) {
      desiredX += steerX;
      desiredY += steerY;
      butterfly.wander = angleLerp(butterfly.wander, Math.atan2(desiredY, desiredX), dt * 1.2);
    }
  }

  // Foge do cursor com suavidade
  const awayX = butterfly.x - pointer.x;
  const awayY = butterfly.y - pointer.y;
  const pointerDistance = Math.hypot(awayX, awayY);
  if (pointerDistance < FLEE_RADIUS && pointerDistance > 0.001) {
    const force = 1 - pointerDistance / FLEE_RADIUS;
    desiredX += (awayX / pointerDistance) * 240 * force;
    desiredY += (awayY / pointerDistance) * 240 * force;
    butterfly.excite = Math.max(butterfly.excite, force);
    if (butterfly.state === "land") butterfly.state = "fly";
    butterfly.wander = angleLerp(butterfly.wander, Math.atan2(awayY, awayX), dt * 2.5 * force);
  }

  const response = butterfly.state === "land" ? 3.2 : 2.1;
  butterfly.vx += (desiredX - butterfly.vx) * Math.min(1, dt * response);
  butterfly.vy += (desiredY - butterfly.vy) * Math.min(1, dt * response);
  butterfly.x += butterfly.vx * dt;
  butterfly.y += butterfly.vy * dt;
  butterfly.x = clamp(butterfly.x, 8, width - 8);
  butterfly.y = clamp(butterfly.y, 8, worldHeight - 8);

  butterfly.excite = Math.max(0, butterfly.excite - dt * 0.55);
  butterfly.takeoffBoost = Math.max(0, butterfly.takeoffBoost - dt * 0.8);

  const speed = Math.hypot(butterfly.vx, butterfly.vy);
  let headingTarget = speed > 3 ? Math.atan2(butterfly.vy, butterfly.vx) : butterfly.heading;
  if (butterfly.state === "land" && butterfly.target) {
    const remaining = Math.hypot(butterfly.target.x - butterfly.x, butterfly.target.y - butterfly.y);
    if (remaining < 40) headingTarget = angleLerp(headingTarget, butterfly.perchHeading, 1 - remaining / 40);
  }
  butterfly.heading = angleLerp(butterfly.heading, headingTarget, dt * 5);

  // Batidas de asa com pequenos planeios
  if (butterfly.glide > 0) {
    butterfly.glide -= dt;
    butterfly.wings += (0.96 - butterfly.wings) * Math.min(1, dt * 8);
    butterfly.bob *= 0.9;
  } else {
    const rate = 5.2 + butterfly.excite * 4 + butterfly.takeoffBoost * 3 + random(-0.3, 0.3);
    butterfly.flap += TAU * rate * dt;
    const open = 0.5 + 0.5 * Math.cos(butterfly.flap);
    butterfly.wings = 0.16 + 0.84 * Math.pow(open, 0.75);
    butterfly.bob = Math.sin(butterfly.flap) * 1.8;
    if (butterfly.excite < 0.1 && butterfly.state === "fly" && Math.random() < dt * 0.3) {
      butterfly.glide = random(0.25, 0.7);
    }
  }

  if (butterfly.state === "fly") {
    const wantsToLand = idle ? Math.random() < dt * 0.22 : Math.random() < dt / 40;
    if (wantsToLand && butterfly.excite < 0.05) startLanding(butterfly);
  }
}

function renderButterfly(butterfly) {
  const top = window.scrollY - 120;
  const bottom = window.scrollY + window.innerHeight + 120;
  if (butterfly.y < top || butterfly.y > bottom) {
    if (!butterfly.hidden) {
      butterfly.element.style.visibility = "hidden";
      butterfly.hidden = true;
    }
    return;
  }
  if (butterfly.hidden) {
    butterfly.element.style.visibility = "";
    butterfly.hidden = false;
  }
  butterfly.element.style.transform =
    `translate3d(${butterfly.x.toFixed(1)}px, ${(butterfly.y + butterfly.bob).toFixed(1)}px, 0) translate(-50%, -50%) rotate(${(butterfly.heading + Math.PI / 2).toFixed(3)}rad)`;
  butterfly.icon.style.transform = `scaleX(${butterfly.wings.toFixed(3)})`;
}

let previousFrame = 0;
function animateButterflies(time) {
  const dt = previousFrame ? Math.min((time - previousFrame) / 1000, 0.05) : 0;
  previousFrame = time;
  const idle = time - pointer.lastMove > IDLE_BEFORE_LANDING;
  butterflies.forEach((butterfly) => {
    updateButterfly(butterfly, dt, time, idle);
    renderButterfly(butterfly);
  });
  window.requestAnimationFrame(animateButterflies);
}

resizeWorld();
butterflies.forEach((butterfly, index) => scatterButterfly(butterfly, index));

if (reducedMotion) {
  butterflies.forEach((butterfly) => {
    butterfly.heading = -Math.PI / 2;
    butterfly.wings = 1;
    renderButterfly(butterfly);
  });
} else {
  window.requestAnimationFrame(animateButterflies);

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.x = event.clientX + window.scrollX;
      pointer.y = event.clientY + window.scrollY;
      pointer.lastMove = performance.now();
      pointer.hasMouse = true;
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });
  window.addEventListener(
    "scroll",
    () => {
      if (!pointer.hasMouse) return;
      pointer.x = pointer.clientX + window.scrollX;
      pointer.y = pointer.clientY + window.scrollY;
    },
    { passive: true },
  );
}

function handleLayoutChange() {
  const previousHeight = worldHeight;
  resizeWorld();
  butterflies.forEach((butterfly) => {
    if (butterfly.state !== "fly") takeOff(butterfly);
  });
  if (worldHeight > previousHeight * 1.3) {
    const viewTop = window.scrollY;
    const viewBottom = viewTop + window.innerHeight;
    butterflies.forEach((butterfly, index) => {
      const visible = butterfly.y > viewTop - 50 && butterfly.y < viewBottom + 50;
      if (!visible || index % 3 === 0) scatterButterfly(butterfly, index, viewBottom + 40);
    });
  }
}

window.addEventListener("portfolio:layout", () => window.setTimeout(handleLayoutChange, 60));
window.addEventListener("resize", resizeWorld);
if ("ResizeObserver" in window) {
  new ResizeObserver(resizeWorld).observe(select("main"));
}

/* ---------- Capa: profundidade com o cursor ---------- */

const cover = select("#inicio");
if (!reducedMotion) {
  cover.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const bounds = cover.getBoundingClientRect();
      const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
      const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
      cover.style.setProperty("--hero-shift-x", `${horizontal * 12}px`);
      cover.style.setProperty("--hero-shift-x-reverse", `${horizontal * -12}px`);
      cover.style.setProperty("--hero-shift-y", `${vertical * 10}px`);
      cover.style.setProperty("--hero-rotate-x", `${vertical * -4}deg`);
      cover.style.setProperty("--hero-rotate-y", `${horizontal * 5}deg`);
      cover.style.setProperty("--hero-image-rotate-y", `${horizontal * -2}deg`);
      cover.style.setProperty("--hx", horizontal.toFixed(3));
      cover.style.setProperty("--hy", vertical.toFixed(3));
      const figure = cover.querySelector(".cover-title figure");
      if (figure) {
        const box = figure.getBoundingClientRect();
        figure.style.setProperty("--sheen-x", `${((event.clientX - box.left) / box.width) * 100}%`);
        figure.style.setProperty("--sheen-y", `${((event.clientY - box.top) / box.height) * 100}%`);
      }
    },
    { passive: true },
  );
  cover.addEventListener("pointerleave", () => {
    [
      "--hero-shift-x",
      "--hero-shift-x-reverse",
      "--hero-shift-y",
      "--hero-rotate-x",
      "--hero-rotate-y",
      "--hero-image-rotate-y",
      "--hx",
      "--hy",
    ].forEach((property) => cover.style.removeProperty(property));
  });
}

/* ---------- Navegação, progresso e revelação ---------- */

const navigation = select("#site-nav");
const navigationLinks = [...navigation.querySelectorAll("a[href^='#']")];
const progressBar = select("#scroll-progress");
let scrollFramePending = false;

function updateScrollState() {
  const scrollY = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const isNavigationVisible = scrollY > window.innerHeight * 0.7;

  progressBar.style.transform = `scaleX(${scrollRange > 0 ? scrollY / scrollRange : 0})`;
  navigation.classList.toggle("is-visible", isNavigationVisible);
  navigation.inert = !isNavigationVisible;
  navigation.setAttribute("aria-hidden", String(!isNavigationVisible));

  if (!reducedMotion && scrollY < window.innerHeight * 1.2) {
    cover.style.setProperty("--cover-parallax", `${scrollY * 0.5}px`);
    cover.style.setProperty("--figure-parallax", `${scrollY * -0.12}px`);
  }
  scrollFramePending = false;
}

function scheduleScrollUpdate() {
  if (scrollFramePending) return;
  scrollFramePending = true;
  window.requestAnimationFrame(updateScrollState);
}

window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
window.addEventListener("resize", scheduleScrollUpdate);
updateScrollState();

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigationLinks.forEach((link) => {
          link.classList.toggle("is-current", link.hash === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );

  ["inicio", "apresentacao", "escolha", "sobre", "projetos", "habilidades", "contato"].forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
}

/* ---------- Galeria antes e depois (Edição) ---------- */

let activeGallery = null;

function destroyGallery() {
  if (activeGallery) activeGallery.destroy();
  activeGallery = null;
}

function buildGallery(data) {
  const items = data.gallery || [];
  const wrapper = createElement("div", "gallery");
  if (data.galleryNote) wrapper.append(createElement("p", "gallery-note", data.galleryNote));
  if (!items.length) return wrapper;

  const stage = createElement("div", "gallery-stage");
  stage.setAttribute("role", "region");
  stage.setAttribute("aria-roledescription", "carrossel");
  stage.setAttribute("aria-label", "Fotos antes e depois da edição");
  stage.tabIndex = 0;

  const cards = items.map((item, index) => {
    const card = createElement("figure", "gallery-card");
    card.dataset.index = String(index);
    card.setAttribute("aria-roledescription", "foto");
    card.setAttribute("aria-label", `${item.title}, ${index + 1} de ${items.length}`);

    const compare = createElement("div", "compare");
    compare.style.setProperty("--pos", "50%");

    const edited = createElement("img", "compare-edit");
    edited.alt = `${item.title} depois da edição`;
    edited.decoding = "async";
    edited.draggable = false;
    edited.dataset.src = item.edit;

    const rawClip = createElement("div", "compare-raw");
    const raw = createElement("img");
    raw.alt = `${item.title} antes da edição`;
    raw.decoding = "async";
    raw.draggable = false;
    raw.dataset.src = item.raw;
    rawClip.append(raw);

    const line = createElement("div", "compare-line");
    const handle = createElement("span", "compare-handle");
    handle.setAttribute("role", "slider");
    handle.setAttribute("aria-label", "Comparar antes e depois");
    handle.setAttribute("aria-valuemin", "0");
    handle.setAttribute("aria-valuemax", "100");
    handle.setAttribute("aria-valuenow", "50");
    handle.tabIndex = -1;
    handle.innerHTML = '<svg viewBox="0 0 24 12" aria-hidden="true"><path d="M7 1 2 6l5 5M17 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    line.append(handle);

    compare.append(
      edited,
      rawClip,
      line,
      createElement("span", "compare-pill compare-pill-before", "Antes"),
      createElement("span", "compare-pill compare-pill-after", "Depois"),
    );
    card.append(compare, createElement("figcaption", "", item.title));
    stage.append(card);
    return { card, compare, edited, raw, handle, pos: 50, loaded: false };
  });

  const controls = createElement("div", "gallery-controls");
  const prev = createElement("button", "gallery-arrow");
  prev.type = "button";
  prev.setAttribute("aria-label", "Foto anterior");
  prev.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const next = createElement("button", "gallery-arrow");
  next.type = "button";
  next.setAttribute("aria-label", "Próxima foto");
  next.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const progress = createElement("div", "gallery-progress");
  const segments = items.map((item, index) => {
    const segment = createElement("button", "gallery-segment");
    segment.type = "button";
    segment.setAttribute("aria-label", `Ir para ${item.title}`);
    segment.addEventListener("click", () => goTo(index));
    progress.append(segment);
    return segment;
  });
  const counter = createElement("span", "gallery-counter");
  const fullButton = createElement("button", "gallery-full", "Ver em resolução real");
  fullButton.type = "button";
  controls.append(prev, progress, counter, next);

  const footer = createElement("div", "gallery-footer");
  footer.append(fullButton);

  const live = createElement("p", "visually-hidden");
  live.setAttribute("aria-live", "polite");

  wrapper.append(stage, controls, footer, live);

  let active = 0;
  const pad = (value) => String(value).padStart(2, "0");

  function circularOffset(index) {
    let offset = index - active;
    const half = items.length / 2;
    if (offset > half) offset -= items.length;
    if (offset < -half) offset += items.length;
    return offset;
  }

  function ensureLoaded(entry) {
    if (entry.loaded) return;
    entry.loaded = true;
    entry.edited.src = entry.edited.dataset.src;
    entry.raw.src = entry.raw.dataset.src;
  }

  function setPos(entry, value) {
    entry.pos = clamp(value, 0, 100);
    entry.compare.style.setProperty("--pos", `${entry.pos}%`);
    entry.handle.setAttribute("aria-valuenow", String(Math.round(entry.pos)));
  }

  function sweep(entry) {
    if (reducedMotion) return;
    entry.compare.classList.remove("is-sweeping");
    setPos(entry, 88);
    void entry.compare.offsetWidth;
    entry.compare.classList.add("is-sweeping");
    window.requestAnimationFrame(() => setPos(entry, 50));
    window.setTimeout(() => entry.compare.classList.remove("is-sweeping"), 1500);
  }

  function layout() {
    cards.forEach((entry, index) => {
      const offset = circularOffset(index);
      const distance = Math.abs(offset);
      entry.card.style.setProperty("--offset", String(offset));
      entry.card.style.setProperty("--distance", String(distance));
      entry.card.classList.toggle("is-active", offset === 0);
      entry.card.classList.toggle("is-hidden", distance > 2);
      entry.card.setAttribute("aria-hidden", String(offset !== 0));
      entry.handle.tabIndex = offset === 0 ? 0 : -1;
      if (distance <= 2) ensureLoaded(entry);
    });
    segments.forEach((segment, index) => {
      segment.classList.toggle("is-active", index === active);
      segment.classList.toggle("is-past", index < active);
    });
    counter.textContent = `${pad(active + 1)} / ${pad(items.length)}`;
    live.textContent = `${items[active].title}, foto ${active + 1} de ${items.length}`;
  }

  function goTo(index) {
    const target = (index + items.length) % items.length;
    if (target === active) return;
    active = target;
    layout();
    sweep(cards[active]);
  }

  prev.addEventListener("click", () => goTo(active - 1));
  next.addEventListener("click", () => goTo(active + 1));

  // Arrastar a barra (qualquer ponto da foto ativa) ou deslizar para trocar
  let drag = null;
  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const cardElement = event.target.closest(".gallery-card");
    const entry = cardElement && cards[Number(cardElement.dataset.index)];
    if (entry && cardElement.classList.contains("is-active")) {
      const rect = entry.compare.getBoundingClientRect();
      drag = { type: "compare", entry, rect };
      entry.compare.classList.remove("is-sweeping");
      entry.compare.classList.add("is-dragging");
      setPos(entry, ((event.clientX - rect.left) / rect.width) * 100);
    } else {
      drag = { type: "swipe", startX: event.clientX, card: entry };
    }
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener("pointermove", (event) => {
    if (!drag) return;
    if (drag.type === "compare") {
      setPos(drag.entry, ((event.clientX - drag.rect.left) / drag.rect.width) * 100);
    }
  });
  const endDrag = (event) => {
    if (!drag) return;
    if (drag.type === "compare") {
      drag.entry.compare.classList.remove("is-dragging");
    } else {
      const delta = event.clientX - drag.startX;
      if (Math.abs(delta) > 45) goTo(active + (delta < 0 ? 1 : -1));
      else if (drag.card) goTo(Number(drag.card.card.dataset.index));
    }
    drag = null;
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", () => {
    if (drag?.type === "compare") drag.entry.compare.classList.remove("is-dragging");
    drag = null;
  });

  let wheelLock = 0;
  stage.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY) || Math.abs(event.deltaX) < 12) return;
      event.preventDefault();
      const now = performance.now();
      if (now < wheelLock) return;
      wheelLock = now + 650;
      goTo(active + (event.deltaX > 0 ? 1 : -1));
    },
    { passive: false },
  );

  stage.addEventListener("keydown", (event) => {
    const onHandle = event.target.classList?.contains("compare-handle");
    if (onHandle && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      setPos(cards[active], cards[active].pos + (event.key === "ArrowLeft" ? -5 : 5));
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    }
  });

  fullButton.addEventListener("click", () => openLightbox(items[active]));

  layout();
  let started = false;
  const startObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting) || started) return;
            started = true;
            sweep(cards[active]);
            startObserver.disconnect();
          },
          { threshold: 0.35 },
        )
      : null;
  if (startObserver) startObserver.observe(stage);

  activeGallery = {
    destroy() {
      if (startObserver) startObserver.disconnect();
    },
  };

  return wrapper;
}

/* ---------- Visualizador em resolução real ---------- */

let lightbox = null;

function openLightbox(item) {
  if (!lightbox) {
    const box = createElement("div", "lightbox");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Foto em resolução real");
    const scroller = createElement("div", "lightbox-scroller");
    const image = createElement("img", "lightbox-image");
    image.draggable = false;
    scroller.append(image);
    const close = createElement("button", "lightbox-close");
    close.type = "button";
    close.setAttribute("aria-label", "Fechar");
    close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
    const info = createElement("p", "lightbox-info");
    const spinner = createElement("span", "lightbox-loading");
    box.append(scroller, close, info, spinner);
    document.body.append(box);

    const hide = () => {
      box.classList.remove("is-open", "is-zoomed");
      root.classList.remove("has-lightbox");
      window.setTimeout(() => {
        if (!box.classList.contains("is-open")) box.hidden = true;
      }, 500);
    };
    close.addEventListener("click", hide);
    box.addEventListener("click", (event) => {
      if (event.target === box || event.target === scroller) hide();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && box.classList.contains("is-open")) hide();
    });
    image.addEventListener("click", (event) => {
      const rect = image.getBoundingClientRect();
      const ratioX = (event.clientX - rect.left) / rect.width;
      const ratioY = (event.clientY - rect.top) / rect.height;
      box.classList.toggle("is-zoomed");
      if (box.classList.contains("is-zoomed")) {
        window.requestAnimationFrame(() => {
          scroller.scrollLeft = ratioX * image.offsetWidth - scroller.clientWidth / 2;
          scroller.scrollTop = ratioY * image.offsetHeight - scroller.clientHeight / 2;
        });
      }
    });
    lightbox = { box, image, info, close };
  }

  const { box, image, info, close } = lightbox;
  box.hidden = false;
  box.classList.remove("is-zoomed");
  box.classList.add("is-loading");
  info.textContent = `${item.title} · carregando…`;
  image.onload = () => {
    box.classList.remove("is-loading");
    info.textContent = `${item.title} · ${image.naturalWidth} × ${image.naturalHeight} px · clique para ver em 100%`;
  };
  image.alt = `${item.title}, versão editada em resolução real`;
  image.src = item.full || item.edit;
  root.classList.add("has-lightbox");
  window.requestAnimationFrame(() => box.classList.add("is-open"));
  close.focus({ preventScroll: true });
}

/* ---------- Repositórios do GitHub (Programação) ---------- */

function buildRepoFeed() {
  const feed = createElement("div", "repo-feed");
  const head = createElement("div", "repo-feed-head");
  const label = createElement("span", "", "Repositórios");
  const count = createElement("span", "repo-count");
  head.append(label, count);
  const windowElement = createElement("div", "repo-window");
  const track = createElement("ul", "repo-track");
  windowElement.append(track);
  const status = createElement("p", "repo-status", "Carregando repositórios…");
  feed.append(head, windowElement, status);

  const user = site.githubUser;
  if (!user) {
    feed.hidden = true;
    return feed;
  }

  const render = (repos) => {
    status.remove();
    if (!repos.length) {
      windowElement.replaceChildren(createElement("p", "repo-status", "Nenhum repositório público por enquanto."));
      return;
    }
    count.textContent = pad2(repos.length);
    const makeItem = (repo) => {
      const item = createElement("li", "repo-item");
      const top = createElement("div", "repo-top");
      top.append(createElement("strong", "repo-name", repo.name));
      if (repo.fork) top.append(createElement("span", "repo-tag", "fork"));
      item.append(top);
      item.append(createElement("p", "repo-desc", repo.description || "Sem descrição."));
      const meta = createElement("div", "repo-meta");
      if (repo.language) {
        const language = createElement("span", "repo-lang", repo.language);
        meta.append(language);
      }
      meta.append(createElement("span", "", `★ ${repo.stars}`));
      meta.append(createElement("span", "", `atualizado em ${repo.updated}`));
      item.append(meta);
      return item;
    };
    repos.forEach((repo) => track.append(makeItem(repo)));
    if (repos.length > 2 && !reducedMotion) {
      repos.forEach((repo) => {
        const clone = makeItem(repo);
        clone.setAttribute("aria-hidden", "true");
        track.append(clone);
      });
      feed.classList.add("is-rolling");
      track.style.setProperty("--repo-duration", `${repos.length * 5.5}s`);
    }
  };

  const pad2 = (value) => String(value).padStart(2, "0");
  const cacheKey = `repos:${user}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
    if (cached && Date.now() - cached.time < 10 * 60 * 1000) {
      render(cached.repos);
      return feed;
    }
  } catch {
    /* sem cache */
  }

  fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed`, {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then((list) => {
      const repos = list
        .filter((repo) => !repo.archived)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .map((repo) => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          fork: repo.fork,
          updated: new Date(repo.pushed_at).toLocaleDateString("pt-BR"),
        }));
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), repos }));
      } catch {
        /* armazenamento indisponível */
      }
      render(repos);
    })
    .catch(() => {
      status.textContent = "Não foi possível carregar os repositórios agora.";
    });

  return feed;
}

/* ---------- Barra de rolagem estilo lente ---------- */

(function createLensScroll() {
  const lens = createElement("div", "lens-scroll");
  lens.setAttribute("aria-hidden", "true");
  const ticks = createElement("div", "lens-ticks");
  const mark = createElement("span", "lens-mark");
  lens.append(ticks, mark);
  document.body.append(lens);

  let shown = 0;
  let dragging = null;

  function frame() {
    const target = window.scrollY;
    shown += (target - shown) * (reducedMotion ? 1 : 0.14);
    if (Math.abs(target - shown) < 0.05) shown = target;
    ticks.style.backgroundPositionY = `${(-shown * 0.45).toFixed(2)}px`;
    const range = document.documentElement.scrollHeight - window.innerHeight;
    lens.style.setProperty("--lens-progress", range > 0 ? String(window.scrollY / range) : "0");
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);

  lens.addEventListener("pointerdown", (event) => {
    dragging = { y: event.clientY, scroll: window.scrollY };
    lens.classList.add("is-dragging");
    lens.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  lens.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const range = document.documentElement.scrollHeight - window.innerHeight;
    const delta = ((event.clientY - dragging.y) / window.innerHeight) * range;
    window.scrollTo({ top: dragging.scroll + delta, behavior: "instant" });
  });
  const stop = () => {
    dragging = null;
    lens.classList.remove("is-dragging");
  };
  lens.addEventListener("pointerup", stop);
  lens.addEventListener("pointercancel", stop);
})();

/* ---------- Plantinhas nos cantos ---------- */

(function createPlants() {
  const ns = svgNamespace;
  const seeded = (seed) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  function path(d, className) {
    const element = document.createElementNS(ns, "path");
    element.setAttribute("d", d);
    if (className) element.setAttribute("class", className);
    return element;
  }

  function quadPoint(p0, c, p1, t) {
    const u = 1 - t;
    return {
      x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
      y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
    };
  }

  function quadAngle(p0, c, p1, t) {
    const dx = 2 * (1 - t) * (c.x - p0.x) + 2 * t * (p1.x - c.x);
    const dy = 2 * (1 - t) * (c.y - p0.y) + 2 * t * (p1.y - c.y);
    return Math.atan2(dy, dx);
  }

  function leafPath(x, y, angle, length, width) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const px = -sin;
    const py = cos;
    const tipX = x + cos * length;
    const tipY = y + sin * length;
    const midX = x + cos * length * 0.45;
    const midY = y + sin * length * 0.45;
    const f = (n) => n.toFixed(1);
    return {
      blade: `M${f(x)} ${f(y)}Q${f(midX + px * width)} ${f(midY + py * width)} ${f(tipX)} ${f(tipY)}Q${f(midX - px * width)} ${f(midY - py * width)} ${f(x)} ${f(y)}Z`,
      rib: `M${f(x)} ${f(y)}L${f(x + cos * length * 0.82)} ${f(y + sin * length * 0.82)}`,
    };
  }

  function buildPlant(seed) {
    const random01 = seeded(seed);
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 220 260");
    svg.setAttribute("class", "plant");
    svg.setAttribute("aria-hidden", "true");
    const lean = document.createElementNS(ns, "g");
    lean.setAttribute("class", "plant-lean");
    svg.append(lean);

    const stems = [
      { x: 30, tipX: 18, tipY: 40, bend: -26, leaves: 7, kind: "leafy" },
      { x: 52, tipX: 92, tipY: 70, bend: 30, leaves: 5, kind: "fern" },
      { x: 40, tipX: 60, tipY: 120, bend: 4, leaves: 3, kind: "bud" },
      { x: 70, tipX: 140, tipY: 150, bend: 40, leaves: 4, kind: "leafy" },
      { x: 20, tipX: 4, tipY: 150, bend: -12, leaves: 0, kind: "grass" },
      { x: 60, tipX: 120, tipY: 205, bend: 30, leaves: 0, kind: "grass" },
      { x: 46, tipX: 36, tipY: 175, bend: -8, leaves: 0, kind: "grass" },
    ];

    stems.forEach((stem, index) => {
      const group = document.createElementNS(ns, "g");
      group.setAttribute("class", "plant-stem");
      group.style.setProperty("--sway-duration", `${(5 + random01() * 4).toFixed(2)}s`);
      group.style.setProperty("--sway-delay", `${(-random01() * 6).toFixed(2)}s`);
      group.style.setProperty("--sway-angle", `${(1.6 + random01() * 2.2).toFixed(2)}deg`);
      const p0 = { x: stem.x, y: 262 };
      const p1 = { x: stem.tipX, y: stem.tipY };
      const c = { x: (p0.x + p1.x) / 2 + stem.bend, y: (p0.y + p1.y) / 2 + 30 };
      group.append(path(`M${p0.x} ${p0.y}Q${c.x} ${c.y} ${p1.x} ${p1.y}`, stem.kind === "grass" ? "plant-blade" : "plant-line"));

      if (stem.kind === "leafy") {
        for (let leaf = 0; leaf < stem.leaves; leaf += 1) {
          const t = 0.25 + (leaf / stem.leaves) * 0.72;
          const point = quadPoint(p0, c, p1, t);
          const side = leaf % 2 === 0 ? 1 : -1;
          const angle = quadAngle(p0, c, p1, t) + side * (0.75 + random01() * 0.3);
          const size = 24 * (1.15 - t * 0.55);
          const shape = leafPath(point.x, point.y, angle, size, size * 0.34);
          group.append(path(shape.blade, "plant-leaf"), path(shape.rib, "plant-rib"));
        }
      } else if (stem.kind === "fern") {
        for (let leaf = 0; leaf < 16; leaf += 1) {
          const t = 0.3 + (leaf / 16) * 0.68;
          const point = quadPoint(p0, c, p1, t);
          const side = leaf % 2 === 0 ? 1 : -1;
          const angle = quadAngle(p0, c, p1, t) + side * 1.05;
          const size = 15 * (1.2 - t * 0.85);
          const shape = leafPath(point.x, point.y, angle, size, size * 0.3);
          group.append(path(shape.blade, "plant-leaf"));
        }
      } else if (stem.kind === "bud") {
        const angle = quadAngle(p0, c, p1, 1);
        const bud = leafPath(p1.x, p1.y, angle, 13, 6);
        const left = leafPath(p1.x, p1.y, angle - 0.55, 11, 4);
        const right = leafPath(p1.x, p1.y, angle + 0.55, 11, 4);
        group.append(path(left.blade, "plant-leaf"), path(right.blade, "plant-leaf"), path(bud.blade, "plant-leaf plant-bud"));
        for (let leaf = 0; leaf < stem.leaves; leaf += 1) {
          const t = 0.35 + leaf * 0.2;
          const point = quadPoint(p0, c, p1, t);
          const side = leaf % 2 === 0 ? 1 : -1;
          const shape = leafPath(point.x, point.y, quadAngle(p0, c, p1, t) + side * 0.9, 16, 5);
          group.append(path(shape.blade, "plant-leaf"), path(shape.rib, "plant-rib"));
        }
      }
      lean.append(group);
      if (index === 0) group.classList.add("plant-stem-main");
    });
    return svg;
  }

  const plants = [
    { element: createElement("div", "plant-corner plant-corner-left"), side: "left" },
    { element: createElement("div", "plant-corner plant-corner-right"), side: "right" },
  ];
  plants[0].element.append(buildPlant(11));
  plants[1].element.append(buildPlant(29));
  plants.forEach(({ element }) => {
    element.setAttribute("aria-hidden", "true");
    document.body.append(element);
  });

  if (reducedMotion) return;
  window.addEventListener(
    "pointermove",
    (event) => {
      plants.forEach(({ element, side }) => {
        const rect = element.getBoundingClientRect();
        const baseX = side === "left" ? rect.left + rect.width * 0.25 : rect.right - rect.width * 0.25;
        const dx = event.clientX - baseX;
        const dy = event.clientY - rect.bottom;
        const distance = Math.hypot(dx, dy);
        const reach = rect.height * 1.25;
        let lean = 0;
        if (distance < reach) {
          const strength = 1 - distance / reach;
          lean = -Math.sign(dx) * strength * 7;
          if (side === "right") lean = -lean;
        }
        element.style.setProperty("--plant-lean", `${lean.toFixed(2)}deg`);
      });
    },
    { passive: true },
  );
})();
