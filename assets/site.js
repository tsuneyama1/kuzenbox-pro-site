const releaseManifestUrl = "./assets/releases.json";
const fallbackReleases = [
  {
    version: "4.1.0",
    date: "2026-06-29",
    file: "kuzenbox_pro-4.1.0-setup.exe",
    size: "39.5 MiB",
    latest: true,
    changes: [
      "Added optional STUN/WebRTC leak protection to block STUN traffic when enabled.",
      "Installer upgrades existing KuzenBox Pro installs in place while preserving and migrating config, groups, profiles, routes, and global settings.",
      "Download site now publishes KuzenBox Pro 4.1.0 as the latest version."
    ]
  },
  {
    version: "4.0.1",
    date: "2024-12-12",
    file: "kuzenbox_pro-4.0.1-setup.exe",
    size: "38.7 MiB",
    latest: false,
    changes: [
      "Windows proxy client with TUN-level routing.",
      "DNS leak protection, AnyTLS support, and modern sing-box routing."
    ]
  }
];
const accessPasswordHash = "184dc9f5cd08a35edd6d01d5eb38782b1f87d37a79d3870c18d0c7361c20a507";
const accessSessionKey = "kuzenbox_pro_access";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function unlockSite() {
  document.body.classList.remove("locked");
  runIntro();
}

function runIntro() {
  const counter = document.querySelector("#loader-count");
  if (!counter || !document.body.classList.contains("loading")) return;

  counter.textContent = "100%";
  window.setTimeout(() => document.body.classList.remove("loading"), reduceMotion ? 0 : 180);
}

if (sessionStorage.getItem(accessSessionKey) === "granted") {
  unlockSite();
}

document.querySelector("#password-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = document.querySelector("#site-password");
  const error = document.querySelector("#password-error");
  const password = input?.value ?? "";

  if ((await sha256Hex(password)) === accessPasswordHash) {
    sessionStorage.setItem(accessSessionKey, "granted");
    unlockSite();
    input.value = "";
    error.textContent = "";
    return;
  }

  error.textContent = "Incorrect password.";
  input.select();
});

function downloadUrlFor(release) {
  if (release?.latest) return "./downloads/kuzenbox_pro-setup.exe";
  return `./downloads/${release.file}`;
}

function renderRelease(release) {
  if (!release) return;

  const version = document.querySelector("#release-version");
  const size = document.querySelector("#release-size");
  const notes = document.querySelector("#release-notes");
  const label = document.querySelector("#download-label");
  const url = downloadUrlFor(release);

  if (version) version.textContent = release.version;
  if (size) size.textContent = release.size;
  if (label) label.textContent = `Download KuzenBox Pro ${release.version}`;
  if (notes) {
    notes.replaceChildren(
      ...release.changes.map((change) => {
        const item = document.createElement("li");
        item.textContent = change;
        return item;
      })
    );
  }

  document.querySelectorAll(".download-link").forEach((link) => {
    link.href = url;
    link.download = release.latest ? "kuzenbox_pro-setup.exe" : release.file;
    link.setAttribute("aria-label", `Download KuzenBox Pro ${release.version} Windows installer`);
  });
}

async function loadReleases() {
  try {
    const response = await fetch(releaseManifestUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Release manifest unavailable");
    return await response.json();
  } catch {
    return fallbackReleases;
  }
}

loadReleases().then((releases) => {
  const releaseList = Array.isArray(releases) && releases.length > 0 ? releases : fallbackReleases;
  const select = document.querySelector("#release-select");
  const latest = releaseList.find((release) => release.latest) ?? releaseList[0];

  if (select) {
    select.replaceChildren(
      ...releaseList.map((release) => {
        const option = document.createElement("option");
        option.value = release.version;
        option.textContent = `${release.version} - ${release.date}${release.latest ? " - latest" : ""}`;
        return option;
      })
    );
    select.value = latest.version;
    select.addEventListener("change", () => {
      renderRelease(releaseList.find((release) => release.version === select.value) ?? latest);
    });
  }

  renderRelease(latest);
});

const heroWord = document.querySelector("#hero-word");
const heroWords = ["every packet", "DNS queries", "AnyTLS flows", "rule sets"];

if (heroWord) {
  heroWord.textContent = heroWords[0];
}

let heroIndex = 0;
if (heroWord && !reduceMotion) {
  window.setInterval(() => {
    heroIndex = (heroIndex + 1) % heroWords.length;
    heroWord.classList.add("is-changing");

    window.setTimeout(() => {
      heroWord.textContent = heroWords[heroIndex];
      heroWord.classList.remove("is-changing");
    }, 360);
  }, 3200);
}
