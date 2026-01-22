// ms between each character typed, ADJUST AS NEEDED
const sleeptime = 40;


const sentencePauseTime = 300;            // delay after a sentence or m-dash
const wordPauseMap = {                    // map of phrase for additional delay; case-insensitive
  // "process of cultivating yourself,": 1000,
  // "learn and grow": 500,
  // "about yourself": 500,
};

const paragraphPauseDefault = 1000;
const paragraphPauseMap = {};

let typewriterInstance;

const buildTypewriter = () => {
  if (!window.TypewriterCore) {
    return null;
  }
  if (!typewriterInstance) {
    typewriterInstance = window.TypewriterCore.createTypewriter({
      selector: 'p[id^="descrip"]',
      charDelay: sleeptime,
      sentencePauseTime,
      wordPauseMap,
      paragraphDelayDefault: paragraphPauseDefault,
      paragraphDelayMap: paragraphPauseMap,
    });
  }
  return typewriterInstance;
};

// main function to start the typewriter effect on all paragraphs
window.startTypewriterEffect = function startTypewriterEffect() {
  const instance = buildTypewriter();
  if (!instance) {
    setTimeout(startTypewriterEffect, 50);
    return;
  }
  instance.start();
};
