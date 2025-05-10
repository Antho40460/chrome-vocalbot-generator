// Chrome Extension Background Script

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('VoiceBot Generator Extension installed');
});

// Listen for tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Send message to content script with current URL
    chrome.tabs.sendMessage(tabId, {
      type: 'URL_UPDATED',
      url: tab.url
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_CURRENT_URL') {
    // Get the URL of the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({ url: tabs[0].url });
      } else {
        sendResponse({ url: null });
      }
    });
    return true; // Required for async sendResponse
  }
});
