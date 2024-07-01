document.addEventListener("DOMContentLoaded", function() {
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
    for (let i = 1; i < 22; i++) {
      paragraphsToType.push("descrip" + i);
    }
    return paragraphsToType;
  };

  const sleeptime = 40; // Adjust the typing speed as desired

  const runTypewriterForParagraphs = async () => {
    const paragraphsToType = await getText();
    for (const paragraphID of paragraphsToType) {
      const paragraph = document.getElementById(paragraphID);
      paragraph.classList.remove("hidden");
      console.log("paragraphID: " + paragraphID)
      await typewriterEffect(paragraphID, sleeptime);
      if (paragraphID == "descrip2" || paragraphID == "descrip8") {
        console.log("delaying 6000")
        await delay(6000) // was 6000
      } else if (paragraphID == "descrip1" || paragraphID == "descrip12") {
        console.log("delaying 2000")
        await delay(2000) // was 2000
      }
    }
  };

  runTypewriterForParagraphs();
});




// document.addEventListener("DOMContentLoaded", function() {
//     var paragraph = document.getElementById("descrip");
//     // var lastCharPosition = text.length - 1;
//     // console.log("Position of the last character: " + lastCharPosition);
  
//     function delay(ms) {
//       return new Promise(resolve => setTimeout(resolve, ms));
//     }
  
//     let text = paragraph.textContent;
//     let sleeptime = 25;

  
//     const writeLoop = async () => {
//       for (let i = 0; i < (text.length + 1); i++) {
//         document.getElementById("typewriter").innerHTML = text.substring(0, i);
//         await delay(sleeptime);
//       }
//     };
  
//     writeLoop();
//   });


  // document.addEventListener("DOMContentLoaded", function() {
  //   var paragraph = document.getElementById("descrip");
  //   var text = paragraph.textContent;
  //   var lastCharPosition = text.length - 1;
  //   console.log("Position of the last character: " + lastCharPosition);
  
  //   function delay(ms) {
  //     return new Promise(resolve => setTimeout(resolve, ms));
  //   }
  
  //   let descrip = paragraph.textContent;
  //   let sleeptime = 25;
  
  //   let midpoint;
  
  //   if (descrip.length % 2 === 0) {
  //     midpoint = (descrip.length / 2);
  //   } else {
  //     midpoint = (descrip.length / 2);
  //   }
  
  //   const writeLoop = async () => {
  //     for (let i = 0; i < (midpoint + 1); i++) {
  //       document.getElementById("typewriter1").innerHTML = descrip.substring(0, i);
  //       document.getElementById("typewriter2").innerHTML = descrip.substring(descrip.length - i);
  //       await delay(sleeptime);
  //     }
  //   };
  
  //   writeLoop();
  // });