const releaseManifestUrl = "./assets/releases.json";
const fallbackReleaseManifest = {
  latest: "4.2.0",
  platforms: {
    windows: [
      {
        version: "4.2.0",
        date: "2026-07-08",
        file: "kuzenbox_pro-4.2.0-setup.exe",
        size: "41.4 MiB",
        package: "Windows x64 installer",
        sha256: "43B39AFAC1CC4423B144F7B07BF8293EB2D90A7E4AE8D5FDFE8137E758F43DF2",
        latest: true,
        changes: [
          "Added Smart Select for healthier automatic node selection and failover within the current group.",
          "Added Leak & Config Diagnostics, rule-set management, sing-box config validation, deprecated-field scanning, and config backup/import tools.",
          "Added automatic local config snapshots before subscription updates and destructive profile operations.",
          "Removed the top-level Ads and Document buttons to simplify the main interface while keeping feature-specific help where needed.",
        ],
      },
      {
        version: "4.1.0",
        date: "2026-06-29",
        file: "kuzenbox_pro-4.1.0-setup.exe",
        size: "39.5 MiB",
        package: "Windows x64 installer",
        sha256: "DC1EA74C4A01DFC6226BF8D3BA972FC85DA68D6F0E49791775FC0DC581FF5633",
        latest: false,
        changes: [
          "Added optional STUN/WebRTC leak protection to block STUN traffic when enabled.",
          "Installer upgrades existing KuzenBox Pro installs in place while preserving and migrating config, groups, profiles, routes, and global settings.",
          "Download site publishes KuzenBox Pro 4.1.0 as the latest Windows version.",
        ],
      },
      {
        version: "4.0.1",
        date: "2024-12-12",
        file: "kuzenbox_pro-4.0.1-setup.exe",
        size: "38.7 MiB",
        package: "Windows x64 installer",
        latest: false,
        changes: [
          "Windows proxy client with TUN-level routing.",
          "DNS leak protection, AnyTLS support, and modern sing-box routing.",
        ],
      },
    ],
    linux: [
      {
        version: "4.2.0",
        date: "2026-07-08",
        file: "kuzenbox_pro-4.2.0-linux-amd64.deb",
        size: "15.4 MiB",
        package: "Linux amd64 DEB",
        sha256: "2025020E0DBEA177572321E6243A72AD93B13D62306EBF1A83A77064F8564267",
        latest: true,
        changes: [
          "Updated Linux build to KuzenBox Pro 4.2.0 with Smart Select, diagnostics, rule-set management, config validation, and backup tools.",
          "Keeps TUN Mode, DNS leak protection, STUN/WebRTC leak protection, system proxy support, and sing-box core packaging for Debian/Ubuntu desktops.",
          "Validated in a local Ubuntu environment: DEB install, GUI launch, subscription import, TUN startup, DNS/STUN protection toggles, Smart Select, and core cap_net_admin.",
        ],
      },
      {
        version: "4.1.0",
        date: "2026-06-29",
        file: "kuzenbox_pro-4.1.0-linux-amd64.deb",
        size: "15.4 MiB",
        package: "Linux amd64 DEB",
        sha256: "D9C46C6B2776B08ADA8737EBE713C2A4FFBA630482220F4C86D5AC98ACC29B92",
        latest: false,
        changes: [
          "New Linux amd64 DEB package for Ubuntu 22.04/24.04+ and Debian 12+ desktops.",
          "Installs to /opt/kuzenbox_pro and configures cap_net_admin on the sing-box core for TUN Mode.",
          "Local Ubuntu VM checks covered GUI launch, subscription import, TUN Mode, system proxy backend, DNS leak protection, and STUN/WebRTC protection.",
        ],
      },
    ],
  },
};
const accessPasswordHash = "184dc9f5cd08a35edd6d01d5eb38782b1f87d37a79d3870c18d0c7361c20a507";
const accessSessionKey = "kuzenbox_pro_access";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeManifest = fallbackReleaseManifest;
let selectedPlatform = "windows";
let selectedReleaseList = fallbackReleaseManifest.platforms.windows;

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

function normalizeManifest(raw) {
  if (raw?.platforms?.windows && raw?.platforms?.linux) return raw;
  if (Array.isArray(raw)) {
    return {
      latest: raw.find((release) => release.latest)?.version ?? raw[0]?.version ?? fallbackReleaseManifest.latest,
      platforms: {
        windows: raw,
        linux: fallbackReleaseManifest.platforms.linux,
      },
    };
  }
  return fallbackReleaseManifest;
}

function releasesFor(platform) {
  return activeManifest.platforms[platform] ?? activeManifest.platforms.windows;
}

function downloadUrlFor(release) {
  if (selectedPlatform === "windows" && release?.latest) return "./downloads/kuzenbox_pro-setup.exe";
  return `./downloads/${release.file}`;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function renderRelease(release) {
  if (!release) return;

  const notes = document.querySelector("#release-notes");
  const label = document.querySelector("#download-label");
  const url = downloadUrlFor(release);
  const platformLabel = selectedPlatform === "linux" ? "Linux" : "Windows";

  setText("#release-version", release.version);
  setText("#release-package", release.package ?? (selectedPlatform === "linux" ? "Linux amd64 DEB" : "Windows installer"));
  setText("#release-size", release.size);
  setText("#release-sha256", release.sha256 ?? "Not listed");
  if (label) label.textContent = `Download KuzenBox Pro ${release.version} for ${platformLabel}`;

  if (notes) {
    notes.replaceChildren(
      ...(release.changes ?? []).map((change) => {
        const item = document.createElement("li");
        item.textContent = change;
        return item;
      }),
    );
  }

  document.querySelectorAll(".download-link").forEach((link) => {
    link.href = url;
    link.download = selectedPlatform === "windows" && release.latest ? "kuzenbox_pro-setup.exe" : release.file;
    link.setAttribute("aria-label", `Download KuzenBox Pro ${release.version} ${release.package ?? platformLabel}`);
  });
}

function renderPlatform(platform) {
  selectedPlatform = platform;
  selectedReleaseList = releasesFor(platform);

  document.querySelectorAll(".platform-option").forEach((button) => {
    const active = button.dataset.platform === platform;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const select = document.querySelector("#release-select");
  const latest = selectedReleaseList.find((release) => release.latest) ?? selectedReleaseList[0];

  if (select) {
    select.replaceChildren(
      ...selectedReleaseList.map((release) => {
        const option = document.createElement("option");
        option.value = release.version;
        option.textContent = `${release.version} - ${release.date}${release.latest ? " - latest" : ""}`;
        return option;
      }),
    );
    select.value = latest.version;
  }

  renderRelease(latest);
}

async function loadReleases() {
  try {
    const response = await fetch(releaseManifestUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Release manifest unavailable");
    return normalizeManifest(await response.json());
  } catch {
    return fallbackReleaseManifest;
  }
}

document.querySelector("#release-select")?.addEventListener("change", (event) => {
  const release = selectedReleaseList.find((item) => item.version === event.target.value) ?? selectedReleaseList[0];
  renderRelease(release);
});

document.querySelectorAll(".platform-option").forEach((button) => {
  button.setAttribute("aria-pressed", button.classList.contains("is-active") ? "true" : "false");
  button.addEventListener("click", () => renderPlatform(button.dataset.platform ?? selectedPlatform));
});

renderPlatform(selectedPlatform);

loadReleases().then((manifest) => {
  activeManifest = manifest;
  renderPlatform(selectedPlatform);
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
