// cache original html
const originals = {};
["descrip1","descrip2","descrip3","descrip4"].forEach(id => {
  const p = document.getElementById(id);
  originals[id] = p.innerHTML;
  // (optional) hide them until you type
  p.classList.add("hidden");
});


// helper function that returns a Promise that resolves after 'ms' milliseconds
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const sentencePauseTime = 600;            // delay after a sentence or m-dash,
const wordPauseMap = {                    // map of phrase for additional delay; case-insensitive
  "is easiest.": 1000,
  "it is easy to follow the path of least resistance.": 1500,
  "the ability to": 1000,
  "the ability to change": 1000,
};

// function that simulates typing effect on a paragraph with given ID
const typewriterEffect = async (paragraphID, sleeptime) => {
  const paragraph = document.getElementById(paragraphID);          // get the paragraph element by its ID
  const raw = paragraph.textContent;                              // store the original text content of the paragraph
  const text = raw.replace(/\s+/g, " ").trim();

  for (let i = 0; i < text.length + 1; i++) {
    paragraph.innerHTML = text.substring(0, i);                    // update visible text
    await delay(sleeptime);                                        // delay between characters    

    // 1. sentence / m-dash pause
    const lastChar = text.charAt(i - 1);
    if (/[—.!?]/.test(lastChar)) {
      await delay(sentencePauseTime);
    }

    // 2. word-pause check
    // look back over the text we’ve printed so far for each key in wordPauseMap
    const soFar = text.substring(0, i).toLowerCase();
    for (const [phrase, pauseDuration] of Object.entries(wordPauseMap)) {
      if (soFar.endsWith(phrase)) {
        await delay(pauseDuration);
      }
    }
  }
  // RESTORE ORIGINAL HTML (with <a> tags & class="link")
  paragraph.innerHTML = originals[paragraphID];
};

// function that generates a list of paragraph IDs to apply typewriter effect to
const getText = async () => {
  const paragraphsToType = [];
  for (let i = 1; i < 5; i++) {
    paragraphsToType.push("descrip" + i);
  }
  return paragraphsToType;
};

const sleeptime = 40; // ms between each character typed, ADJUST AS NEEDED


// main function to start the typewriter effect on all paragraphs
const startTypewriterEffect = async () => {
  const paragraphsToType = await getText();

  // iterate over each paragraph ID and apply the typewriter effect
  for (const paragraphID of paragraphsToType) {
    const paragraph = document.getElementById(paragraphID);
    paragraph.classList.remove("hidden");
    await typewriterEffect(paragraphID, sleeptime);
    await delay(1000); 

    // additional delay between specific paragraphs 
    if (paragraphID == "descrip4") {
      await delay(3000); // was 1000
    } else if (paragraphID == "descrip2") {
      await delay(0); // was 2500
    }
  }
};


// startTypewriterEffect();
