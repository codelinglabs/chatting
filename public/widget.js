(function () {
  const script =
    document.currentScript ||
    Array.from(document.getElementsByTagName("script"))
      .reverse()
      .find(function (entry) {
        return /\/widget\.js($|\?)/.test(entry.src);
      });

  if (!script || script.dataset.chatlyMounted === "true") {
    return;
  }

  script.dataset.chatlyMounted = "true";

  const siteId = script.dataset.siteId;
  if (!siteId) {
    console.error("Chatly widget: missing data-site-id");
    return;
  }

  const scriptUrl = new URL(script.src, window.location.href);
  const apiBase = script.dataset.apiBase || scriptUrl.origin;
  const brandColor = script.dataset.brandColor || "#0f766e";
  const greeting = script.dataset.greeting || "Ask us anything before you bounce";
  const position = script.dataset.position === "left" ? "left" : "right";

  const sessionKey = "chatly:session:" + siteId;
  const conversationKey = "chatly:conversation:" + siteId;
  const emailKey = "chatly:email:" + siteId;

  const createId = function () {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }

    return "chatly-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  };

  const getStored = function (key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const setStored = function (key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {}
  };

  const sessionId = getStored(sessionKey) || createId();
  setStored(sessionKey, sessionId);

  const root = document.createElement("div");
  root.setAttribute("data-chatly-root", "true");
  root.style.position = "fixed";
  root.style.bottom = "20px";
  root.style[position] = "20px";
  root.style.zIndex = "2147483646";
  root.style.fontFamily = '"Avenir Next", "Segoe UI", sans-serif';
  root.style.color = "#0d1b1e";
  document.body.appendChild(root);

  const style = document.createElement("style");
  style.textContent =
    "[data-chatly-root] *{box-sizing:border-box}" +
    "[data-chatly-bubble]{background:" + brandColor + ";color:#fff;border:none;border-radius:999px;padding:14px 18px;font-weight:700;box-shadow:0 14px 40px rgba(13,27,30,.24);display:flex;align-items:center;gap:10px}" +
    "[data-chatly-panel]{width:min(360px,calc(100vw - 32px));background:rgba(255,255,255,.97);border:1px solid rgba(13,27,30,.08);border-radius:24px;box-shadow:0 24px 60px rgba(13,27,30,.16);overflow:hidden}" +
    "[data-chatly-header]{padding:18px 20px;background:linear-gradient(135deg," + brandColor + ",#0d1b1e);color:#fff}" +
    "[data-chatly-body]{padding:18px;background:#fff}" +
    "[data-chatly-label]{display:block;margin-bottom:8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5f6b6c}" +
    "[data-chatly-input],[data-chatly-textarea]{width:100%;border:1px solid rgba(13,27,30,.12);border-radius:16px;padding:12px 14px;font:inherit;outline:none}" +
    "[data-chatly-textarea]{min-height:120px;resize:vertical}" +
    "[data-chatly-input]:focus,[data-chatly-textarea]:focus{border-color:" + brandColor + "}" +
    "[data-chatly-actions]{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px}" +
    "[data-chatly-button]{border:none;border-radius:999px;background:#0d1b1e;color:#fff;padding:12px 16px;font-weight:700}" +
    "[data-chatly-link]{border:none;background:transparent;color:#5f6b6c;padding:0;font-size:14px}" +
    "[data-chatly-note]{font-size:14px;line-height:1.6;color:#5f6b6c}" +
    "[data-chatly-error]{margin-top:12px;color:#b42318;font-size:13px}";
  document.head.appendChild(style);

  const bubble = document.createElement("button");
  bubble.type = "button";
  bubble.setAttribute("data-chatly-bubble", "true");
  bubble.innerHTML = '<span style="font-size:18px">?</span><span>Ask founder</span>';

  const panel = document.createElement("div");
  panel.setAttribute("data-chatly-panel", "true");
  panel.style.display = "none";

  panel.innerHTML =
    '<div data-chatly-header>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">' +
    '<div><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.72">Async chat</div>' +
    '<div style="margin-top:4px;font-size:22px;font-weight:700">Talk to the founder</div></div>' +
    '<button type="button" data-chatly-close style="border:none;background:transparent;color:#fff;font-size:24px;line-height:1">×</button>' +
    "</div></div>" +
    '<div data-chatly-body>' +
    '<p data-chatly-note style="margin:0 0 16px 0">' + greeting + "</p>" +
    '<div data-chatly-form>' +
    '<label style="display:block;margin-bottom:12px"><span data-chatly-label>Your question</span><textarea data-chatly-textarea placeholder="What nearly stopped you from signing up?"></textarea></label>' +
    '<label style="display:block"><span data-chatly-label>Email (optional)</span><input data-chatly-input type="email" placeholder="you@company.com" /></label>' +
    '<div data-chatly-actions><button type="button" data-chatly-button>Send</button><button type="button" data-chatly-link>Not now</button></div>' +
    '<div data-chatly-error style="display:none"></div>' +
    "</div>" +
    '<div data-chatly-success style="display:none">' +
    '<p style="margin:0;font-size:18px;font-weight:700;color:#0d1b1e">We\'ll reply soon.</p>' +
    '<p data-chatly-note style="margin:10px 0 0 0">Your question is in the founder inbox now.</p>' +
    '<div data-chatly-actions><button type="button" data-chatly-button>Send another message</button></div>' +
    "</div>" +
    "</div>";

  const textarea = panel.querySelector("[data-chatly-textarea]");
  const emailInput = panel.querySelector("[data-chatly-input]");
  const sendButton = panel.querySelector("[data-chatly-button]");
  const closeButton = panel.querySelector("[data-chatly-close]");
  const cancelButton = panel.querySelector("[data-chatly-link]");
  const formState = panel.querySelector("[data-chatly-form]");
  const successState = panel.querySelector("[data-chatly-success]");
  const successButton = successState.querySelector("[data-chatly-button]");
  const errorBox = panel.querySelector("[data-chatly-error]");

  emailInput.value = getStored(emailKey) || "";

  const openPanel = function () {
    bubble.style.display = "none";
    panel.style.display = "block";
  };

  const closePanel = function () {
    panel.style.display = "none";
    bubble.style.display = "flex";
  };

  const showError = function (message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
  };

  const clearError = function () {
    errorBox.textContent = "";
    errorBox.style.display = "none";
  };

  const setSentState = function () {
    formState.style.display = "none";
    successState.style.display = "block";
  };

  const setComposeState = function () {
    formState.style.display = "block";
    successState.style.display = "none";
  };

  bubble.addEventListener("click", openPanel);
  closeButton.addEventListener("click", closePanel);
  cancelButton.addEventListener("click", closePanel);
  successButton.addEventListener("click", function () {
    textarea.value = "";
    clearError();
    setComposeState();
    textarea.focus();
  });

  sendButton.addEventListener("click", async function () {
    const content = textarea.value.trim();
    const email = emailInput.value.trim();

    if (!content) {
      showError("Add a question before sending.");
      return;
    }

    clearError();
    sendButton.disabled = true;
    sendButton.textContent = "Sending...";

    try {
      const response = await fetch(apiBase + "/api/public/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          siteId: siteId,
          sessionId: sessionId,
          conversationId: getStored(conversationKey),
          email: email || null,
          content: content,
          pageUrl: window.location.href,
          referrer: document.referrer || null
        })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const payload = await response.json();
      if (payload.conversationId) {
        setStored(conversationKey, payload.conversationId);
      }
      if (email) {
        setStored(emailKey, email);
      }
      textarea.value = "";
      setSentState();
    } catch (error) {
      showError("The message did not send. Please try again.");
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "Send";
    }
  });

  root.appendChild(panel);
  root.appendChild(bubble);
})();
