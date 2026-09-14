/* ============================================================
   CONTROL STATION PUZZLE — ENVIRONMENT + BOX PHYSICS FIX
   Keeps the existing control-station gameplay, but makes the
   puzzle physically readable and playable.
   ============================================================ */

/* The station needs one continuous floor. */
tunnelPlatforms.push({
  x:8750,
  y:580,
  w:4000,
  h:120
});

/* The previous puzzle pass added a floating platform at the door.
   Keep the object, but anchor it into the floor so it cannot become
   a random floating ledge. */
for(const p of tunnelPlatforms){
  if(p.x===10420 && p.y===185 && p.w===430 && p.h===35){
    p.y=580;
    p.h=120;
  }
}

/* ============================================================
   CONTROL STATION WALL + DOOR
   ============================================================ */

const puzzlePreviousDraw=drawTunnelWorld;

drawTunnelWorld=function(){

  puzzlePreviousDraw();

  if(!controlStationEntered)return;

  /* Main wall: the door is part of the wall, not a floating platform. */
  ctx.fillStyle="#071114";
  ctx.fillRect(10390,80,560,500);

  /* Door opening */
  ctx.fillStyle="#020708";
  ctx.fillRect(10520,220,210,360);

  /* Door frame */
  ctx.strokeStyle="#6b817a";
  ctx.lineWidth=6;
  ctx.strokeRect(10520,220,210,360);

  /* Door panels */
  ctx.fillStyle="#0d2024";
  ctx.fillRect(10535,235,180,345);

  ctx.strokeStyle="rgba(185,239,200,.18)";
  ctx.lineWidth=2;
  ctx.strokeRect(10535,235,180,345);

  /* Handle at the height Mara has to build up to. */
  ctx.fillStyle="#b9efc8";
  ctx.fillRect(10670,365,9,34);
  ctx.fillStyle="#6b817a";
  ctx.fillRect(10679,376,25,9);

  /* Door access light */
  ctx.fillStyle="rgba(185,239,200,.7)";
  ctx.fillRect(10540,238,170,5);

  ctx.fillStyle="rgba(185,239,200,.65)";
  ctx.font="900 16px monospace";
  ctx.fillText("CONTROL STATION",10415,115);
  ctx.fillStyle="rgba(185,239,200,.4)";
  ctx.fillText("MANUAL ACCESS",10555,210);

  /* Clear visual hint: this is the route to the handle. */
  ctx.strokeStyle="rgba(185,239,200,.35)";
  ctx.lineWidth=2;
  ctx.setLineDash([8,8]);
  ctx.beginPath();
  ctx.moveTo(10675,455);
  ctx.lineTo(10675,410);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle="rgba(185,239,200,.7)";
  ctx.font="900 14px monospace";
  ctx.fillText("HANDLE",10620,450);
};


/* ============================================================
   BOX PHYSICS
   ============================================================ */

function stationBoxSupportY(b){

  let support=580;

  for(const p of tunnelPlatforms){
    if(
      b.x+b.w>p.x &&
      b.x<p.x+p.w &&
      p.y>=b.y+b.h-2 &&
      p.y<support
    ){
      support=p.y;
    }
  }

  for(const other of controlBricks){
    if(other===b || other.held)continue;

    if(
      b.x+b.w>other.x+4 &&
      b.x<other.x+other.w-4 &&
      other.y>=b.y+b.h-2 &&
      other.y<support
    ){
      support=other.y;
    }
  }

  return support;
}

function stationUpdateBoxes(){

  if(!controlStationEntered)return;

  if(heldControlBrick){
    const b=heldControlBrick;
    const direction=player.facing||1;

    b.x=player.x+player.w/2-b.w/2+direction*42;
    b.y=player.y-10;
    b.vx=0;
    b.vy=0;
  }

  for(const b of controlBricks){

    if(b.held)continue;

    b.vy+=0.55;
    b.vy=Math.min(15,b.vy);
    b.x+=b.vx;
    b.y+=b.vy;
    b.vx*=0.82;

    const support=stationBoxSupportY(b);

    if(b.y+b.h>=support && b.vy>=0){
      b.y=support-b.h;
      b.vy=0;
    }

    b.x=Math.max(8750,Math.min(12750-b.w,b.x));
  }
}

updateControlBricks=stationUpdateBoxes;


/* ============================================================
   MARA CAN STAND ON TOP OF BOXES
   ============================================================ */

const puzzleMoveBeforeStanding=move;

move=function(){

  puzzleMoveBeforeStanding();

  if(!controlStationEntered)return;

  for(const b of controlBricks){

    if(b.held)continue;

    const horizontalOverlap=
      player.x+player.w>b.x+4 &&
      player.x<b.x+b.w-4;

    const wasFalling=player.vy>=0;
    const playerBottom=player.y+player.h;

    if(
      horizontalOverlap &&
      wasFalling &&
      playerBottom>=b.y &&
      playerBottom<=b.y+b.h+16
    ){
      player.y=b.y-player.h;
      player.vy=0;
      player.grounded=true;
    }

    const verticalOverlap=
      player.y+player.h>b.y+6 &&
      player.y<b.y+b.h-6;

    if(horizontalOverlap && verticalOverlap){
      const playerCenter=player.x+player.w/2;
      const boxCenter=b.x+b.w/2;

      if(playerCenter<boxCenter){
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
   E = PICK UP / DROP ONLY
   ============================================================ */

const puzzleActionBeforeStanding=action;

action=function(){

  if(!controlStationEntered || stage!==17){
    puzzleActionBeforeStanding();
    return;
  }

  if(heldControlBrick){
    dropControlBrick();
    return;
  }

  const b=nearestControlBrick();

  if(b){
    b.held=true;
    b.vx=0;
    b.vy=0;
    heldControlBrick=b;
    say("MARA","Heavy... but I can move it.",1200);
    return;
  }

  puzzleActionBeforeStanding();
};


/* ============================================================
   HANDLE GOAL
   ============================================================ */

const puzzleProgressBeforeHandle=progress;

progress=function(){

  puzzleProgressBeforeHandle();

  if(!controlStationEntered || stage!==17)return;

  const canTouchHandle=
    player.x+player.w>10635 &&
    player.x<10710 &&
    player.y+player.h<405;

  if(canTouchHandle){
    stage=18;

    objectiveTitle.textContent="OPEN THE CONTROL STATION";
    objectiveText.textContent="Mara can finally reach the door handle.";

    say("MARA","Yes, I can touch the handle now!");

    saveGame();
  }
};
