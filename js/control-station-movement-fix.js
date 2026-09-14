/* ============================================================
   CONTROL STATION MOVEMENT
   One-cell grid movement with smooth visual interpolation.
   Colliders are derived from the actual room geometry footprints.
   ============================================================ */
(function(){
  const GRID=50;
  const MIN_X=10700;
  const MIN_Z=50;

  function key(gx,gz){return gx+","+gz;}
  const blocked=new Set();

  function block(gx,gz,w=1,d=1){
    for(let x=gx;x<gx+w;x++)for(let z=gz;z<gz+d;z++)blocked.add(key(x,z));
  }

  /* Room perimeter. The doorway is intentionally left open at z=18..42. */
  for(let z=1;z<=17;z++)block(0,z);
  for(let z=0;z<=18;z++)block(45,z);
  for(let x=0;x<=45;x++)block(x,18);

  /*
     Furniture footprints match the visible Control Station solids:
       left console      x 10830..11390, z 355..500
       middle console    x 11500..11920, z 515..650
       rear console      x 12270..12720, z 690..825
       left storage      x 10730..11010, z 650..790
       right equipment   x 12780..13030, z 360..500
  */
  block(3,6,12,3);   // left control bank
  block(16,10,9,3);  // middle workstation
  block(31,13,9,3);  // rear command console
  block(2,12,6,3);   // left storage
  block(41,6,5,3);   // right equipment

  /* Structural columns. Only their actual floor footprint is blocked. */
  for(let x=10770;x<=12930;x+=540){
    const gx=Math.round((x-MIN_X)/GRID);
    block(gx,3);
  }

  function legal(gx,gz){
    return gx>=1&&gx<=44&&gz>=0&&gz<=17&&!blocked.has(key(gx,gz));
  }

  function worldX(gx){return MIN_X+gx*GRID;}
  function worldZ(gz){return MIN_Z+gz*GRID;}

  function install(){
    if(typeof move!=="function")return false;
    if(!move._controlStationSolidCollision)return false;
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

      /* Exactly one grid cell per press; never test adjacent cells. */
      if(pressed("up",up)&&legal(gx,gz+1))gz++;
      if(pressed("down",down)&&legal(gx,gz-1))gz--;
      if(pressed("left",left)&&legal(gx-1,gz))gx--;
      if(pressed("right",right)&&legal(gx+1,gz))gx++;

      player.roomGridX=gx;
      player.roomGridZ=gz;
      player.roomTargetX=worldX(gx);
      player.roomTargetZ=worldZ(gz);

      /* Smooth movement, with no snapping until the target is reached. */
      player.roomVisualX+=(player.roomTargetX-player.roomVisualX)*0.22;
      player.roomVisualZ+=(player.roomTargetZ-player.roomVisualZ)*0.22;
      if(Math.abs(player.roomTargetX-player.roomVisualX)<0.2)player.roomVisualX=player.roomTargetX;
      if(Math.abs(player.roomTargetZ-player.roomVisualZ)<0.2)player.roomVisualZ=player.roomTargetZ;

      player.x=player.roomVisualX;
      player.roomZ=player.roomVisualZ;

      const jump=!!keys[" "];
      if(jump&&!move._roomJumpPressed&&player.roomJumpY===0)player.roomJumpV=11;
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

  /*
     The WebGL room is a separate layer, so the normal 2D player is always
     drawn over it. Add a small matching pole pass after the normal draw
     when Mara is farther back than a column. This makes going behind a
     column visually real instead of merely changing the collision cell.
  */
  function drawPoleOccluders(){
    if(!window.controlStationRoomActive)return;

    const poles=[];
    for(let x=10770;x<=12930;x+=540)poles.push({x,z:180});

    for(const p of poles){
      const gx=Math.round((p.x-MIN_X)/GRID);
      const poleX=worldX(gx);
      if(player.roomGridX!==gx || player.roomGridZ<=3)continue;

      const screenX=poleX-camX;
      const floorScreenY=580-player.roomZ*.268;
      const poleFloorY=580-p.z*.268;
      const poleTopY=205-p.z*.03;

      /* Only draw the front-facing portion over Mara when she is behind it. */
      ctx.save();
      ctx.fillStyle="#075b4d";
      ctx.globalAlpha=.92;
      ctx.fillRect(screenX-camX*0+0,poleTopY-camY,48,Math.max(0,poleFloorY-poleTopY));
      ctx.fillStyle="#6b8c83";
      ctx.globalAlpha=.9;
      ctx.fillRect(screenX+4,poleTopY-camY,7,Math.max(0,poleFloorY-poleTopY));
      ctx.restore();
    }
  }

  function installDraw(){
    if(typeof draw!=="function")return false;
    if(draw._controlStationDepthPass)return true;
    const originalDraw=draw;
    draw=function(){
      originalDraw();
      if(window.controlStationRoomActive)drawPoleOccluders();
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