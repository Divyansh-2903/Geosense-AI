let chatHistory = [];
let currentReportData = null;

/**
 * Initializes chatbot module.
 * @param {Object} reportData - The current farm analysis report.
 */
function initChatbot(reportData) {
  currentReportData = reportData;
  chatHistory = []; // Reset chat history for a new report
  
  // Clear messages list and append initial system message
  const container = document.getElementById('chat-messages');
  container.innerHTML = `
    <div class="chat-msg system-msg">
      <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="msg-content">
        <p>Hello! I have reviewed your farm's spectral data. Ask me anything about yield improvement, soil condition, or irrigation plans for this plot.</p>
      </div>
    </div>
  `;
}

/**
 * Appends a message to the chat display.
 * @param {string} sender - 'user' or 'system'
 * @param {string} text - Message text (supports Markdown for system replies)
 */
function appendChatMessage(sender, text) {
  const container = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'system-msg'}`;
  
  const icon = sender === 'user' ? 'fa-user' : 'fa-robot';
  
  // Use marked library if it's the system AI responding
  const formattedText = sender === 'system' && window.marked 
    ? window.marked.parse(text) 
    : `<p>${escapeHTML(text)}</p>`;

  msgDiv.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid ${icon}"></i></div>
    <div class="msg-content">${formattedText}</div>
  `;
  
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight; // Auto scroll to bottom
}

/**
 * Helper to escape HTML characters.
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/**
 * Sends a message to the backend chatbot route.
 */
async function sendUserMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  
  if (!currentReportData) {
    alert("Please run a farm analysis first to provide the AI Advisor with field context.");
    return;
  }

  // Display user's message
  appendChatMessage('user', text);
  input.value = '';
  
  // Disable inputs while loading
  const sendBtn = document.getElementById('btn-chat-send');
  input.disabled = true;
  sendBtn.disabled = true;
  
  // Add temporary typing indicator bubble
  const container = document.getElementById('chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.id = 'chat-typing-indicator';
  typingDiv.className = 'chat-msg system-msg';
  typingDiv.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
    <div class="msg-content"><p><i class="fa-solid fa-ellipsis fa-fade"></i> Agri-Sense is thinking...</p></div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;

  try {
    const response = await fetch('/api/chat-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportData: currentReportData,
        chatHistory: chatHistory,
        message: text
      })
    });
    
    const data = await response.json();
    
    // Remove typing indicator
    const indicator = document.getElementById('chat-typing-indicator');
    if (indicator) indicator.remove();

    if (data.error) {
      appendChatMessage('system', `⚠️ **Error**: ${data.error}`);
    } else {
      appendChatMessage('system', data.reply);
      // Save to chat history
      chatHistory.push({ role: 'user', text: text });
      chatHistory.push({ role: 'model', text: data.reply });
    }
  } catch (error) {
    console.error('Chat error:', error);
    const indicator = document.getElementById('chat-typing-indicator');
    if (indicator) indicator.remove();
    appendChatMessage('system', '❌ **Connection Error**: Failed to send request to the AI Advisor. Please try again.');
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

// Bind event listeners on load
document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('btn-chat-send');
  const input = document.getElementById('chat-input');
  
  if (sendBtn && input) {
    sendBtn.addEventListener('click', sendUserMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendUserMessage();
      }
    });
  }
});

// Export functions to window
window.initChatbot = initChatbot;
