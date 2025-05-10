// Content script for VoiceBot Generator Extension

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'URL_UPDATED') {
    // Store the current URL in local storage
    localStorage.setItem('currentPageUrl', request.url);
  }
  
  // Handle any widget preview requests
  if (request.type === 'PREVIEW_WIDGET') {
    previewWidget(request.config);
  }
  
  // Handle removing widget preview
  if (request.type === 'REMOVE_PREVIEW') {
    removeWidgetPreview();
  }
});

// Function to preview widget on the current page
function previewWidget(config) {
  // Remove any existing preview
  removeWidgetPreview();
  
  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'voicebot-widget-preview';
  widgetContainer.style.position = 'fixed';
  widgetContainer.style.zIndex = '9999';
  
  // Set position based on config
  switch (config.position) {
    case 'bottom-right':
      widgetContainer.style.bottom = '20px';
      widgetContainer.style.right = '20px';
      break;
    case 'bottom-left':
      widgetContainer.style.bottom = '20px';
      widgetContainer.style.left = '20px';
      break;
    case 'top-right':
      widgetContainer.style.top = '20px';
      widgetContainer.style.right = '20px';
      break;
    case 'top-left':
      widgetContainer.style.top = '20px';
      widgetContainer.style.left = '20px';
      break;
    default:
      widgetContainer.style.bottom = '20px';
      widgetContainer.style.right = '20px';
  }
  
  // Create button
  const button = document.createElement('button');
  button.style.backgroundColor = config.color;
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '50px';
  button.style.padding = '10px 20px';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  button.style.transition = 'all 0.3s ease';
  
  // Add avatar or icon
  if (config.avatarUrl) {
    const avatar = document.createElement('img');
    avatar.src = config.avatarUrl;
    avatar.style.width = '24px';
    avatar.style.height = '24px';
    avatar.style.borderRadius = '50%';
    avatar.style.marginRight = '8px';
    button.appendChild(avatar);
  } else {
    // Add mic icon
    const micIcon = document.createElement('span');
    micIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;
    micIcon.style.marginRight = '8px';
    button.appendChild(micIcon);
  }
  
  // Add text
  const text = document.createTextNode(config.ctaText || 'Chat with me');
  button.appendChild(text);
  
  // Add hover effect
  button.onmouseover = function() {
    this.style.transform = 'translateY(-2px)';
    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  };
  
  button.onmouseout = function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  };
  
  // Add click event to show "Preview Mode" tooltip
  button.onclick = function() {
    const tooltip = document.createElement('div');
    tooltip.textContent = 'Preview Mode';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '10000';
    
    // Position tooltip based on widget position
    if (config.position.includes('bottom')) {
      tooltip.style.bottom = '50px';
    } else {
      tooltip.style.top = '50px';
    }
    
    if (config.position.includes('right')) {
      tooltip.style.right = '0';
    } else {
      tooltip.style.left = '0';
    }
    
    widgetContainer.appendChild(tooltip);
    
    // Remove tooltip after 2 seconds
    setTimeout(() => {
      tooltip.remove();
    }, 2000);
  };
  
  // Add button to container
  widgetContainer.appendChild(button);
  
  // Add "Preview" label
  const previewLabel = document.createElement('div');
  previewLabel.textContent = 'PREVIEW';
  previewLabel.style.position = 'absolute';
  previewLabel.style.top = '-20px';
  previewLabel.style.left = '50%';
  previewLabel.style.transform = 'translateX(-50%)';
  previewLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  previewLabel.style.color = 'white';
  previewLabel.style.padding = '2px 6px';
  previewLabel.style.borderRadius = '4px';
  previewLabel.style.fontSize = '10px';
  previewLabel.style.fontWeight = 'bold';
  widgetContainer.appendChild(previewLabel);
  
  // Add container to body
  document.body.appendChild(widgetContainer);
}

// Function to remove widget preview
function removeWidgetPreview() {
  const existingPreview = document.getElementById('voicebot-widget-preview');
  if (existingPreview) {
    existingPreview.remove();
  }
}

// When the content script loads, notify the background script
chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_LOADED' });
