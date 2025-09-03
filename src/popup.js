let skipIntroCheckbox = document.getElementById("skip-intro");
let skipRecapCheckbox = document.getElementById("skip-recap");
let skipNextCheckbox = document.getElementById("skip-next");
let toggleExemptButton = document.getElementById("toggle-exempt");
let currentTitleSpan = document.getElementById("current-title");
let currentTitleContainer = document.getElementById("current-title-container");
let notOnNetflixDiv = document.getElementById("not-on-netflix");
let exemptListDiv = document.getElementById("exempt-list");

let currentTitle = null;
let exemptTitles = [];

// General settings event listeners
skipIntroCheckbox.addEventListener("click", async () => {
  chrome.storage.local.set({ skipIntro: skipIntroCheckbox.checked });
});

skipRecapCheckbox.addEventListener("click", async () => {
  chrome.storage.local.set({ skipRecap: skipRecapCheckbox.checked });
});

skipNextCheckbox.addEventListener("click", async () => {
  chrome.storage.local.set({ skipNext: skipNextCheckbox.checked });
});

// Exempt list functionality
toggleExemptButton.addEventListener("click", async () => {
  if (!currentTitle) return;
  
  try {
    // Toggle the exempt status locally for immediate UI update
    const isCurrentlyExempt = exemptTitles.includes(currentTitle);
    
    if (isCurrentlyExempt) {
      // Remove from exempt list
      exemptTitles = exemptTitles.filter(title => title !== currentTitle);
    } else {
      // Add to exempt list
      exemptTitles = [...exemptTitles, currentTitle];
    }
    
    // Update storage
    await chrome.storage.local.set({ exemptTitles });
    
    // Send message to content script to sync the change
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'toggleExempt' });
    
    // Update UI immediately
    updateExemptList();
    updateToggleButton();
  } catch (error) {
    console.error('Error toggling exempt status:', error);
    // If there's an error, reload from storage to ensure consistency
    await loadExemptTitles();
    updateToggleButton();
  }
});

// Function to load exempt titles from storage
async function loadExemptTitles() {
  try {
    const result = await chrome.storage.local.get(['exemptTitles']);
    exemptTitles = result.exemptTitles || [];
    updateExemptList();
  } catch (error) {
    console.error('Error loading exempt titles:', error);
  }
}

// Function to update the exempt list display
function updateExemptList() {
  if (exemptTitles.length === 0) {
    exemptListDiv.innerHTML = '<div style="text-align: center; color: #666; font-size: 11px;">No exempt titles</div>';
    return;
  }
  
  exemptListDiv.innerHTML = exemptTitles.map(title => `
    <div class="exempt-item">
      <span style="flex: 1; margin-right: 8px;">${title}</span>
      <button class="remove-item" onclick="removeExemptTitle('${title.replace(/'/g, "\\'")}')">×</button>
    </div>
  `).join('');
}

// Function to remove a title from exempt list
window.removeExemptTitle = async function(title) {
  try {
    // Update local array immediately for instant UI feedback
    exemptTitles = exemptTitles.filter(t => t !== title);
    
    // Update storage
    await chrome.storage.local.set({ exemptTitles });
    
    // Update UI immediately
    updateExemptList();
    updateToggleButton();
    
    // Visual feedback - briefly highlight the change
    if (title === currentTitle) {
      toggleExemptButton.style.transform = 'scale(0.95)';
      setTimeout(() => {
        toggleExemptButton.style.transform = 'scale(1)';
      }, 150);
    }
  } catch (error) {
    console.error('Error removing exempt title:', error);
    // If there's an error, reload from storage to ensure consistency
    await loadExemptTitles();
    updateToggleButton();
  }
};

// Function to update the toggle button state
function updateToggleButton() {
  if (!currentTitle) {
    toggleExemptButton.textContent = 'No title detected';
    toggleExemptButton.className = 'toggle-button disabled-button';
    toggleExemptButton.disabled = true;
    return;
  }
  
  const isExempt = exemptTitles.includes(currentTitle);
  if (isExempt) {
    toggleExemptButton.textContent = 'Remove from Exempt List';
    toggleExemptButton.className = 'toggle-button remove-button';
    toggleExemptButton.disabled = false;
  } else {
    toggleExemptButton.textContent = 'Add to Exempt List';
    toggleExemptButton.className = 'toggle-button add-button';
    toggleExemptButton.disabled = false;
  }
}

// Function to get current title from active tab
async function getCurrentTitle() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on Netflix
    if (!tab.url.includes('netflix.com')) {
      currentTitleContainer.style.display = 'none';
      notOnNetflixDiv.style.display = 'block';
      return;
    }
    
    // Show the current title container
    currentTitleContainer.style.display = 'block';
    notOnNetflixDiv.style.display = 'none';
    
    // Get title from content script
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getCurrentTitle' });
    currentTitle = response?.title || null;
    
    if (currentTitle) {
      currentTitleSpan.textContent = currentTitle;
    } else {
      currentTitleSpan.textContent = 'Title not detected';
    }
    
    updateToggleButton();
  } catch (error) {
    console.error('Error getting current title:', error);
    currentTitleContainer.style.display = 'none';
    notOnNetflixDiv.style.display = 'block';
  }
}

// Initialize popup
async function initializePopup() {
  // Load general settings
  chrome.storage.local.get(
    ["skipIntro", "skipRecap", "skipNext"],
    ({ skipIntro, skipRecap, skipNext }) => {
      if (skipIntro) {
        skipIntroCheckbox.checked = true;
      }
      if (skipRecap) {
        skipRecapCheckbox.checked = true;
      }
      if (skipNext) {
        skipNextCheckbox.checked = true;
      }
    }
  );
  
  // Load exempt titles and current title
  await loadExemptTitles();
  await getCurrentTitle();
}

// Initialize when popup opens
initializePopup();
