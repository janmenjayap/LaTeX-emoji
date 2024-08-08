// Store the notification ID
let notificationId = '';

async function loadEmojis() {
  try {
    const response = await fetch(chrome.runtime.getURL('emojis.json'));
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const emojis = await response.json();
    return emojis;
  } catch (error) {
    console.error('Failed to load emojis:', error);
    return [];
  }
}

function createEmojiElement(emoji) {
  const emojiElement = document.createElement('div');
  emojiElement.className = 'emoji';
  emojiElement.textContent = emoji.symbol;
  emojiElement.title = emoji.name;

  emojiElement.addEventListener('click', () => {
    copyToClipboard(`\\emoji{${emoji.name}}`);
  });

  return emojiElement;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copy successful', `Copied to clipboard: ${text}`);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

function showNotification(title, message) {
  // Create a unique ID for the notification
  notificationId = 'notification-' + new Date().getTime();

  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: 'icons/emoji-48.png',
    title: title,
    message: message,
    priority: 2
  });

  // Automatically clear the notification after 5 seconds
  setTimeout(() => {
    chrome.notifications.clear(notificationId, (wasCleared) => {
      if (!wasCleared) {
        console.error('Failed to clear notification:', chrome.runtime.lastError);
      }
    });
  }, 3000); // 3000 milliseconds = 3 seconds
}

async function populateEmojis() {
  const container = document.getElementById('emojiContainer');
  const emojis = await loadEmojis();
  emojis.forEach(emoji => {
    const emojiElement = createEmojiElement(emoji);
    container.appendChild(emojiElement);
  });
}

populateEmojis();
