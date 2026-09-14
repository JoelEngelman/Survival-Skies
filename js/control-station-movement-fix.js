/* ============================================================
   CONTROL STATION MOVEMENT FIX
   Keeps the room grid logical, but animates the visible player.
   Collision is checked against the destination cell only.
   ============================================================ */
(function(){
  const GRID=50;
  const MIN_X=10700;
  const MIN_Z=50;

  function key(gx,gz){return gx+","+gz;}

  /* The room's physical footprints. These are grid cells, not
     large invisible rectangles around the objects. */
  const blocked=new Set();
  function block(gx,gz,w=1,d=1){
    for(let x=gx;x<gx+w;x++)for(let z=gz;z<gz+d;z++)blocked.add(key(x,z));
  }

  /* Walls */
  for(let z=0;z<18;z++){
    if(z!==0)block(0,z);
    block(45,z);
  }
  for(let x=0;x<46;x++)block(x,18);

  /* Control-room furniture */
  block(5,5,9,3);
  block(19,5,7,3);
  block(32,5,7,3);
  block(5,12,5,3);
  block(39,7,4,3);

  /* Structural poles: exactly ONE blocked cell each. */
  for(const p of [[3,3],[12,3],[21,3],[30,3],[39,3]])
    block(p[0],p[1]);

  function legal(gx,gz){
    return gx>=2&&gx<=44&&gz>=1&&gz<=17&&!blocked.has(key(gx,gz));
  }

  function worldX(gx){return MIN_X+gx*GRID;}
  function worldZ(gz){return MIN_Z+gz*GRID;}

  function install(){
    if(typeof move!=="function")return false;
    if(move._smoothControlStationMovement)return true;

    const normalMove=move;

    move=function(){
      if(!window.controlStationRoomActive){
        normalMove();
        return;
      }

      if(!Number.isFinite(player.roomGridX))player.roomGridX=8;
      if(!Number.isFinite(player.roomGridZ))player.roomGridZ=1;
      if(!Number.isFinite(player.roomJumpY))player.roomJumpY=0;
      if(!Number.isFinite(player.roomJumpV))player.roomJumpV=0;
      if(!Number.isFinite(player.roomTargetX))player.roomTargetX=worldX(player.roomGridX);
      if(!Number.isFinite(player.roomTargetZ))player.roomTargetZ=worldZ(player.roomGridZ);
      if(!Number.isFinite(player.roomVisualX))player.roomVisualX=player.roomTargetX;
      if(!Number.isFinite(player.roomVisualZ))player.roomVisualZ=player.roomTargetZ;

      if(!move._roomKeys)
        move._roomKeys={up:false,down:false,left:false,right:false};

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

      if(pressed("up",up)&&legal(gx,gz+1))gz++;
      if(pressed("down",down)&&legal(gx,gz-1))gz--;
      if(pressed("left",left)&&legal(gx-1,gz))gx--;
      if(pressed("right",right)&&legal(gx+1,gz))gx++;

      player.roomGridX=gx;
      player.roomGridZ=gz;
      player.roomTargetX=worldX(gx);
      player.roomTargetZ=worldZ(gz);

      /* Smoothly animate the visual position toward the chosen cell. */
      player.roomVisualX+=(player.roomTargetX-player.roomVisualX)*0.22;
      player.roomVisualZ+=(player.roomTargetZ-player.roomVisualZ)*0.22;
      if(Math.abs(player.roomTargetX-player.roomVisualX)<0.2)player.roomVisualX=player.roomTargetX;
      if(Math.abs(player.roomTargetZ-player.roomVisualZ)<0.2)player.roomVisualZ=player.roomTargetZ;

      player.x=player.roomVisualX;
      player.roomZ=player.roomVisualZ;

      /* SPACE is the only jump input inside the room. */
      const jump=!!keys[" "];
      if(jump&&!move._roomJumpPressed&&player.roomJumpY===0)
        player.roomJumpV=11;
      move._roomJumpPressed=jump;

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

  const timer=setInterval(()=>{
    if(install())clearInterval(timer);
  },25);
})();
