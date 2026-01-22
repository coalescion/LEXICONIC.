(() => {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const collectTextNodes = (element) => {
    const nodes = [];

    if (document.createTreeWalker) {
      const textFilter = (window.NodeFilter && window.NodeFilter.SHOW_TEXT) || 4;
      const walker = document.createTreeWalker(element, textFilter);
      let current = walker.nextNode();
      while (current) {
        nodes.push(current);
        current = walker.nextNode();
      }
      return nodes;
    }

    const traverse = (node) => {
      if (node.nodeType === 3) {
        nodes.push(node);
        return;
      }
      node.childNodes.forEach(traverse);
    };

    traverse(element);
    return nodes;
  };

  const normalizeTextNodes = (nodes, isPreformatted) => {
    if (isPreformatted) {
      return nodes.map(node => node.nodeValue);
    }

    const normalizedChunks = [];
    let prevEndsWithSpace = false;
    let started = false;

    for (const node of nodes) {
      let value = node.nodeValue.replace(/\s+/g, " ");

      if (!started) {
        value = value.replace(/^ +/, "");
      }
      if (prevEndsWithSpace) {
        value = value.replace(/^ +/, "");
      }

      if (value.length > 0) {
        started = true;
      }

      prevEndsWithSpace = value.endsWith(" ");
      normalizedChunks.push(value);
    }

    for (let i = normalizedChunks.length - 1; i >= 0; i--) {
      if (normalizedChunks[i].length === 0) {
        continue;
      }
      normalizedChunks[i] = normalizedChunks[i].replace(/ +$/, "");
      break;
    }

    return normalizedChunks;
  };

  const renderTextNodes = (nodes, chunks, length) => {
    let remaining = length;
    for (let i = 0; i < nodes.length; i++) {
      const chunk = chunks[i] || "";
      if (remaining <= 0) {
        nodes[i].nodeValue = "";
        continue;
      }
      const sliceLength = Math.min(remaining, chunk.length);
      nodes[i].nodeValue = chunk.slice(0, sliceLength);
      remaining -= sliceLength;
    }
  };

  const getMapValue = (map, key, fallback) => (
    Object.prototype.hasOwnProperty.call(map, key) ? map[key] : fallback
  );

  const createTypewriter = (options = {}) => {
    const {
      selector = 'p[id^="descrip"]',
      isPreformatted = (element) => element.tagName === "PRE",
      charDelay = 40,
      sentencePauseTime = 300,
      sentencePausePattern = /[—.!?]/,
      wordPauseMap = {},
      paragraphDelayDefault = 1000,
      paragraphDelayMap = {},
      revealClass = "hidden",
    } = options;

    const getCharDelay = (paragraphID) => (
      typeof charDelay === "function" ? charDelay(paragraphID) : charDelay
    );

    const getParagraphDelay = (paragraphID) => (
      getMapValue(paragraphDelayMap, paragraphID, paragraphDelayDefault)
    );

    const originals = {};

    const cacheOriginals = (elements) => {
      elements.forEach((element) => {
        if (!element.id) {
          return;
        }
        originals[element.id] = element.innerHTML;
      });
    };

    const typewriterEffect = async (element) => {
      const paragraphID = element.id;
      if (!paragraphID) {
        return;
      }

      if (!Object.prototype.hasOwnProperty.call(originals, paragraphID)) {
        originals[paragraphID] = element.innerHTML;
      }

      element.innerHTML = originals[paragraphID];
      const previousMinHeight = element.style.minHeight;
      const fullHeight = element.getBoundingClientRect().height;
      if (fullHeight > 0) {
        // Lock in the final height to prevent scroll jumps while typing.
        element.style.minHeight = `${fullHeight}px`;
      }
      const nodes = collectTextNodes(element);
      const chunks = normalizeTextNodes(nodes, isPreformatted(element));
      const fullText = chunks.join("");

      for (let i = 0; i < fullText.length + 1; i++) {
        renderTextNodes(nodes, chunks, i);
        await delay(getCharDelay(paragraphID));

        const lastChar = fullText.charAt(i - 1);
        if (sentencePausePattern.test(lastChar)) {
          await delay(sentencePauseTime);
        }

        const soFar = fullText.substring(0, i).toLowerCase();
        for (const [phrase, pauseDuration] of Object.entries(wordPauseMap)) {
          if (soFar.endsWith(phrase)) {
            await delay(pauseDuration);
          }
        }
      }

      element.innerHTML = originals[paragraphID];
      element.style.minHeight = previousMinHeight;
    };

    const start = async () => {
      const elements = Array.from(document.querySelectorAll(selector));
      cacheOriginals(elements);

      for (const element of elements) {
        if (revealClass) {
          element.classList.remove(revealClass);
        }
        await typewriterEffect(element);
        await delay(getParagraphDelay(element.id));
      }
    };

    return { start };
  };

  window.TypewriterCore = { createTypewriter };
})();
