/* ============================================================
   CONTROL STATION — CHAPTER TWO
   ============================================================ */

tunnelPlatforms.push({x:9000,y:580,w:4200,h:120});

let controlStationEntered=false;
let controlRoomTransitioning=false;

function enterControlStation(){
  if(controlStationEntered)return;
  if(stage!==17 || cutsceneActive)return;

  controlStationEntered=true;
  tunnelMode=true;

  player.x=9150;
  player.y=580-player.h;
  player.spawnX=9150;
  player.spawnY=580-player.h;
  player.vx=0;
  player.vy=0;
  player.grounded=true;
  player.grapple=null;

  camX=8700;
  camY=0;

  objectiveTitle.textContent="REACH THE CONTROL STATION";
  objectiveText.textContent="The door is ahead, but the handle is too high to reach. Find a way up.";

  say("MARA","The control station... but I can't reach the door handle.");
}

function enterControlRoom(){
  if(controlRoomTransitioning)return;
  controlRoomTransitioning=true;
  stage=18;
  player.vx=0;
  player.vy=0;
  player.grapple=null;
  objectiveTitle.textContent="EXPLORE THE CONTROL STATION";
  objectiveText.textContent="The station is still powered. Find out what it was controlling.";
  if(typeof hybridSetRoomMode==="function")hybridSetRoomMode(true);
  saveGame();
  say("MARA","This place is bigger than I expected.");
}

const controlStationWatcher=setInterval(()=>{
  if(!cutsceneActive && stage===17 && !controlStationEntered)enterControlStation();
  if(!cutsceneActive && stage>=18 && typeof hybridSetRoomMode==="function"){
    controlStationEntered=true;
    if(!document.getElementById("webgl-hybrid")?.classList.contains("room-mode"))hybridSetRoomMode(true);
  }
},100);

/* ============================================================
   STATION BACKGROUND
   ============================================================ */

const controlStationDrawBase=drawTunnelWorld;
drawTunnelWorld=function(){
  if(!controlStationEntered){
    controlStationDrawBase();
    return;
  }

  /* Station structure is painted before the normal world so Mara
     and every movable box can remain visibly in front of it. */
  ctx.fillStyle="#071114";
  ctx.fillRect(10150,150,900,430);

  ctx.fillStyle="#020708";
  ctx.fillRect(10480,230,240,350);
  ctx.strokeStyle="#71857f";
  ctx.lineWidth=7;
  ctx.strokeRect(10480,230,240,350);

  ctx.fillStyle="#0d2024";
  ctx.fillRect(10496,246,208,334);
  ctx.strokeStyle="rgba(185,239,200,.18)";
  ctx.lineWidth=2;
  ctx.strokeRect(10496,246,208,334);

  ctx.fillStyle="#b9efc8";
  ctx.fillRect(10620,365,10,38);
  ctx.fillStyle="#6b817a";
  ctx.fillRect(10630,378,30,10);

  ctx.fillStyle="#12292d";
  ctx.fillRect(10525,300,70,115);
  ctx.strokeStyle="rgba(185,239,200,.3)";
  ctx.strokeRect(10525,300,70,115);
  ctx.fillStyle="rgba(185,239,200,.55)";
  ctx.fillRect(10542,320,35,5);
  ctx.fillRect(10542,342,35,5);
  ctx.fillRect(10542,364,20,5);

  ctx.fillStyle="rgba(185,239,200,.65)";
  ctx.font="900 18px monospace";
  ctx.fillText("CONTROL STATION",10180,185);
  ctx.font="900 14px monospace";
  ctx.fillText("MANUAL DOOR",10535,215);

  controlStationDrawBase();
};

/* ============================================================
   MOVABLE BOXES
   ============================================================ */

const controlBricks=[
  {x:9550,y:520,w:82,h:60,held:false,vx:0,vy:0},
  {x:9680,y:520,w:82,h:60,held:false,vx:0,vy:0},
  {x:9810,y:520,w:82,h:60,held:false,vx:0,vy:0},
  {x:9940,y:520,w:82,h:60,held:false,vx:0,vy:0},
  {x:10070,y:520,w:82,h:60,held:false,vx:0,vy:0},
  {x:10200,y:520,w:82,h:60,held:false,vx:0,vy:0}
];

let heldControlBrick=null;

function controlBrickDistance(b){
  return Math.hypot(player.x+player.w/2-(b.x+b.w/2),player.y+player.h/2-(b.y+b.h/2));
}

function nearestControlBrick(){
  let best=null;
  let distance=105;
  for(const b of controlBricks){
    if(b.held)continue;
    const d=controlBrickDistance(b);
    if(d<distance){distance=d;best=b;}
  }
  return best;
}

function dropControlBrick(){
  if(!heldControlBrick)return;
  const b=heldControlBrick;
  const direction=player.facing||1;
  b.held=false;
  b.x=player.x+player.w/2-b.w/2+direction*50;
  b.y=player.y+player.h-b.h;
  b.vx=0;
  b.vy=0;
  heldControlBrick=null;
}

function controlBrickSupportY(b){
  let support=580;

  for(const p of tunnelPlatforms){
    if(b.x+b.w>p.x && b.x<p.x+p.w && p.y>=b.y+b.h-1 && p.y<support)support=p.y;
  }

  for(const other of controlBricks){
    if(other===b || other.held)continue;
    if(b.x+b.w>other.x+4 && b.x<other.x+other.w-4 && other.y>=b.y+b.h-1 && other.y<support)support=other.y;
  }

  return support;
}

