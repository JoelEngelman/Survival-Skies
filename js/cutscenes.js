/* ============================================================
   TRANSMITTER CUTSCENE
   ============================================================ */

function transmitterCutscene(){

  gameStarted=false;

  cutsceneActive=true;

  cutMode="transmitter";

  cutLines=[

    [
      "MARA",
      "Hello? Is anyone receiving this?"
    ],

    [
      "SURVIVOR",
      "...Mara?"
    ],

    [
      "MARA",
      "Who is this? How do you know my name?"
    ],

    [
      "SURVIVOR",
      "Because we heard your signal. Every night."
    ],

    [
      "MARA",
      "You were here the whole time?"
    ],

    [
      "SURVIVOR",
      "We were trapped. The Collapse cut the city apart."
    ],

    [
      "MARA",
      "Then I am getting you out."
    ],

    [
      "SURVIVOR",
      "Mara... follow the lights east."
    ],

    [
      "MARA",
      "Where do they lead?"
    ],

    [
      "SURVIVOR",
      "To the people still living above the ruins."
    ]

  ];

  cutIndex=0;

  cutscene.classList.remove(
    "tunnelScene"
  );

  cutscene.classList.add(
    "show"
  );

  showCut();

  clearInterval(cutTimer);

  cutTimer=setInterval(()=>{

    if(!cutsceneActive)return;

    cutIndex++;

    if(
      cutIndex>=cutLines.length
    ){

      endTransmitterCutscene();

    }
    else{

      showCut();

    }

  },2800);

}


/* ============================================================
   SHOW CUTSCENE
   ============================================================ */

function showCut(){

  cutSpeaker.textContent=
    cutLines[cutIndex][0];

  cutText.textContent=
    cutLines[cutIndex][1];

}


/* ============================================================
   ADVANCE CUTSCENE
   ============================================================ */

function advanceCutscene(){

  if(!cutsceneActive)return;

  clearInterval(cutTimer);

  cutIndex++;

  if(
    cutIndex>=cutLines.length
  ){

    if(cutMode==="transmitter")
      endTransmitterCutscene();

    else if(cutMode==="cave")
      endCaveCutscene();

    else if(cutMode==="survivors")
      endSurvivorCutscene();

    else if(cutMode==="leader")
      endLeaderCutscene();

    else if(cutMode==="archive")
      endArchiveCutscene();

    else if(cutMode==="descent")
      endDescentCutscene();

    else if(cutMode==="tunnel")
      endTunnelIntro();

  }
  else{

    showCut();

    cutTimer=setInterval(()=>{

      if(!cutsceneActive)return;

      cutIndex++;

      if(
        cutIndex>=cutLines.length
      ){

        if(cutMode==="transmitter")
          endTransmitterCutscene();

        else if(cutMode==="cave")
          endCaveCutscene();

        else if(cutMode==="survivors")
          endSurvivorCutscene();

        else if(cutMode==="leader")
          endLeaderCutscene();

        else if(cutMode==="tunnel")
          endTunnelIntro();

      }
      else{

        showCut();

      }

    },2800);

  }

}


/* ============================================================
   END TRANSMITTER
   ============================================================ */

function endTransmitterCutscene(){

  clearInterval(cutTimer);

  cutsceneActive=false;

  cutscene.classList.remove(
    "show"
  );

  stage=6;

  player.x=4010;
  player.y=500-player.h;

  player.spawnX=4010;
  player.spawnY=500-player.h;

  player.vx=0;
  player.vy=0;

  player.grounded=true;
  player.grapple=null;

  camX=3700;
  camY=0;

  objects.find(
    o=>o.type==="settlement"
  ).active=true;

  gameStarted=true;

  objective();

  say(
    "MARA",
    "They're alive. Follow the lights."
  );

}


/* ============================================================
   CAVE TRAP
   ============================================================ */

