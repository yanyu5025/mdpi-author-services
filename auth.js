/**
 * Shared MDPI auth state + header Log In / profile menu.
 */
(function () {
  const AUTH_STORAGE_KEY = "mdpi-as-auth-v1";
  const MDPI_LOGIN_BASE = "https://login.mdpi.com/login";
  const MDPI_CONNECT_URL =
    "https://www.figma.com/proto/FJTRlbOLVfbhF2b3NoezOX/MDPI-Connect?node-id=3412-8277&viewport=13665%2C-9872%2C0.64&t=vA1tgJ9ytFg4U40P-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=3412%3A8277&show-proto-sidebar=1&page-id=3198%3A21033";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadAuthState() {
    try {
      const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveAuthState(state) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  }

  function isLoggedIn() {
    return !!loadAuthState()?.loggedIn;
  }

  function getDisplayName(auth = loadAuthState()) {
    if (!auth) return "Author";
    if (auth.displayName) return auth.displayName;
    if (auth.email) return String(auth.email).split("@")[0];
    return "Author";
  }

  function getInitials(name) {
    const parts = String(name || "A")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "A";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }

  function markLoggedIn(extra = {}) {
    const previous = loadAuthState() || {};
    const displayName =
      extra.displayName || previous.displayName || getDisplayName({ ...previous, ...extra });
    saveAuthState({
      ...previous,
      loggedIn: true,
      loginPending: false,
      loggedInAt: new Date().toISOString(),
      displayName,
      ...extra,
    });
  }

  function getAuthReturnUrl(pathname) {
    const url = new URL(pathname || window.location.pathname, window.location.href);
    url.search = window.location.search;
    url.searchParams.set("auth", "success");
    url.hash = "";
    return url.toString();
  }

  function getLoginUrl(returnUrl) {
    const target = returnUrl || getAuthReturnUrl();
    return `${MDPI_LOGIN_BASE}?_target_path=${encodeURIComponent(target)}`;
  }

  function beginLoginRedirect(returnUrl) {
    saveAuthState({
      ...(loadAuthState() || {}),
      loginPending: true,
      loginStartedAt: new Date().toISOString(),
    });
    window.location.href = getLoginUrl(returnUrl);
  }

  function consumeAuthReturnParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") !== "success") return false;
    markLoggedIn({ source: "sso-return" });
    params.delete("auth");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash || ""}`;
    window.history.replaceState({}, "", next || window.location.pathname);
    return true;
  }

  function markLoggedOut() {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }

  function renderHeaderAuthHtml() {
    const t = (key, fallback) => window.MdpiI18n?.t?.(key) || fallback || key;
    if (isLoggedIn()) {
      const auth = loadAuthState() || {};
      const name = getDisplayName(auth);
      const initials = getInitials(name);
      return `
        <div class="header-profile" data-header-profile>
          <button
            type="button"
            class="header-profile-trigger"
            id="header-profile-trigger"
            aria-expanded="false"
            aria-haspopup="true"
            aria-controls="header-profile-menu"
          >
            <span class="header-profile-avatar" aria-hidden="true">${escapeHtml(initials)}</span>
            <span class="header-profile-name">${escapeHtml(name)}</span>
            <span class="header-profile-caret" aria-hidden="true"></span>
          </button>
          <div class="header-profile-menu hidden" id="header-profile-menu" role="menu" hidden>
            <a
              class="header-profile-menu-item"
              role="menuitem"
              href="${escapeHtml(MDPI_CONNECT_URL)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${escapeHtml(t("submissionHistory", "Submission History"))}
              <svg class="icon-external" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <button
              type="button"
              class="header-profile-menu-item header-profile-menu-item-button"
              role="menuitem"
              id="header-logout-btn"
            >
              ${escapeHtml(t("logOut", "Log out"))}
            </button>
          </div>
        </div>`;
    }

    return `
      <button type="button" class="btn btn-outline btn-sm header-login-btn" id="header-login-btn">
        ${escapeHtml(t("logIn", "Log In"))}
      </button>`;
  }

  function closeProfileMenu(root) {
    const trigger = root.querySelector("#header-profile-trigger");
    const menu = root.querySelector("#header-profile-menu");
    if (!trigger || !menu) return;
    trigger.setAttribute("aria-expanded", "false");
    menu.classList.add("hidden");
    menu.hidden = true;
  }

  function openProfileMenu(root) {
    const trigger = root.querySelector("#header-profile-trigger");
    const menu = root.querySelector("#header-profile-menu");
    if (!trigger || !menu) return;
    trigger.setAttribute("aria-expanded", "true");
    menu.classList.remove("hidden");
    menu.hidden = false;
  }

  function bindHeaderAuth(root) {
    root.querySelector("#header-login-btn")?.addEventListener("click", () => {
      beginLoginRedirect();
    });

    const profile = root.querySelector("[data-header-profile]");
    if (!profile) return;

    const trigger = profile.querySelector("#header-profile-trigger");
    const menu = profile.querySelector("#header-profile-menu");
    trigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = trigger.getAttribute("aria-expanded") === "true";
      if (open) closeProfileMenu(root);
      else openProfileMenu(root);
    });

    menu?.addEventListener("click", (event) => event.stopPropagation());

    root.querySelector("#header-logout-btn")?.addEventListener("click", () => {
      markLoggedOut();
      renderHeaderAuth();
      window.dispatchEvent(new CustomEvent("mdpi-auth-change", { detail: { loggedIn: false } }));
      // If mid-checkout, return to the login step.
      if (/checkout\.html$/i.test(window.location.pathname) || window.location.pathname.endsWith("/checkout.html")) {
        window.location.href = "checkout.html";
      }
    });

    document.addEventListener("click", () => closeProfileMenu(root));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeProfileMenu(root);
    });
  }

  function renderHeaderAuth() {
    document.querySelectorAll("[data-header-auth]").forEach((slot) => {
      slot.innerHTML = renderHeaderAuthHtml();
      bindHeaderAuth(slot);
    });
  }

  function initHeaderAuth() {
    consumeAuthReturnParams();
    renderHeaderAuth();
  }

  window.MdpiAuth = {
    AUTH_STORAGE_KEY,
    MDPI_CONNECT_URL,
    MDPI_LOGIN_BASE,
    loadAuthState,
    saveAuthState,
    isLoggedIn,
    markLoggedIn,
    markLoggedOut,
    getDisplayName,
    getLoginUrl,
    getAuthReturnUrl,
    beginLoginRedirect,
    consumeAuthReturnParams,
    renderHeaderAuth,
    initHeaderAuth,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeaderAuth);
  } else {
    initHeaderAuth();
  }
})();
