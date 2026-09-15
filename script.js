function base64urlToBuffer(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = window.atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bufferToBase64url(value) {
  const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : value;
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function initStrengthToggles() {
  document.querySelectorAll(".strength-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const detail = document.getElementById(button.getAttribute("aria-controls"));
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isExpanded));
      detail.hidden = isExpanded;
      button.textContent = isExpanded ? "자세히 보기" : "접기";
    });
  });
}

function initNavigationObserver() {
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-20% 0px -55%", threshold: [0.05, 0.2, 0.5] });
  sections.forEach((section) => observer.observe(section));
}

function assertWebAuthnSupport() {
  if (!window.isSecureContext || !window.PublicKeyCredential || !navigator.credentials) {
    throw new Error("이 브라우저에서는 패스키를 사용할 수 없습니다. HTTPS 또는 localhost에서 열어 주세요.");
  }
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const raw = response.status === 204 ? "" : await response.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(response.ok
        ? "서버가 올바른 응답을 반환하지 않았습니다."
        : `서버 오류가 발생했습니다. (${response.status})`);
    }
  }
  if (!response.ok) {
    const error = new Error(data?.error || "요청을 처리하지 못했습니다.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function serializeCreationCredential(credential) {
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
      attestationObject: bufferToBase64url(credential.response.attestationObject),
      transports: credential.response.getTransports ? credential.response.getTransports() : [],
    },
  };
}

function serializeAuthenticationCredential(credential) {
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
      authenticatorData: bufferToBase64url(credential.response.authenticatorData),
      signature: bufferToBase64url(credential.response.signature),
      userHandle: credential.response.userHandle ? bufferToBase64url(credential.response.userHandle) : null,
    },
  };
}

async function startPasskeyRegistration(name) {
  assertWebAuthnSupport();
  const options = await requestJSON("/api/passkeys/register-options", { method: "POST", body: JSON.stringify({ name }) });
  const publicKey = {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    user: { ...options.user, id: base64urlToBuffer(options.user.id) },
    excludeCredentials: (options.excludeCredentials || []).map((credential) => ({ ...credential, id: base64urlToBuffer(credential.id) })),
  };
  delete publicKey.challengeId;
  const credential = await navigator.credentials.create({ publicKey });
  if (!credential) throw new Error("패스키 등록을 취소했습니다.");
  return requestJSON("/api/passkeys/register-verify", { method: "POST", body: JSON.stringify({ challengeId: options.challengeId, name, response: serializeCreationCredential(credential) }) });
}

async function startPasskeyLogin() {
  assertWebAuthnSupport();
  const options = await requestJSON("/api/auth/options", { method: "POST", body: "{}" });
  const publicKey = {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    allowCredentials: (options.allowCredentials || []).map((credential) => ({ ...credential, id: base64urlToBuffer(credential.id) })),
  };
  delete publicKey.challengeId;
  const credential = await navigator.credentials.get({ publicKey });
  if (!credential) throw new Error("패스키 로그인을 취소했습니다.");
  return requestJSON("/api/auth/verify", { method: "POST", body: JSON.stringify({ challengeId: options.challengeId, response: serializeAuthenticationCredential(credential) }) });
}

