/* ============================================================
   CONTROL STATION MOVEMENT
   One-cell grid movement with smooth visual interpolation.
   Colliders are aligned to the actual room geometry footprints.
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

  /* Room perimeter. Keep the entrance opening usable. */
  for(let z=1;z<=17;z++)block(0,z);
  for(let z=0;z<=18;z++)block(45,z);
  for(let x=0;x<=45;x++)block(x,18);

  /* Exact furniture footprints, expanded only by Mara's footprint. */
  block(3,6,11,3);   // left control bank: 10830..11390 / 355..500
  block(16,10,8,3);  // middle workstation: 11500..11920 / 515..650
  block(31,13,9,3);  // rear console: 12270..12720 / 690..825
  block(1,12,6,3);   // left storage: 10730..11010 / 650..790
  block(42,6,3,3);   // right equipment: 12780..13030 / 360..500

  /* Structural columns: one 48x55 footprint each. */
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

      /* Destination-cell collision only: adjacent cells never block movement. */
      if(pressed("up",up)&&legal(gx,gz+1))gz++;
      if(pressed("down",down)&&legal(gx,gz-1))gz--;
      if(pressed("left",left)&&legal(gx-1,gz))gx--;
      if(pressed("right",right)&&legal(gx+1,gz))gx++;

      player.roomGridX=gx;
      player.roomGridZ=gz;
      player.roomTargetX=worldX(gx);
      player.roomTargetZ=worldZ(gz);

      /* Smooth visual travel between grid cells. */
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

  /* ============================================================
     DEPTH PASS
     The WebGL room sits behind the normal game canvas, so the player
     would otherwise always appear in front of columns. When Mara is
     farther back than a column, paint that column's front face over her.
     ============================================================ */
  function drawPoleOccluders(){
    if(!window.controlStationRoomActive)return;

    for(let x=10770;x<=12930;x+=540){
      const gx=Math.round((x-MIN_X)/GRID);
      if(player.roomGridX!==gx||player.roomGridZ<=3)continue;

      const screenX=worldX(gx)-camX;
      const topY=205-camY;
      const bottomY=580-180*.268-camY;

      ctx.save();
      ctx.fillStyle="#526d67";
      ctx.fillRect(screenX,topY,48,Math.max(0,bottomY-topY));
      ctx.fillStyle="#78918a";
      ctx.fillRect(screenX+5,topY,7,Math.max(0,bottomY-topY));
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