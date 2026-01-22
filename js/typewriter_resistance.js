// ms between each character typed, ADJUST AS NEEDED
const sleeptime = 40;


const sentencePauseTime = 600;            // delay after a sentence or m-dash
const wordPauseMap = {                    // map of phrase for additional delay; case-insensitive
  "is easiest.": 1000,
  "it is easy to follow the path of least resistance.": 1500,
  "the ability to": 1000,
  "the ability to change": 1000,
};

const paragraphPauseDefault = 1000;
const paragraphPauseMap = {
  descrip4: 4000, // base delay + extra delay after descrip4
};

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
