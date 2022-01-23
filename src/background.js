chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ skipIntro: true, skipRecap: true, skipNext: true });
});
