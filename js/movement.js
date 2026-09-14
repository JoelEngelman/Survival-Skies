/* ============================================================
   MOVEMENT
   ============================================================ */

function move(){

  /* ============================================================
     CONTROL STATION GRID MOVEMENT
     The Control Station uses a simple invisible floor grid.
     One arrow/WASD press moves exactly one square.
     SPACE is the only jump key in the room.
     ============================================================ */
  if(window.controlStationRoomActive){

    const GRID=50;
    const MIN_X=10700;
    const MAX_X=13000;
    const MIN_Z=50;
    const MAX_Z=950;

    if(!Number.isFinite(player.roomGridX))
      player.roomGridX=Math.round((player.x-MIN_X)/GRID);
    if(!Number.isFinite(player.roomGridZ))
      player.roomGridZ=Math.round((player.roomZ-MIN_Z)/GRID);

    if(!Number.isFinite(player.roomJumpY))
      player.roomJumpY=0;

    if(!Number.isFinite(player.roomJumpV))
      player.roomJumpV=0;

    /* One movement command per key press, rather than continuous
       acceleration. This makes the room predictable and tile-based. */
    if(!move.roomKeysReady)
      move.roomKeysReady={up:false,down:false,left:false,right:false};

    const up=!!(keys.w||keys.arrowup);
    const down=!!(keys.s||keys.arrowdown);
    const left=!!(keys.a||keys.arrowleft);
    const right=!!(keys.d||keys.arrowright);

    function pressed(name,value){
      const was=move.roomKeysReady[name];
      move.roomKeysReady[name]=value;
      return value&&!was;
    }

    let gx=player.roomGridX;
    let gz=player.roomGridZ;

    if(pressed("up",up))gz++;
    if(pressed("down",down))gz--;
    if(pressed("left",left))gx--;
    if(pressed("right",right))gx++;

    gx=Math.max(2,Math.min(46,gx));
    gz=Math.max(1,Math.min(18,gz));

    player.roomGridX=gx;
    player.roomGridZ=gz;

    /* Convert the invisible grid into world coordinates. */
    player.x=MIN_X+gx*GRID;
    player.roomZ=MIN_Z+gz*GRID;

    /* SPACE = jump. Jumping is vertical and does not alter the grid cell. */
    const jump=!!keys[" "];
    if(jump&&!move.roomJumpPressed&&player.roomJumpY===0){
      player.roomJumpV=11;
    }
    move.roomJumpPressed=jump;

    if(player.roomJumpV!==0||player.roomJumpY!==0){
      player.roomJumpY+=player.roomJumpV;
      player.roomJumpV-=1.1;
      if(player.roomJumpY<=0){
        player.roomJumpY=0;
        player.roomJumpV=0;
      }
    }

    player.y=580-player.roomZ*.268-player.h-player.roomJumpY;
    player.vx=0;
    player.vy=0;
    player.grounded=player.roomJumpY===0;

    if(right)player.facing=1;
    if(left)player.facing=-1;

    player.stamina+=.8;
    player.stamina=Math.max(0,Math.min(100,player.stamina));

    camX=Math.max(
      0,
      Math.min(
        Math.max(0,13180-innerWidth),
        player.x-innerWidth*.45
      )
    );
    camY=0;

    if(keys.e&&!ePressed)action();

    if(!keys.e&&player.grapple)releaseGrapple(true);

    ePressed=keys.e;
    player.anim+=.08;
    return;
  }

  const left=
    keys.a ||
    keys.arrowleft;

  const right=
    keys.d ||
    keys.arrowright;

  const sprint=
    keys.shift &&
    player.stamina>0;

  const max=
    sprint
      ? player.sprint
      : player.speed;

  if(left){
    player.vx-=.55;
    player.facing=-1;
  }

  if(right){
    player.vx+=.55;
    player.facing=1;
  }

  if(!left&&!right)
    player.vx*=.82;

  player.vx=Math.max(
    -max,
    Math.min(max,player.vx)
  );

  if(sprint&&(left||right)){
    player.stamina-=.7;
  }else{
    player.stamina+=.45;
  }

  player.stamina=Math.max(0,Math.min(100,player.stamina));

  const jump=
    keys[" "] ||
    keys.w ||
    keys.arrowup;

  if(jump&&!jumpPressed){
    if(player.grounded||player.jumps<player.maxJumps){
      player.vy=-12;
      player.grounded=false;
      player.jumps++;
      spawn(player.x,player.y+45,10,"energy");
    }
  }

  jumpPressed=jump;

  if(keys.e&&!ePressed)action();

  if(!keys.e&&player.grapple)releaseGrapple(true);

  ePressed=keys.e;

  player.vy+=.55;
  player.vy=Math.min(15,player.vy);

  const oldBottom=player.y+player.h;

  player.x+=player.vx;
  player.y+=player.vy;

  player.grounded=false;

  const activePlatforms=tunnelMode?tunnelPlatforms:platforms;

  for(const p of activePlatforms){
    if(
      player.x+player.w>p.x&&
      player.x<p.x+p.w&&
      oldBottom<=p.y&&
      player.y+player.h>=p.y&&
      player.vy>=0
    ){
      player.y=p.y-player.h;
      player.vy=0;
      player.grounded=true;
      player.jumps=0;
    }
  }

  applyGrapple();

  if(player.y>850)respawn();

  player.anim+=Math.abs(player.vx)>.2?.18:.05;
}

