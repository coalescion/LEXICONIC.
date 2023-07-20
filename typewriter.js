document.addEventListener("DOMContentLoaded", function() {
    var paragraph = document.getElementById("descrip");
    var text = paragraph.textContent;
    var lastCharPosition = text.length - 1;
    console.log("Position of the last character: " + lastCharPosition);
  
    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    let descrip = paragraph.textContent;
    let sleeptime = 25;
  
    let midpoint;
  
    if (descrip.length % 2 === 0) {
      midpoint = (descrip.length / 2);
    } else {
      midpoint = (descrip.length / 2);
    }
  
    const writeLoop = async () => {
      for (let i = 0; i < (midpoint + 1); i++) {
        document.getElementById("typewriter1").innerHTML = descrip.substring(0, i);
        document.getElementById("typewriter2").innerHTML = descrip.substring(descrip.length - i);
        await delay(sleeptime);
      }
    };
  
    writeLoop();
  });
