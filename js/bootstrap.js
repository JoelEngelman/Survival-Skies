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

loop();