function triggerCaveTrap(){

  gameStarted=false;

  cutsceneActive=true;

  cutMode="cave";

  cutscene.classList.add(
    "show"
  );

  const lines=[

    [
      "MARA",
      "Hello? Anyone down here?"
    ],

    [
      "MARA",
      "...Wait."
    ],

    [
      "MARA",
      "That wasn't the wind."
    ],

    [
      "SURVIVOR",
      "DON'T MOVE!"
    ],

    [
      "MARA",
      "Who are you?"
    ],

    [
      "SURVIVOR",
      "The floor. It's unstable."
    ],

    [
      "MARA",
      "Oh no—"
    ],

    [
      "SURVIVOR",
      "RUN!"
    ],

    [
      "MARA",
      "..."
    ],

    [
      "SURVIVOR",
      "Mara? Are you alive?"
    ],

    [
      "MARA",
      "I'm trapped."
    ],

    [
      "SURVIVOR",
      "So are we."
    ],

    [
      "MARA",
      "How many of you are there?"
    ],

    [
      "SURVIVOR",
      "Six."
    ],

    [
      "MARA",
      "Then we're getting all seven of us out."
    ]

  ];

  cutLines=lines;

  cutIndex=0;

  showCut();

  clearInterval(cutTimer);

  cutTimer=setInterval(()=>{

    if(!cutsceneActive)return;

    cutIndex++;

    if(
      cutIndex>=cutLines.length
    ){

      endCaveCutscene();

    }
    else{

      showCut();

    }

  },2200);

}


/* ============================================================
   END CAVE
   ============================================================ */

function endCaveCutscene(){

  clearInterval(cutTimer);

  cutscene.classList.remove(
    "show"
  );

  cutsceneActive=false;

  tunnelMode=true;

  stage=10;

  player.x=100;
  player.y=570-player.h;

  player.spawnX=100;
  player.spawnY=570-player.h;

  player.vx=0;
  player.vy=0;

  player.grounded=true;

  player.grapple=null;

  camX=0;
  camY=0;

  gameStarted=true;

  objective();

  say(
    "MARA",
    "The entrance is gone. We're trapped underground."
  );

}


/* ============================================================
   ENTER TUNNEL
   ============================================================ */

function enterTunnel(){

  if(
    tunnelMode
  )return;

  if(
    stage!==8 &&
    stage!==9
  )return;


  gameStarted=false;

  tunnelMode=true;

  cutsceneActive=true;

  cutMode="tunnel";

  cutscene.classList.add(
    "tunnelScene",
    "show"
  );


  cutLines=[

    [
      "MARA",
      "This place is older than the city."
    ],

    [
      "LEADER",
      "Our people followed a signal down here."
    ],

    [
      "MARA",
      "And they never came back."
    ],

    [
      "LEADER",
      "Be careful."
    ],

    [
      "MARA",
      "I'll find them."
    ]

  ];


  cutIndex=0;

  showCut();

  clearInterval(cutTimer);

  cutTimer=setInterval(()=>{

    if(!cutsceneActive)return;

    cutIndex++;

    if(
      cutIndex>=cutLines.length
    ){

      endTunnelIntro();

    }
    else{

      showCut();

    }

  },2400);

}


/* ============================================================
   END TUNNEL INTRO
   ============================================================ */

function endTunnelIntro(){

  clearInterval(cutTimer);

  cutsceneActive=false;

  cutscene.classList.remove(
    "show",
    "tunnelScene"
  );

  tunnelMode=true;

  stage=10;

  player.x=100;
  player.y=570-player.h;

  player.spawnX=100;
  player.spawnY=570-player.h;

  player.vx=0;
  player.vy=0;

  player.grounded=true;

  camX=0;
  camY=0;

  gameStarted=true;

  objective();

  say(
    "MARA",
    "The door sealed behind us."
  );

}


/* ============================================================
   SURVIVOR CUTSCENE
   ============================================================ */

