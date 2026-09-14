/* ============================================================
   CONTROL STATION MOVEMENT
   The movement map mirrors the visible 3D room exactly.
   W/UP = one cell farther into the room.
   S/DOWN = one cell back toward the entrance.
   A/D/LEFT/RIGHT = one cell sideways.
   ============================================================ */
(function(){
  const GRID=50;
  const X0=10700;
  const Z0=50;
  const COLS=46;
  const ROWS=18;

  function key(x,z){return x+","+z;}
  const blocked=new Set();
  function block(x,z,w=1,d=1){
    for(let gx=x;gx<x+w;gx++)for(let gz=z;gz<z+d;gz++)blocked.add(key(gx,gz));
  }

  /* EXACT visible room footprints. */
  for(let z=0;z<ROWS;z++){
    if(z!==0)block(0,z);
    block(COLS-1,z);
  }
  for(let x=0;x<COLS;x++)block(x,ROWS-1);

  block(5,5,9,3);       // main console
  block(19,5,7,3);      // middle console
  block(32,5,7,3);      // command console
  block(5,12,5,3);      // storage
  block(39,7,4,3);       // equipment

  for(const [x,z] of [[3,3],[12,3],[21,3],[30,3],[39,3]])block(x,z);

  function legal(x,z){
    return x>=1&&x<=44&&z>=0&&z<=17&&!blocked.has(key(x,z));
  }
  function worldX(gx){return X0+gx*GRID;}
  function worldZ(gz){return Z0+gz*GRID;}

  function install(){
    if(typeof move!=="function")return false;
    if(!move._controlStationSolidCollision)return false;
    if(move._smoothControlStationMovement)return true;

    const normalMove=move;
    move=function(){
      if(!window.controlStationRoomActive){normalMove();return;}

      if(!Number.isFinite(player.roomGridX))player.roomGridX=8;
      if(!Number.isFinite(player.roomGridZ))player.roomGridZ=1;
      if(!Number.isFinite(player.roomTargetX))player.roomTargetX=worldX(player.roomGridX);
      if(!Number.isFinite(player.roomTargetZ))player.roomTargetZ=worldZ(player.roomGridZ);
      if(!Number.isFinite(player.roomVisualX))player.roomVisualX=player.roomTargetX;
      if(!Number.isFinite(player.roomVisualZ))player.roomVisualZ=player.roomTargetZ;
      if(!move._roomKeys)move._roomKeys={up:false,down:false,left:false,right:false};

      const up=!!(keys.w||keys.arrowup);
      const down=!!(keys.s||keys.arrowdown);
      const left=!!(keys.a||keys.arrowleft);
      const right=!!(keys.d||keys.arrowright);
      function pressed(name,value){
        const was=move._roomKeys[name];
        move._roomKeys[name]=value;
        return value&&!was;
      }

      let gx=player.roomGridX;
      let gz=player.roomGridZ;

      /* Destination cell only: neighbouring objects never block movement. */
      if(pressed("up",up)&&legal(gx,gz+1))gz++;
      if(pressed("down",down)&&legal(gx,gz-1))gz--;
      if(pressed("left",left)&&legal(gx-1,gz))gx--;
      if(pressed("right",right)&&legal(gx+1,gz))gx++;

      player.roomGridX=gx;
      player.roomGridZ=gz;
      player.roomTargetX=worldX(gx);
      player.roomTargetZ=worldZ(gz);

      player.roomVisualX+=(player.roomTargetX-player.roomVisualX)*0.20;
      player.roomVisualZ+=(player.roomTargetZ-player.roomVisualZ)*0.20;
      if(Math.abs(player.roomTargetX-player.roomVisualX)<0.15)player.roomVisualX=player.roomTargetX;
      if(Math.abs(player.roomTargetZ-player.roomVisualZ)<0.15)player.roomVisualZ=player.roomTargetZ;

      player.x=player.roomVisualX;
      player.roomZ=player.roomVisualZ;

      /* Space is an independent jump, not a grid movement. */
      const jump=!!keys[" "];
      if(jump&&!move._roomJumpPressed&&(!player.roomJumpY||player.roomJumpY===0)){
        player.roomJumpY=0;
        player.roomJumpV=11;
      }
      move._roomJumpPressed=jump;
      if(player.roomJumpV!==0||player.roomJumpY!==0){
        player.roomJumpY+=player.roomJumpV;
        player.roomJumpV-=1.1;
        if(player.roomJumpY<=0){player.roomJumpY=0;player.roomJumpV=0;}
      }

      player.y=580-player.roomZ*.268-player.h-player.roomJumpY;
      player.vx=0;
      player.vy=0;
      player.grounded=player.roomJumpY===0;
      if(right)player.facing=1;
      if(left)player.facing=-1;

      if(keys.e&&!ePressed)action();
      if(!keys.e&&player.grapple)releaseGrapple(true);
      ePressed=keys.e;
      player.anim+=.08;

      camX=Math.max(0,Math.min(Math.max(0,13180-innerWidth),player.x-innerWidth*.45));
      camY=0;
    };
    move._smoothControlStationMovement=true;
    return true;
  }

  /* ============================================================
     LIGHT POWER-UP
     The room begins in its original dark emergency state. A moment
     later the station attempts to bring the lights back online and
     they flicker before settling brighter, making the room readable.
     ============================================================ */
  let lightStartedAt=0;
  let lightWasActive=false;

  function updateRoomLighting(){
    const canvas=document.getElementById("webgl-hybrid");
    if(!canvas)return;

    const active=!!window.controlStationRoomActive;
    if(!active){
      lightStartedAt=0;
      lightWasActive=false;
      canvas.style.filter="";
      return;
    }

    if(!lightWasActive){
      lightStartedAt=performance.now();
      lightWasActive=true;
    }

    const elapsed=performance.now()-lightStartedAt;
    if(elapsed<900){
      /* Exact entrance darkness for the first beat. */
      canvas.style.filter="brightness(1)";
      return;
    }

    const t=(elapsed-900)/1000;
    const ramp=Math.min(1,t);
    const flicker=
      Math.sin(elapsed*.035)*.10+
      Math.sin(elapsed*.083)*.055+
      (Math.sin(elapsed*.19)>.93?.16:0);
    const brightness=1.05+ramp*.38+flicker;
    canvas.style.filter=`brightness(${Math.max(.92,brightness)}) contrast(1.05)`;
  }

  /* ============================================================
     TRUE DEPTH FOR POLES
     WebGL is underneath the normal 2D canvas, so the front face of a
     pole must be painted over Mara when she is physically behind it.
     This projection exactly matches the WebGL shader.
     ============================================================ */
  function project(x,y,z){
    const depth=Math.max(0,z);
    const scale=1/(1+depth*.00016);
    return {
      x:(x-camX)*scale,
      y:(y-camY-depth*.065)*scale,
      scale
    };
  }

  function drawPoleOccluders(){
    if(!window.controlStationRoomActive)return;
    const poles=[[3,3],[12,3],[21,3],[30,3],[39,3]];

    for(const [gx,gz] of poles){
      if(!Number.isFinite(player.roomVisualZ)||player.roomVisualZ<=Z0+gz*GRID+10)continue;

      const top=project(X0+gx*GRID+9,210,Z0+gz*GRID+9);
      const bottom=project(X0+gx*GRID+9,580,Z0+gz*GRID+9);
      const width=32*top.scale;
      const left=top.x;
      const y=top.y;
      const h=Math.max(0,bottom.y-top.y);

      ctx.save();
      ctx.fillStyle="#526d67";
      ctx.fillRect(left,y,width,h);
      ctx.fillStyle="#78918a";
      ctx.fillRect(left+4*top.scale,y,7*top.scale,h);
      ctx.restore();
    }
  }

  function installDraw(){
    if(typeof draw!=="function")return false;
    if(draw._controlStationDepthPass)return true;
    const originalDraw=draw;
    draw=function(){
      originalDraw();
      updateRoomLighting();
      drawPoleOccluders();
    };
    draw._controlStationDepthPass=true;
    return true;
  }

  const timer=setInterval(()=>{
    const movementInstalled=install();
    const drawInstalled=installDraw();
    if(movementInstalled&&drawInstalled)clearInterval(timer);
  },25);
})();
