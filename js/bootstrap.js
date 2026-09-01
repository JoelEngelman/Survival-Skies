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
   ============================================================ */

objective();


/* ============================================================
   LOOP
   ============================================================ */

function loop(){

  update();

  draw();

  requestAnimationFrame(loop);

}


/* ============================================================
   CONTROL STATION EXPANSION
   ============================================================ */

const controlStationScript=document.createElement("script");

controlStationScript.src="js/control-station.js";

controlStationScript.onload=()=>loop();

controlStationScript.onerror=()=>loop();

document.body.appendChild(controlStationScript);