function triggerSurvivorCutscene(){

  if(!tunnelMode)return;

  gameStarted=false;

  cutsceneActive=true;

  cutMode="survivors";

  cutscene.classList.add(
    "tunnelScene",
    "show"
  );


  cutLines=[

    [
      "MARA",
      "You're the people from the radio."
    ],

    [
      "SCAVENGER",
      "And you're Mara."
    ],

    [
      "MARA",
      "How does everyone know my name?"
    ],

    [
      "SCAVENGER",
      "Because your signal wasn't the first."
    ],

    [
      "MARA",
      "What do you mean?"
    ],

    [
      "SCAVENGER",
      "Someone transmitted from beneath the city."
    ],

    [
      "MARA",
      "The Collapse?"
    ],

    [
      "SCAVENGER",
      "It wasn't natural."
    ],

    [
      "MARA",
      "Then what happened?"
    ],

    [
      "SCAVENGER",
      "The city was shut down deliberately."
    ],

    [
      "MARA",
      "By who?"
    ],

    [
      "SCAVENGER",
      "We don't know."
    ],

    [
      "SCAVENGER",
      "But we found a facility below the transit system."
    ],

    [
      "MARA",
      "What kind of facility?"
    ],

    [
      "SCAVENGER",
      "A control station."
    ],

    [
      "SCAVENGER",
      "It was still powered."
    ],

    [
      "MARA",
      "What did you find inside?"
    ],

    [
      "SCAVENGER",
      "Records."
    ],

    [
      "MARA",
      "Records of what?"
    ],

    [
      "SCAVENGER",
      "The day the sky cities fell."
    ],

    [
      "MARA",
      "Then we need to get out."
    ],

    [
      "SCAVENGER",
      "There's a maintenance shaft further east."
    ],

    [
      "SCAVENGER",
      "If we reach it, we can get everyone back to the surface."
    ],

    [
      "MARA",
      "Then stay close."
    ],

    [
      "SCAVENGER",
      "We have six people."
    ],

    [
      "MARA",
      "Then I'm getting six people home."
    ]

  ];


  cutIndex=0;

  showCut();

  clearInterval(cutTimer);

  cutTimer=setInterval(()=>{

    if(!cutsceneActive)return;

    cutIndex++;

    if(
      cutIndex>=cutLines.length
    ){

      endSurvivorCutscene();

    }
    else{

      showCut();

    }

  },2400);

}


/* ============================================================
   END SURVIVOR CUTSCENE
   ============================================================ */

function endSurvivorCutscene(){

  clearInterval(cutTimer);

  cutsceneActive=false;

  cutscene.classList.remove(
    "show",
    "tunnelScene"
  );

  stage=12;

  setCheckpoint(
    5100,
    500-player.h
  );

  gameStarted=true;

  objective();

  say(
    "MARA",
    "Everyone stays together. We're finding that shaft."
  );

}


/* ============================================================
   ESCAPE TUNNEL
   ============================================================ */

function escapeTunnel(){

  if(
    !tunnelMode ||
    stage!==13
  )return;


  tunnelMode=false;

  tunnelEscaped=true;
  survivorsFollowing=true;

  stage=14;

  player.x=10750;
  player.y=510-player.h;

  player.spawnX=10750;
  player.spawnY=510-player.h;

  player.vx=0;
  player.vy=0;

  player.grounded=true;

  player.grapple=null;

  camX=10300;
  camY=0;

  objects.find(
    o=>o.type==="return"
  ).active=false;

  objects.find(
    o=>o.type==="settlement"
  ).active=true;

  gameStarted=true;

  objective();


  say(
    "MARA",
    "We made it. Everyone's alive."
  );


  setTimeout(()=>{

    say(
      "SCAVENGER",
      "We need to warn your leader about that facility."
    );

  },2600);

}


/* ============================================================
   TELL LEADER
   ============================================================ */