function initPrivateArea() {
  const area = document.querySelector("[data-private-area]");
  if (!area) return;

  const lockCard = area.querySelector("[data-auth-state='locked']");
  const content = area.querySelector("[data-private-content]");
  const status = area.querySelector("[data-auth-status]");
  const message = area.querySelector("[data-auth-message]");
  const loginButton = area.querySelector("[data-login-button]");
  const registerButton = area.querySelector("[data-register-button]");
  const setupPanel = area.querySelector("[data-setup-panel]");
  const passkeyName = area.querySelector("[data-passkey-name]");
  const privateGrid = area.querySelector("[data-private-grid]");
  const passkeyList = area.querySelector("[data-passkey-list]");
  const logoutButton = area.querySelector("[data-logout-button]");

  const setMessage = (text, isError = false) => {
    message.textContent = text;
    message.dataset.error = String(isError);
  };
  const setBusy = (busy, text) => {
    [loginButton, registerButton, logoutButton].forEach((button) => { if (button) button.disabled = busy; });
    if (text) setMessage(text);
  };
  const renderPrivateItems = (items) => {
    privateGrid.replaceChildren(...items.map((item) => {
      const card = document.createElement("article");
      card.className = "private-card";
      card.innerHTML = `<p class="private-card-label"></p><h4></h4><p class="private-card-body"></p>`;
      card.querySelector(".private-card-label").textContent = item.kind;
      card.querySelector("h4").textContent = item.title;
      card.querySelector(".private-card-body").textContent = item.body;
      return card;
    }));
  };
  const renderPasskeys = (passkeys) => {
    passkeyList.replaceChildren(...passkeys.map((passkey) => {
      const item = document.createElement("li");
      item.className = "passkey-item";
      item.innerHTML = `<div><strong></strong><time></time></div><button type="button" class="private-button private-button-danger">삭제</button>`;
      item.querySelector("strong").textContent = passkey.name;
      item.querySelector("time").textContent = new Date(passkey.createdAt).toLocaleDateString("ko-KR");
      item.querySelector("button").addEventListener("click", () => deletePasskey(passkey.credentialId));
      return item;
    }));
  };
  const loadPrivateItems = async () => renderPrivateItems((await requestJSON("/api/private")).items);
  const loadPasskeys = async () => renderPasskeys((await requestJSON("/api/passkeys")).passkeys);
  const renderAuthState = async (authState) => {
    const authenticated = Boolean(authState.authenticated);
    lockCard.hidden = authenticated;
    content.hidden = !authenticated;
    setupPanel.hidden = authenticated || !authState.setupAvailable;
    if (authenticated) {
      status.textContent = `${authState.user.displayName}의 개인 공간`;
      await Promise.all([loadPrivateItems(), loadPasskeys()]);
    } else {
      privateGrid.replaceChildren();
      passkeyList.replaceChildren();
      status.textContent = "잠금 상태";
    }
  };
  const fetchAuthStatus = async () => renderAuthState(await requestJSON("/api/auth/status"));
  const userMessage = (error, action) => error.name === "NotAllowedError" ? `패스키 ${action}을 취소했습니다.` : error.message;
  const register = async (input) => {
    const name = input.value.trim();
    if (!name) return setMessage("패스키 이름을 입력해 주세요.", true);
    setBusy(true, "새 패스키를 등록하고 있습니다…");
    try {
      await startPasskeyRegistration(name);
      input.value = "";
      await fetchAuthStatus();
      setMessage("패스키가 등록되었습니다.");
    } catch (error) {
      setMessage(userMessage(error, "등록"), true);
    } finally {
      setBusy(false);
    }
  };
  const login = async () => {
    setBusy(true, "패스키를 확인하고 있습니다…");
    try {
      await startPasskeyLogin();
      await fetchAuthStatus();
      setMessage("");
    } catch (error) {
      setMessage(userMessage(error, "로그인"), true);
    } finally {
      setBusy(false);
    }
  };
  async function deletePasskey(credentialId) {
    setBusy(true, "패스키를 삭제하고 있습니다…");
    try {
      await requestJSON(`/api/passkeys/${encodeURIComponent(credentialId)}`, { method: "DELETE" });
      await loadPasskeys();
      setMessage("패스키를 삭제했습니다.");
    } catch (error) {
      setMessage(error.message, true);
    } finally {
      setBusy(false);
    }
  }

  loginButton.addEventListener("click", login);
  registerButton.addEventListener("click", () => register(passkeyName));
  logoutButton.addEventListener("click", async () => {
    setBusy(true, "로그아웃하고 있습니다…");
    try {
      await requestJSON("/api/auth/logout", { method: "POST", body: "{}" });
      await fetchAuthStatus();
      setMessage("");
    } catch (error) {
      setMessage(error.message, true);
    } finally {
      setBusy(false);
    }
  });

  const resetSessionOnPageLoad = async () => {
    try {
      await requestJSON("/api/auth/logout", { method: "POST", body: "{}" });
      await fetchAuthStatus();
    } catch (error) {
      privateGrid.replaceChildren();
      passkeyList.replaceChildren();
      lockCard.hidden = false;
      content.hidden = true;
      setupPanel.hidden = true;
      status.textContent = "잠금 상태";
      setMessage("로그인 상태를 초기화하지 못했습니다. 페이지를 다시 열어 주세요.", true);
    }
  };

  resetSessionOnPageLoad();
}

initStrengthToggles();
initNavigationObserver();
initPrivateArea();
