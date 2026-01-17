// cache original html for all "descrip"s
const originals = {};
document
  .querySelectorAll('p[id^="descrip"]')
  .forEach(p => {
    originals[p.id] = p.innerHTML;
    // optional: p.classList.add("hidden");
  });


// ms between each character typed, ADJUST AS NEEDED
const sleeptime = 40;


// helper function that returns a Promise that resolves after 'ms' milliseconds
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const sentencePauseTime = 300;            // delay after a sentence or m-dash,
const wordPauseMap = {                    // map of phrase for additional delay; case-insensitive
  // "process of cultivating yourself,": 1000,
  // "learn and grow": 500,
  // "about yourself": 500,
};

// function that simulates typing effect on a paragraph with given ID
const typewriterEffect = async (paragraphID, sleeptime) => {
  const paragraph = document.getElementById(paragraphID);          // get the paragraph element by its ID
  const raw = paragraph.textContent;                              // store the original text content of the paragraph
  const text = raw.replace(/\s+/g, " ").trim();

  for (let i = 0; i < text.length + 1; i++) {
    paragraph.innerHTML = text.substring(0, i);                    // update visible text
    await delay(sleeptime);                                        // delay between characters    

    // 1. sentence / colon pause
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
  // find every <p> whose id begins with "descrip", then return an array of their IDs in document order
  return Array.from(
    document.querySelectorAll('p[id^="descrip"]')
  ).map(p => p.id);
};


// main function to start the typewriter effect on all paragraphs
const startTypewriterEffect = async () => {
  const paragraphsToType = await getText();

  // iterate over each paragraph ID and apply the typewriter effect
  for (const paragraphID of paragraphsToType) {
    const paragraph = document.getElementById(paragraphID);
    paragraph.classList.remove("hidden");
    await typewriterEffect(paragraphID, sleeptime);
    await delay(1000); 

    // additional delay after specific paragraphs
    if (paragraphID == "descrip1") {
      await delay(2000);
    } else if (paragraphID == "descrip2") {
      await delay(1500);
    } else if (paragraphID == "descrip3") {
      await delay(5000);
    }
  }
};
