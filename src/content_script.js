const INTRO_UIA = "player-skip-intro";
const RECAP_UIA = "player-skip-recap";
const NEXT_UIA = "next-episode-seamless-button";
const NEXT_DRAIN_UIA = "next-episode-seamless-button-draining";

const BUTTONS = [INTRO_UIA, RECAP_UIA, NEXT_UIA, NEXT_DRAIN_UIA];

// Function to extract the current Netflix title
function getCurrentTitle() {
  // Use the specific selector that works reliably
  const titleElement = document.querySelectorAll("[data-uia='video-title']")[0];

  if (titleElement) {
    // Try to get the show title from the h4 element within the title element
    const h4Element = titleElement.querySelector('h4');
    if (h4Element && h4Element.textContent.trim()) {
      return h4Element.textContent.trim();
    }
    
    // Fallback to full text content if no h4 found
    if (titleElement.textContent.trim()) {
      return titleElement.textContent.trim();
    }
  }
  
  // Fallback: try to get title from page title if the main selector fails
  const pageTitle = document.title;
  if (pageTitle && pageTitle !== 'Netflix' && !pageTitle.includes('Watch ')) {
    return pageTitle.replace(' - Netflix', '').trim();
  }
  
  return null;
}

async function skipper() {
  try {
    chrome.storage.local.get(
      ["skipIntro", "skipRecap", "skipNext", "exemptTitles"],
      ({ skipIntro, skipRecap, skipNext, exemptTitles = [] }) => {
        // Check if current title is in exempt list
        const currentTitle = getCurrentTitle();
        const isExempt = currentTitle && exemptTitles.includes(currentTitle);
        
        // If title is exempt, don't skip anything
        if (isExempt) {
          return;
        }
        
        const mapper = {
          [INTRO_UIA]: skipIntro,
          [RECAP_UIA]: skipRecap,
          [NEXT_UIA]: skipNext,
          [NEXT_DRAIN_UIA]: skipNext,
        };
        BUTTONS.forEach((uia) => {
          const button = Object.values(
            document.getElementsByTagName("button")
          ).find((elem) => elem.getAttribute("data-uia") === uia);
          if (button && mapper[uia]) {
            button.click();
          }
        });
      }
    );
  } catch (err) {
    console.error(err);
  }
}

// Function to add/remove current title from exempt list
async function toggleExemptStatus() {
  const currentTitle = getCurrentTitle();
  if (!currentTitle) {
    console.log('Netflix Skipper: Could not detect current title');
    return;
  }
  
  try {
    const result = await chrome.storage.local.get(['exemptTitles']);
    const exemptTitles = result.exemptTitles || [];
    
    if (exemptTitles.includes(currentTitle)) {
      // Remove from exempt list
      const updatedTitles = exemptTitles.filter(title => title !== currentTitle);
      await chrome.storage.local.set({ exemptTitles: updatedTitles });
      console.log(`Netflix Skipper: Removed "${currentTitle}" from exempt list`);
    } else {
      // Add to exempt list
      const updatedTitles = [...exemptTitles, currentTitle];
      await chrome.storage.local.set({ exemptTitles: updatedTitles });
      console.log(`Netflix Skipper: Added "${currentTitle}" to exempt list`);
    }
  } catch (err) {
    console.error('Netflix Skipper: Error toggling exempt status:', err);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleExempt') {
    toggleExemptStatus();
    sendResponse({ success: true });
  } else if (request.action === 'getCurrentTitle') {
    const title = getCurrentTitle();
    sendResponse({ title });
  }
});

if (document.location.host.includes(".netflix.")) {
  setInterval(() => skipper(), 500);
}
