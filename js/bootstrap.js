/* ============================================================
   START
   ============================================================ */

const startButton=document.getElementById(
  "start"
);

if(hasSavedGame()){

  startButton.textContent=
    "CONTINUE EXPEDITION";

}

startButton.onclick=()=>{

  const continuing=loadGame();

  document.getElementById(
    "intro"
  ).classList.add(
    "hidden"
  );

  gameStarted=true;

  objective();

  if(continuing){

    say(
      "MARA",
      "Back on the trail."
    );

  }
  else{

    say(
      "MARA",
      "The signal came from somewhere ahead. Let's find it."
    );

    saveGame();

  }

};


/* ============================================================
   INITIAL OBJECTIVE
   ============================================================
*/

objective();


/* ============================================================
   LOOP
   ============================================================
*/

function loop(){

  update();

  draw();

  requestAnimationFrame(loop);

}


/* ============================================================
   CONTROL STATION EXPANSION
   ============================================================
*/

const controlStationScript=document.createElement("script");

controlStationScript.src="js/control-station.js?v=3";

function loadDevStageTools(){

  const movementFixScript=document.createElement("script");
  movementFixScript.src="js/control-station-movement-fix.js?v=1";

  function loadPuzzleFix(){

    const puzzleFixScript=document.createElement("script");

    puzzleFixScript.src="js/control-station-puzzle-fix.js?v=3";

    function loadDev(){

      const devStageScript=document.createElement("script");

      devStageScript.src="js/dev-stage-select.js?v=3";

      devStageScript.onload=()=>loop();

      devStageScript.onerror=()=>loop();

      document.body.appendChild(devStageScript);

    }

    puzzleFixScript.onload=loadDev;
    puzzleFixScript.onerror=loadDev;

    document.body.appendChild(puzzleFixScript);
  }

  movementFixScript.onload=loadPuzzleFix;
  movementFixScript.onerror=loadPuzzleFix;

  document.body.appendChild(movementFixScript);
}

controlStationScript.onload=loadDevStageTools;
controlStationScript.onerror=loadDevStageTools;

document.body.appendChild(controlStationScript);
