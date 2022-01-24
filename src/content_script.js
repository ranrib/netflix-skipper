const INTRO_UIA = "player-skip-intro";
const RECAP_UIA = "player-skip-recap";
const NEXT_UIA = "next-episode-seamless-button";
const NEXT_DRAIN_UIA = "next-episode-seamless-button-draining";

const BUTTONS = [INTRO_UIA, RECAP_UIA, NEXT_UIA, NEXT_DRAIN_UIA];

async function skipper() {
  try {
    chrome.storage.local.get(
      ["skipIntro", "skipRecap", "skipNext"],
      ({ skipIntro, skipRecap, skipNext }) => {
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

if (document.location.host.includes(".netflix.")) {
  setInterval(() => skipper(), 500);
}