function tellLeader(){

  if(
    stage!==14 ||
    leaderHasBeenTold
  )return;


  gameStarted=false;

  cutsceneActive=true;

  cutMode="leader";

  leaderHasBeenTold=true;

  cutscene.classList.remove(
    "tunnelScene"
  );

  cutscene.classList.add(
    "show"
  );


  cutLines=[

    [
      "MARA",
      "We found six people underground."
    ],

    [
      "LEADER",
      "Six?"
    ],

    [
      "MARA",
      "They're alive. They survived the Collapse down there."
    ],

    [
      "LEADER",
      "What did they tell you?"
    ],

    [
      "MARA",
      "The Collapse wasn't an accident."
    ],

    [
      "LEADER",
      "I always knew it."
    ],

    [
      "MARA",
      "They found a powered facility beneath the transit system."
    ],

    [
      "LEADER",
      "The old control station..."
    ],

    [
      "MARA",
      "You know it?"
    ],

    [
      "LEADER",
      "My father used to talk about it."
    ],

    [
      "MARA",
      "What was it?"
    ],

    [
      "LEADER",
      "A system designed to control the floating city's stabilisers."
    ],

    [
      "MARA",
      "Then the Collapse could have been triggered."
    ],

    [
      "LEADER",
      "Not could have."
    ],

    [
      "LEADER",
      "It was."
    ],

    [
      "MARA",
      "Who did it?"
    ],

    [
      "LEADER",
      "That's the part nobody knows."
    ],

    [
      "MARA",
      "Then we go back."
    ],

    [
      "LEADER",
      "Mara..."
    ],

    [
      "LEADER",
      "If that facility is still powered, someone may still be using it."
    ],

    [
      "MARA",
      "Then we find them."
    ]

  ];


  cutIndex=0;

  showCut();

  clearInterval(cutTimer);

  cutTimer=setInterval(()=>{

    if(!cutsceneActive)return;

    cutIndex++;

    if(
      cutIndex>=cutLines.length
    ){

      endLeaderCutscene();

    }
    else{

      showCut();

    }

  },2600);

}


/* ============================================================
   END LEADER CUTSCENE
   ============================================================ */

function endLeaderCutscene(){

  clearInterval(cutTimer);

  cutsceneActive=false;

  cutscene.classList.remove(
    "show"
  );

  stage=15;

  objects.find(
    o=>o.type==="return"
  ).active=true;

  gameStarted=true;

  objective();

  say(
    "LEADER",
    "The eastern archive relay may still hold the control station's coordinates."
  );

  setTimeout(()=>{

    say(
      "MARA",
      "Then this isn't the end."
    );

  },2800);

}


/* ============================================================
   ARCHIVE RELAY
   ============================================================ */

function triggerArchiveCutscene(){

  if(stage!==15)return;

  gameStarted=false;

  cutsceneActive=true;

  cutMode="archive";

  cutscene.classList.remove(
    "tunnelScene"
  );

  cutscene.classList.add(
    "show"
  );

  cutLines=[

    [
      "MARA",
      "This relay still has power."
    ],

    [
      "SCAVENGER",
      "It used to guide cargo lifts below Sector 07."
    ],

    [
      "MARA",
      "There. Coordinates for the control station."
    ],

    [
      "LEADER",
      "Bring them to the transit gate. We can unlock the lower route."
    ]

  ];

  cutIndex=0;

  showCut();

  clearInterval(cutTimer);

  cutTimer=setInterval(()=>{

    if(!cutsceneActive)return;

    cutIndex++;

    if(cutIndex>=cutLines.length){

      endArchiveCutscene();

    }
    else{

      showCut();

    }

  },4300);

}


function endArchiveCutscene(){

  clearInterval(cutTimer);

  cutsceneActive=false;

  cutscene.classList.remove(
    "show"
  );

  stage=16;

  objects.find(
    o=>o.type==="return"
  ).active=false;

  objects.find(
    o=>o.type==="transit"
  ).active=true;

  gameStarted=true;

  objective();

  say(
    "MARA",
    "The transit gate is west. Stay with me."
  );

}


