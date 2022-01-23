let skipIntroCheckbox = document.getElementById("skip-intro");
let skipRecapCheckbox = document.getElementById("skip-recap");
let skipNextCheckbox = document.getElementById("skip-next");

skipIntroCheckbox.addEventListener("click", async () => {
  chrome.storage.local.set({ skipIntro: skipIntroCheckbox.checked });
});

skipRecapCheckbox.addEventListener("click", async () => {
  chrome.storage.local.set({ skipRecap: skipRecapCheckbox.checked });
});

skipNextCheckbox.addEventListener("click", async () => {
  chrome.storage.local.set({ skipNext: skipNextCheckbox.checked });
});

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
