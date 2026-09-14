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

  /* These match the actual renderer geometry. */
  for(let z=0;z<ROWS;z++){
    if(z!==0)block(0,z);
    block(COLS-1,z);
  }
  for(let x=0;x<COLS;x++)block(x,ROWS-1);

  block(5,5,9,3);       // main console
  block(19,5,7,3);      // middle console
  block(32,5,7,3);      // command console
  block(5,12,5,3);      // storage
  block(39,7,4,3);      // equipment

  /* One grid cell per structural pole. */
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

      /* Only the destination cell is tested. Adjacent objects never block a turn. */
      if(pressed("up",up)&&legal(gx,gz+1))gz++;
      if(pressed("down",down)&&legal(gx,gz-1))gz--;
      if(pressed("left",left)&&legal(gx-1,gz))gx--;
      if(pressed("right",right)&&legal(gx+1,gz))gx++;

      player.roomGridX=gx;
      player.roomGridZ=gz;
      player.roomTargetX=worldX(gx);
      player.roomTargetZ=worldZ(gz);

      /* Smoothly move toward the selected cell. */
      player.roomVisualX+=(player.roomTargetX-player.roomVisualX)*0.20;
      player.roomVisualZ+=(player.roomTargetZ-player.roomVisualZ)*0.20;
      if(Math.abs(player.roomTargetX-player.roomVisualX)<0.15)player.roomVisualX=player.roomTargetX;
      if(Math.abs(player.roomTargetZ-player.roomVisualZ)<0.15)player.roomVisualZ=player.roomTargetZ;

      player.x=player.roomVisualX;
      player.roomZ=player.roomVisualZ;

      /* Jump is completely independent of the floor grid. */
      if(!move._roomJumpPressed)move._roomJumpPressed=false;
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

  /*
     The 3D room is rendered on a separate WebGL canvas underneath the
     normal game canvas. Paint the front face of a pole in the 2D canvas
     when Mara is behind it. This uses the SAME projection as the WebGL
     shader, so the occluder stays attached to the actual pole.
  */
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
      /* Once Mara has moved farther back than the pole, it occludes her. */
      if(!Number.isFinite(player.roomVisualZ)||player.roomVisualZ<=Z0+gz*GRID+12)continue;

      const p=project(X0+gx*GRID,Z0+gz*GRID,0);
      const top=project(X0+gx*GRID+9,210,Z0+gz*GRID+9);
      const bottom=project(X0+gx*GRID+9,580,Z0+gz*GRID+9);
      const width=32*top.scale;
      const left=p.x+9*bottom.scale;
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