function updateControlBricks(){
  if(!controlStationEntered || stage!==17)return;

  if(heldControlBrick){
    const b=heldControlBrick;
    const direction=player.facing||1;
    b.x=player.x+player.w/2-b.w/2+direction*42;
    b.y=player.y-12;
    b.vx=0;
    b.vy=0;
  }

  for(const b of controlBricks){
    if(b.held)continue;
    b.vy+=.55;
    b.vy=Math.min(15,b.vy);
    b.x+=b.vx;
    b.y+=b.vy;
    b.vx*=.82;

    const support=controlBrickSupportY(b);
    if(b.y+b.h>=support && b.vy>=0){
      b.y=support-b.h;
      b.vy=0;
    }

    b.x=Math.max(9000,Math.min(13200-b.w,b.x));
  }
}

/* ============================================================
   SOLID BOX COLLISION
   ============================================================ */

const controlStationOriginalMove=move;
move=function(){
  controlStationOriginalMove();
  if(!controlStationEntered || stage!==17)return;

  updateControlBricks();

  for(const b of controlBricks){
    if(b.held)continue;

    const overlapX=player.x+player.w>b.x && player.x<b.x+b.w;
    if(!overlapX)continue;

    const playerBottom=player.y+player.h;

    if(player.vy>=0 && playerBottom>=b.y && playerBottom<=b.y+b.h+12){
      player.y=b.y-player.h;
      player.vy=0;
      player.grounded=true;
      player.jumps=0;
      continue;
    }

    const overlapY=player.y+player.h>b.y+5 && player.y<b.y+b.h-5;
    if(overlapY){
      if(player.x+player.w/2<b.x+b.w/2){
        player.x=b.x-player.w;
        if(player.vx>0)player.vx=0;
      }else{
        player.x=b.x+b.w;
        if(player.vx<0)player.vx=0;
      }
    }
  }
};

/* ============================================================
   E ONLY — CONTACT NEVER PICKS UP
   ============================================================ */

const controlStationOriginalAction=action;
action=function(){
  if(!controlStationEntered || stage!==17){
    controlStationOriginalAction();
    return;
  }

  if(heldControlBrick){
    dropControlBrick();
    say("MARA","That should hold.",1000);
    return;
  }

  const b=nearestControlBrick();
  if(b){
    b.held=true;
    b.vx=0;
    b.vy=0;
    heldControlBrick=b;
    say("MARA","Heavy... but I can move it.",1000);
    return;
  }

  controlStationOriginalAction();
};

/* ============================================================
   DRAW BOXES + PLAYER IN THE FOREGROUND
   ============================================================ */

function drawControlStationForeground(){
  if(!controlStationEntered || stage!==17)return;

  for(const b of controlBricks){
    ctx.save();
    ctx.fillStyle="#5a5146";
    ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.fillStyle="#756957";
    ctx.fillRect(b.x,b.y,b.w,6);
    ctx.strokeStyle="rgba(210,195,165,.35)";
    ctx.lineWidth=2;
    ctx.strokeRect(b.x,b.y,b.w,b.h);
    ctx.strokeStyle="rgba(20,25,25,.35)";
    ctx.beginPath();
    ctx.moveTo(b.x+12,b.y+15);
    ctx.lineTo(b.x+b.w-14,b.y+b.h-14);
    ctx.moveTo(b.x+b.w-22,b.y+12);
    ctx.lineTo(b.x+18,b.y+b.h-17);
    ctx.stroke();
    ctx.restore();
  }

  /* Explicit final player pass fixes the station doorway draw-order
     without changing player rendering anywhere else. */
  drawPlayer();
  drawParticles();
}

const controlStationOriginalDraw=draw;
draw=function(){
  controlStationOriginalDraw();
  if(controlStationEntered && stage===17)drawControlStationForeground();
};

/* ============================================================
   HANDLE GOAL
   ============================================================ */

const controlStationOriginalProgress=progress;
progress=function(){
  controlStationOriginalProgress();
  if(!controlStationEntered || stage!==17)return;

  const touchingHandle=
    player.x+player.w>10605 &&
    player.x<10655 &&
    player.y+player.h<405;

  if(touchingHandle){
    stage=18;
    objectiveTitle.textContent="OPENING CONTROL STATION";
    objectiveText.textContent="Mara reached the handle. The door opens into the control room.";
    say("MARA","Yes, I can touch the handle now!");
    saveGame();
    setTimeout(()=>enterControlRoom(),700);
  }
};

/* ============================================================
   CONTROL STATION CAMERA
   Keep the new area fully scrollable without changing the
   camera behavior anywhere else in the game.
   ============================================================ */

const controlStationOriginalUpdate=update;
update=function(){
  controlStationOriginalUpdate();
  if(!controlStationEntered || stage!==17)return;

  const controlStationWorldRight=13200;
  const maxCameraX=Math.max(0,controlStationWorldRight-W);
  const targetCameraX=Math.max(
    0,
    Math.min(
      maxCameraX,
      player.x-W*.35
    )
  );

  camX+=(targetCameraX-camX)*.18;

  if(Math.abs(targetCameraX-camX)<.5)
    camX=targetCameraX;
};
