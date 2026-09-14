/* ============================================================
   CONTROL STATION PUZZLE FIXES
   ADDITIVE ONLY
   ============================================================ */

/* Actual control-system platform. Mara must build up to this. */
tunnelPlatforms.push({
  x:10420,
  y:185,
  w:430,
  h:35
});

/* A low floor beneath the brick puzzle keeps the blocks in the
   playable area instead of letting them disappear below the station. */
tunnelPlatforms.push({
  x:8750,
  y:580,
  w:1600,
  h:120
});


/* ============================================================
   CLEARLY SHOW THE ROUTE / GOAL
   ============================================================ */

const puzzleOriginalDraw=drawTunnelWorld;

drawTunnelWorld=function(){

  puzzleOriginalDraw();

  if(!controlStationEntered)return;

  /* Big visible route markers */
  ctx.fillStyle="rgba(185,239,200,.08)";
  ctx.fillRect(10020,390,120,8);
  ctx.fillRect(10180,330,120,8);
  ctx.fillRect(10340,270,120,8);

  ctx.fillStyle="rgba(185,239,200,.75)";
  ctx.font="900 15px monospace";
  ctx.fillText("BUILD YOUR WAY UP",10020,370);

  /* Control station platform / terminal */
  ctx.fillStyle="#0d2529";
  ctx.fillRect(10420,185,430,35);

  ctx.fillStyle="#6b817a";
  ctx.fillRect(10420,185,430,5);

  ctx.strokeStyle="rgba(185,239,200,.45)";
  ctx.lineWidth=2;
  ctx.strokeRect(10420,185,430,35);

  ctx.fillStyle="#b9efc8";
  ctx.font="900 17px monospace";
  ctx.fillText("CONTROL SYSTEM",10520,178);

  /* Arrow pointing toward the actual goal */
  ctx.strokeStyle="rgba(185,239,200,.7)";
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(10635,250);
  ctx.lineTo(10635,215);
  ctx.lineTo(10622,228);
  ctx.moveTo(10635,215);
  ctx.lineTo(10648,228);
  ctx.stroke();

};


/* ============================================================
   BETTER BRICK PHYSICS
   ============================================================

/* Replace the old update with a version where bricks rest on platforms,
   can be pushed, and NEVER get picked up just by touching them. */

function puzzleSupportY(b){

  let support=700;

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
      b.x+b.w>other.x+6 &&
      b.x<other.x+other.w-6 &&
      other.y>=b.y+b.h-2 &&
      other.y<support
    ){
      support=other.y;
    }

  }

  return support;
}

function puzzleUpdateBricks(){

  if(!controlStationEntered)return;

  if(heldControlBrick){

    const b=heldControlBrick;
    const direction=player.facing||1;

    /* Held blocks follow Mara and do not collide with her. */
    b.x=player.x+player.w/2-b.w/2+direction*48;
    b.y=player.y-18;
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

    const support=puzzleSupportY(b);

    if(b.y+b.h>=support && b.vy>=0){
      b.y=support-b.h;
      b.vy=0;
    }

    b.x=Math.max(8750,Math.min(12750-b.w,b.x));
  }
}

/* The original control-station script already wraps move(). Wrap that
   final move function once more so Mara and loose bricks cannot overlap. */
const puzzleOriginalMove=move;

move=function(){

  puzzleOriginalMove();

  if(!controlStationEntered || heldControlBrick)return;

  for(const b of controlBricks){

    if(b.held)continue;

    if(
      player.x+player.w>b.x &&
      player.x<b.x+b.w &&
      player.y+player.h>b.y+5 &&
      player.y<b.y+b.h-5
    ){

      const playerCenter=player.x+player.w/2;
      const brickCenter=b.x+b.w/2;

      /* Push horizontally instead of allowing Mara to become stuck
         inside the block. */
      if(playerCenter<brickCenter){
        player.x=b.x-player.w;
        b.x+=Math.max(0,player.vx)*.9;
      }
      else{
        player.x=b.x+b.w;
        b.x-=Math.max(0,-player.vx)*.9;
      }

      b.x=Math.max(8750,Math.min(12750-b.w,b.x));
    }
  }
};


/* ============================================================
   E MEANS PICK UP — NOT TOUCH
   ============================================================ */

/* The existing action wrapper already makes E the pickup action.
   This explicit guard makes that rule unambiguous and prevents any
   accidental pickup from collision code. */
const puzzleOriginalAction=action;

action=function(){

  if(!controlStationEntered){
    puzzleOriginalAction();
    return;
  }

  if(stage!==17){
    puzzleOriginalAction();
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

  puzzleOriginalAction();
};


/* ============================================================
   BUILDABLE STAIR CHECK
   ============================================================

/* A brick can form part of the staircase by resting on another brick.
   The goal only activates when Mara actually reaches the control
   platform, rather than simply walking underneath it. */
const puzzleOriginalProgress=progress;

progress=function(){

  puzzleOriginalProgress();

  if(!controlStationEntered || stage!==17)return;

  if(
    player.x+player.w>10420 &&
    player.x<10850 &&
    player.y+player.h<=225
  ){

    stage=18;

    objectiveTitle.textContent="ACCESS THE CONTROL SYSTEM";
    objectiveText.textContent="The manual override is open. Find out what the station was built to control.";

    say(
      "MARA",
      "I can reach it. Let's see what they were hiding."
    );

    saveGame();
  }
};
