/* ============================================================
   DIALOGUE
   ============================================================ */

function say(s,t,d=3200){

  speaker.textContent=s;
  dialogueText.textContent=t;

  dialogue.classList.add("show");

  clearTimeout(say.timer);

  say.timer=setTimeout(()=>{

    dialogue.classList.remove("show");

  },d);

}


/* ============================================================
   NEAREST COMPONENT
   ============================================================ */

function nearestComponent(){

  let best=null;
  let bd=95;

  items.forEach((it,i)=>{

    if(it.collected)return;

    let valid=false;

    if(i===0 && stage===1)
      valid=true;

    if(i===1 && stage===3)
      valid=true;

    if(i===2 && stage===4)
      valid=true;

    if(!valid)return;

    const d=Math.hypot(
      player.x-it.x,
      player.y-it.y
    );

    if(d<bd){

      bd=d;
      best=it;

    }

  });

  return best;

}


/* ============================================================
   NEAREST OBJECT
   ============================================================ */

function nearestObject(){

  let best=null;
  let bd=145;

  objects.forEach(o=>{

    if(!o.active)return;

    const d=Math.hypot(
      player.x-o.x,
      player.y-o.y
    );

    if(d<bd){

      bd=d;
      best=o;

    }

  });

  return best;

}


/* ============================================================
   NEAREST TUNNEL ANCHOR
   ============================================================ */

function nearestAnchor(){

  const list=tunnelMode
    ? tunnelAnchors
    : anchors;

  let best=null;
  let bd=player.grappleRange;

  for(const a of list){

    const d=Math.hypot(
      player.x-a.x,
      player.y-a.y
    );

    if(
      d<bd &&
      a.y<player.y+180
    ){

      bd=d;
      best=a;

    }

  }

  return best;

}


/* ============================================================
   GRAPPLE
   ============================================================ */

function grapple(){

  const a=nearestAnchor();

  if(!a)return;

  player.grapple=a;

  spawn(
    player.x,
    player.y,
    18,
    "energy"
  );

}


function releaseGrapple(launch=true){

  if(!player.grapple)return;

  const a=player.grapple;

  const dx=a.x-player.x;
  const dy=a.y-player.y;

  const d=Math.hypot(dx,dy)||1;

  player.grapple=null;

  if(launch){

    player.vx+=(dx/d)*6;
    player.vy+=(dy/d)*5;

  }

}


function applyGrapple(){

  if(!player.grapple)return;

  const a=player.grapple;

  const dx=a.x-player.x;
  const dy=a.y-player.y;

  const d=Math.hypot(dx,dy)||1;

  if(d<42){

    player.vx*=.5;
    player.vy*=.5;

    return;

  }

  player.vx+=(dx/d)*player.grapplePower;
  player.vy+=(dy/d)*player.grapplePower;

  const maxGrappleSpeed=15;

  player.vx=Math.max(
    -maxGrappleSpeed,
    Math.min(maxGrappleSpeed,player.vx)
  );

  player.vy=Math.max(
    -maxGrappleSpeed,
    Math.min(maxGrappleSpeed,player.vy)
  );

  if(!keys.e)
    releaseGrapple(true);

}


/* ============================================================
   ACTION
   ============================================================ */

function action(){

  if(interactionLock>0)return;

  interactionLock=12;


  /* COMPONENTS ALWAYS GET PRIORITY */

  const c=nearestComponent();

  if(c){

    c.collected=true;

    components++;

    signalEl.style.width=
      (components/3*100)+"%";

    spawn(
      c.x,
      c.y,
      30,
      "energy"
    );

    if(components===1){

      stage=2;

      say(
        "MARA",
        "One piece secured. The rest of the transmitter is somewhere east."
      );

    }
    else if(components===2){

      stage=4;

      say(
        "MARA",
        "Second component. The last power core is ahead."
      );

    }
    else{

      stage=5;

      objects.find(
        o=>o.type==="tower"
      ).active=true;

      say(
        "MARA",
        "That's the last piece. The tower should answer now."
      );

    }

    objective();

    return;

  }


  /* TUNNEL MODE HAS ITS OWN INTERACTION SYSTEM */

  if(tunnelMode){

    tunnelAction();

    return;

  }


  const o=nearestObject();


  if(!o){

    if(!player.grapple)
      grapple();

    return;

  }


  switch(o.type){

    case"shelter":

      if(stage===0){

        stage=1;

        say(
          "MARA",
          "Someone was here recently. The transmitter component is still warm."
        );

        objective();

      }

    break;


    case"radio":

      if(stage===3){

        items[1].collected=true;

        components++;

        stage=4;

        signalEl.style.width=
          (components/3*100)+"%";

        spawn(
          o.x,
          o.y,
          30,
          "energy"
        );

        say(
          "MARA",
          "The second component was hidden in the radio cabinet."
        );

        objective();

      }

    break;


    case"tower":

      if(
        stage===5 &&
        components>=3
      ){

        gameStarted=false;

        say(
          "MARA",
          "Power is flowing... someone is answering.",
          1500
        );

        setTimeout(
          transmitterCutscene,
          1500
        );

      }

    break;


    case"settlement":

      if(stage===7){

        stage=8;

        say(
          "MARA",
          "I followed your signal. Who are you?"
        );

        setTimeout(()=>{

          say(
            "LEADER",
            "We're what's left of Sector 07."
          );

        },1700);

        objective();

      }
      else if(
        stage===14 &&
        tunnelEscaped &&
        !leaderHasBeenTold
      ){

        tellLeader();

      }

    break;


    case"transit":

      if(
        stage===8 ||
        stage===9
      ){

        enterTunnel();

      }
      else if(stage===16){

        triggerDescentCutscene();

      }

    break;


    case"cave":

      if(stage===10){

        triggerCaveTrap();

      }

    break;


    case"survivors":

      if(stage===11){

        triggerSurvivorCutscene();

      }

    break;


    case"return":

      if(stage===15){

        triggerArchiveCutscene();

      }

    break;

  }

}


/* ============================================================
   TUNNEL ACTION
   ============================================================ */

function tunnelAction(){

  if(stage===10){

    if(player.x>1200){

      stage=11;

      objective();

      say(
        "MARA",
        "There's someone deeper in here. I can hear them."
      );

    }

    return;

  }


  if(stage===11){

    if(
      player.x>4700 &&
      player.x<6000
    ){

      triggerSurvivorCutscene();

    }

    return;

  }


  if(stage===12){

    if(player.x>6000){

      stage=13;

      objective();

      say(
        "MARA",
        "That shaft... that's our way out."
      );

    }

    return;

  }


  if(stage===13){

    if(player.x>8050){

      escapeTunnel();

    }

    return;

  }

}