/* ============================================================
   LOWER TRANSIT GATE
   ============================================================ */

function triggerDescentCutscene(){

  if(stage!==16)return;

  gameStarted=false;

  cutsceneActive=true;

  cutMode="descent";

  cutscene.classList.add(
    "tunnelScene",
    "show"
  );

  cutLines=[

    [
      "MARA",
      "The coordinates worked. The lower gate is open."
    ],

    [
      "LEADER",
      "Then the control station is waiting for us."
    ],

    [
      "MARA",
      "Not waiting. Watching."
    ]

  ];

  cutIndex=0;

  showCut();

  clearInterval(cutTimer);

  cutTimer=setInterval(()=>{

    if(!cutsceneActive)return;

    cutIndex++;

    if(cutIndex>=cutLines.length){

      endDescentCutscene();

    }
    else{

      showCut();

    }

  },4300);

}


function endDescentCutscene(){

  clearInterval(cutTimer);

  cutsceneActive=false;

  cutscene.classList.remove(
    "show",
    "tunnelScene"
  );

  stage=17;

  gameStarted=true;

  objective();

  say(
    "MARA",
    "The descent begins."
  );

}

/* ============================================================
   PROMPT
   ============================================================ */

function updatePrompt(){

  if(
    !gameStarted ||
    cutsceneActive
  ){

    prompt.classList.remove(
      "show"
    );

    return;

  }


  if(tunnelMode){

    if(
      stage===11 &&
      player.x>4500 &&
      player.x<6000
    ){

      prompt.textContent=
        "Press E to speak with the survivors";

      prompt.classList.add(
        "show"
      );

      return;

    }


    if(
      stage===13 &&
      player.x>7900
    ){

      prompt.textContent=
        "Press E to use the maintenance lift";

      prompt.classList.add(
        "show"
      );

      return;

    }


    if(
      stage===10 &&
      player.x>700
    ){

      prompt.textContent=
        "Keep exploring";

      prompt.classList.add(
        "show"
      );

      return;

    }


    if(
      nearestAnchor()
    ){

      prompt.textContent=
        player.grapple
          ? "Release E to launch"
          : "Hold E to grapple";

      prompt.classList.add(
        "show"
      );

      return;

    }


    prompt.classList.remove(
      "show"
    );

    return;

  }


  const c=nearestComponent();

  if(c){

    prompt.textContent=
      "Press E to collect component";

    prompt.classList.add(
      "show"
    );

    return;

  }


  const o=nearestObject();

  if(o){

    if(
      o.type==="tower"
    ){

      prompt.textContent=
        "Press E to activate transmitter";

    }
    else if(
      o.type==="transit"
    ){

      prompt.textContent=
        "Press E to enter underground transit";

    }
    else if(
      o.type==="cave"
    ){

      prompt.textContent=
        "Press E to investigate";

    }
    else if(
      o.type==="settlement" &&
      stage===14 &&
      tunnelEscaped
    ){

      prompt.textContent=
        "Press E to speak to the leader";

    }
    else if(
      o.type==="return" &&
      stage===15
    ){

      prompt.textContent=
        "Press E to access archive relay";

    }
    else if(
      o.type==="transit" &&
      stage===16
    ){

      prompt.textContent=
        "Press E to unlock lower transit gate";

    }
    else{

      prompt.textContent=
        "Press E to interact";

    }

    prompt.classList.add(
      "show"
    );

    return;

  }


  if(nearestAnchor()){

    prompt.textContent=
      player.grapple
        ? "Release E to launch"
        : "Hold E to grapple";

    prompt.classList.add(
      "show"
    );

    return;

  }


  prompt.classList.remove(
    "show"
  );

}
