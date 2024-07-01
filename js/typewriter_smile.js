function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const typewriterEffect = async (paragraphID, sleeptime) => {
  const paragraph = document.getElementById(paragraphID);
  const text = paragraph.textContent;

  for (let i = 0; i < text.length + 1; i++) {
    paragraph.innerHTML = text.substring(0, i);
    await delay(sleeptime);
  }
};

const getText = async () => {
  const paragraphsToType = [];
  for (let i = 1; i < 5; i++) {
    paragraphsToType.push("descrip" + i);
  }
  return paragraphsToType;
};

const sleeptime = 40; // Adjust the typing speed as desired

const startTypewriterEffect = async () => {
  const paragraphsToType = await getText();

  for (const paragraphID of paragraphsToType) {
    const paragraph = document.getElementById(paragraphID);
    paragraph.classList.remove("hidden");
    await typewriterEffect(paragraphID, sleeptime);
    await delay(0); // was 1000

    if (paragraphID == "descrip1") {
      await delay(0); // was 1000
    } else if (paragraphID == "descrip2") {
      await delay(0); // was 2500
    }
  }
};


startTypewriterEffect();