/* ============================================================
   CHECKPOINT
   ============================================================ */

function setCheckpoint(x,y){
  player.spawnX=x;
  player.spawnY=y;
  saveGame();
}

/* ============================================================
   RESPAWN
   ============================================================ */

function respawn(){
  player.x=player.spawnX;
  player.y=player.spawnY;
  player.vx=0;
  player.vy=0;
  player.grapple=null;

  if(window.controlStationRoomActive){
    player.roomGridX=8;
    player.roomGridZ=1;
    player.roomZ=100;
    player.roomJumpY=0;
    player.roomJumpV=0;
    player.y=580-player.roomZ*.268-player.h;
  }
}

/* ============================================================
   PROGRESSION
   ============================================================ */

function progress(){
  if(interactionLock>0)interactionLock--;

  if(tunnelMode){
    tunnelProgress();
    return;
  }

  if(stage===2&&player.x>1500){
    stage=3;
    objects.find(o=>o.type==="radio").active=true;
    objective();
    say("MARA","There. An old radio room. Maybe they left the next piece behind.");
  }

  if(stage===4&&player.x>2600){
    if(!progress.warned){
      progress.warned=true;
      say("MARA","The storm is getting stronger. The transmitter tower is ahead.");
    }
  }

  if(stage===5&&components>=3){
    objects.find(o=>o.type==="tower").active=true;
  }

  if(stage===6&&player.x>4050){
    objects.find(o=>o.type==="settlement").active=true;
  }

  if(stage===6&&player.x>4300){
    stage=7;
    objects.find(o=>o.type==="settlement").active=true;
    setCheckpoint(4300,470-player.h);
    objective();
    say("LEADER","Mara! Over here!");
  }

  if(stage===8&&player.x>5500){
    objects.find(o=>o.type==="transit").active=true;
    objective();
  }

  if(stage===8&&player.x>6000){
    stage=9;
    setCheckpoint(6100,520-player.h);
    objective();
    say("LEADER","The transit entrance is ahead. Our people disappeared down there.");
  }

  if(stage===9&&player.x>6500){
    stage=10;
    setCheckpoint(6750,530-player.h);
    objects.find(o=>o.type==="cave").active=true;
    objective();
    say("MARA","If they're alive, I'm bringing them home.");
  }
}

/* ============================================================
   TUNNEL PROGRESSION
   ============================================================ */

function tunnelProgress(){
  if(stage===10&&player.x>800){
    if(!tunnelProgress.trapped){
      tunnelProgress.trapped=true;
      say("MARA","The entrance collapsed behind me...");
      setCheckpoint(100,570-player.h);
    }
  }

  if(stage===11&&player.x>4700&&!tunnelProgress.foundPeople){
    tunnelProgress.foundPeople=true;
    objects.find(o=>o.type==="survivors").active=true;
  }

  if(stage===12&&player.x>6100){
    stage=13;
    setCheckpoint(6250,510-player.h);
    objective();
    say("SCAVENGER","The maintenance lift is further east.");
  }

  if(stage===13&&player.x>8050){
    escapeTunnel();
  }
}

/* ============================================================
   SCRAP
   ============================================================ */

function collectScrap(){
  if(tunnelMode)return;

  for(const s of scraps){
    if(s.collected)continue;
    if(Math.abs(player.x-s.x)<48&&Math.abs(player.y+player.h-s.y)<65){
      s.collected=true;
      scrap++;
      spawn(s.x,s.y,8,"energy");
    }
  }
}
