const STORAGE_KEY = "nova_chat_history_v1";
const MAX_MESSAGES = 40;

const messageList = document.getElementById("messageList");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearChatBtn = document.getElementById("clearChatBtn");

let history = loadHistory();
let isSending = false;

// Load saved conversation from browser localStorage
function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
    );
  } catch (error) {
    console.warn("Could not load chat history:", error);
    return [];
  }
}

// Save conversation to browser localStorage
function saveHistory() {
  history = history.slice(-MAX_MESSAGES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn("Could not save chat history:", error);
  }
}

// Scroll chat to bottom
function scrollToBottom() {
  messageList.scrollTop = messageList.scrollHeight;
}

// Render all messages
function render() {
  messageList.innerHTML = "";

  // Show welcome screen when there are no messages
  if (history.length === 0) {
    const empty = document.createElement("div");

    empty.className = "empty-state";

    empty.innerHTML = `
      <div class="empty-card">
        <div class="empty-icon">✦</div>
        <h3>Meet Nova</h3>
        <p>
          Your fast AI assistant. Ask questions, brainstorm ideas,
          explain concepts, write code, or just start a conversation.
        </p>
      </div>
    `;

    messageList.appendChild(empty);
    return;
  }

  // Render saved messages
  for (const message of history) {
    appendMessage(message.role, message.content);
  }

  scrollToBottom();
}

// Add a single message to the UI
function appendMessage(role, content) {
  const wrapper = document.createElement("article");

  wrapper.className = `message ${role}`;

  const avatar = document.createElement("div");

  avatar.className = "message-avatar";
  avatar.textContent = role === "assistant" ? "N" : "You";

  const contentWrap = document.createElement("div");

  contentWrap.className = "message-content";

  const bubble = document.createElement("div");

  bubble.className = "message-bubble";
  bubble.textContent = content;

  const roleLabel = document.createElement("div");

  roleLabel.className = "message-role";
  roleLabel.textContent = role === "assistant" ? "Nova" : "You";

  contentWrap.appendChild(bubble);
  contentWrap.appendChild(roleLabel);

  wrapper.appendChild(avatar);
  wrapper.appendChild(contentWrap);

  messageList.appendChild(wrapper);
}

// Show typing animation
function showTyping() {
  const wrapper = document.createElement("article");

  wrapper.className = "message assistant";
  wrapper.id = "typingMessage";

  const avatar = document.createElement("div");

  avatar.className = "message-avatar";
  avatar.textContent = "N";

  const bubble = document.createElement("div");

  bubble.className = "typing";
  bubble.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);

  messageList.appendChild(wrapper);

  scrollToBottom();
}

// Remove typing animation
function removeTyping() {
  const typingMessage = document.getElementById("typingMessage");

  if (typingMessage) {
    typingMessage.remove();
  }
}

// Enable / disable UI during request
function setLoading(loading) {
  isSending = loading;

  sendBtn.disabled = loading;
  messageInput.disabled = loading;

  if (!loading) {
    messageInput.focus();
  }
}

// Automatically increase textarea height
function autoResize() {
  messageInput.style.height = "auto";

  messageInput.style.height =
    `${Math.min(messageInput.scrollHeight, 150)}px`;
}

// Send user message to backend
async function sendMessage(content) {
  if (!content || isSending) {
    return;
  }

  // Add user message to local history
  history.push({
    role: "user",
    content: content,
  });

  saveHistory();
  render();

  // Clear input
  messageInput.value = "";
  autoResize();

  setLoading(true);
  showTyping();

  try {
    // Send complete conversation to Vercel API
    const response = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messages: history,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error || "Nova could not process your message."
      );
    }

    const reply =
      typeof data.reply === "string" && data.reply.trim()
        ? data.reply.trim()
        : "I received your message, but I could not generate a response.";

    // Save Nova's response
    history.push({
      role: "assistant",
      content: reply,
    });

    saveHistory();
  } catch (error) {
    // Remove user's unsent message if request failed
    history.pop();

    saveHistory();
    render();

    const errorEl = document.createElement("div");

    errorEl.className = "error-message";

    errorEl.textContent =
      error.message || "Something went wrong. Please try again.";

    messageList.appendChild(errorEl);

    scrollToBottom();
  } finally {
    removeTyping();

    render();

    setLoading(false);
  }
}

// Submit message
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const content = messageInput.value.trim();

  sendMessage(content);
});

// Resize input as user types
messageInput.addEventListener("input", autoResize);

// Enter = send
// Shift + Enter = new line
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();

    chatForm.requestSubmit();
  }
});

// Clear complete conversation
clearChatBtn.addEventListener("click", () => {
  if (isSending) {
    return;
  }

  if (
    history.length > 0 &&
    !window.confirm("Clear your entire Nova conversation?")
  ) {
    return;
  }

  history = [];

  localStorage.removeItem(STORAGE_KEY);

  render();

  messageInput.focus();
});

// Initial UI
render();
autoResize();