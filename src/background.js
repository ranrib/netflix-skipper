chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ skipIntro: true, skipRecap: true, skipNext: true });
});

if (chrome.runtime) {
  chrome.runtime.setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLSdu75DIgQwiEYud7I8TgsAkyoUnFyLXRDAnELcN_QIeLGvh5w/viewform");
}
