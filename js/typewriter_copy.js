const sleeptime = 55;

const sentencePauseTime = 300;
const wordPauseMap = {};

const paragraphPauseDefault = 1200;
const paragraphPauseMap = {
  descrip1: 1200,
  descrip2: 1600,
  descrip3: 1200,
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

window.startTypewriterEffect = function startTypewriterEffect() {
  const instance = buildTypewriter();
  if (!instance) {
    setTimeout(startTypewriterEffect, 50);
    return;
  }
  instance.start();
};
