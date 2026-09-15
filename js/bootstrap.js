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
  document.getElementById("intro").classList.add("hidden");
  gameStarted=true;
  objective();

  if(continuing){
    say("MARA","Back on the trail.");
  }else{
    say("MARA","The signal came from somewhere ahead. Let's find it.");
    saveGame();
  }
};

objective();

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

/* ============================================================
   CONTROL STATION EXPANSION
   ============================================================ */

const controlStationScript=document.createElement("script");
controlStationScript.src="js/control-station.js?v=4";

function loadDevStageTools(){
  const movementFixScript=document.createElement("script");
  movementFixScript.src="js/control-station-movement-fix.js?v=4";

  function loadMovementPatch(){
    const movementPatchScript=document.createElement("script");
    movementPatchScript.src="js/control-station-movement-fix-v2.js?v=1";
    movementPatchScript.onload=loadPuzzleFix;
    movementPatchScript.onerror=loadPuzzleFix;
    document.body.appendChild(movementPatchScript);
  }

  function loadPuzzleFix(){
    const puzzleFixScript=document.createElement("script");
    puzzleFixScript.src="js/control-station-puzzle-fix.js?v=4";

    function loadDev(){
      const devStageScript=document.createElement("script");
      devStageScript.src="js/dev-stage-select.js?v=4";
      devStageScript.onload=()=>loop();
      devStageScript.onerror=()=>loop();
      document.body.appendChild(devStageScript);
    }

    puzzleFixScript.onload=loadDev;
    puzzleFixScript.onerror=loadDev;
    document.body.appendChild(puzzleFixScript);
  }

  movementFixScript.onload=loadMovementPatch;
  movementFixScript.onerror=loadMovementPatch;
  document.body.appendChild(movementFixScript);
}

function loadControlStationLayerFix(){
  const layerFixScript=document.createElement("script");
  layerFixScript.src="js/control-station-layer-fix.js?v=1";
  layerFixScript.onload=loadDevStageTools;
  layerFixScript.onerror=loadDevStageTools;
  document.body.appendChild(layerFixScript);
}

controlStationScript.onload=loadControlStationLayerFix;
controlStationScript.onerror=loadControlStationLayerFix;
document.body.appendChild(controlStationScript);
