/* ============================================================
   CONTROL STATION MOVEMENT
   One-cell grid movement with smooth visual interpolation.
   Colliders match the visible room geometry plus Mara's footprint.
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

  /* Room perimeter. */
  for(let z=1;z<=17;z++)block(0,z);
  for(let z=0;z<=18;z++)block(45,z);
  for(let x=0;x<=45;x++)block(x,18);

  /*
     These are the exact grid cells whose Mara-sized footprint intersects
     the visible furniture. This prevents both walking into objects and
     the old bug where an object blocked a neighbouring cell.
  */
  block(3,6,12,4);   // left control bank
  block(16,9,9,4);   // middle workstation
  block(32,13,9,3);  // rear command console
  block(1,12,6,4);   // left storage
  block(42,6,3,4);   // right equipment

  /*
     Columns are only solid on the floor cell(s) they physically occupy.
     Their exact world footprints are 48x55.
  */
  block(2,3);        // x 10770..10818
  block(12,3,2,1);   // x 11310..11358
  block(23,3,2,1);   // x 11850..11898
  block(34,3,2,1);   // x 12390..12438
  /* The final column is against the right wall and has no legal cell. */

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
      if(!window.controlStationRoomActive){normalMove();return;}

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

      /* Destination cell only. You can always walk around an object. */
      if(pressed("up",up)&&legal(gx,gz+1))gz++;
      if(pressed("down",down)&&legal(gx,gz-1))gz--;
      if(pressed("left",left)&&legal(gx-1,gz))gx--;
      if(pressed("right",right)&&legal(gx+1,gz))gx++;

      player.roomGridX=gx;
      player.roomGridZ=gz;
      player.roomTargetX=worldX(gx);
      player.roomTargetZ=worldZ(gz);

      /* Smooth travel instead of instant 50px snapping. */
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
     TRUE-LOOKING DEPTH FOR COLUMNS
     The WebGL room is behind the normal game canvas. When Mara walks
     behind a column, paint that column's front face over her so the
     movement and the visible depth agree.
     ============================================================ */
  function drawPoleOccluders(){
    if(!window.controlStationRoomActive)return;

    const poleCells=[2,12,23,34];
    for(const gx of poleCells){
      if(player.roomGridX!==gx||player.roomGridZ<=3)continue;

      const x=worldX(gx)-camX;
      const top=205-camY;
      const bottom=580-180*.268-camY;
      const h=Math.max(0,bottom-top);

      ctx.save();
      ctx.fillStyle="#526d67";
      ctx.fillRect(x,top,48,h);
      ctx.fillStyle="#78918a";
      ctx.fillRect(x+5,top,7,h);
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