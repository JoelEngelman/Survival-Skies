/* ============================================================
   CONTROL STATION PATCH V2
   Surgical fix layered on top of the existing room movement.
   Keeps the existing grid/collision/light work, but synchronises
   Mara to the room start position and makes her depth deterministic.
   ============================================================ */
(function(){
  const GRID=50,X0=10700,Z0=50,ZMAX=17;
  const blocked=new Set();
  const key=(x,z)=>x+","+z;
  const block=(x,z,w=1,d=1)=>{for(let gx=x;gx<x+w;gx++)for(let gz=z;gz<z+d;gz++)blocked.add(key(gx,gz));};
  for(let z=0;z<18;z++){if(z!==0)block(0,z);block(45,z);}
  for(let x=0;x<46;x++)block(x,17);
  block(3,6,11,4);block(16,10,9,3);block(31,13,9,3);block(1,12,7,3);block(41,6,4,3);
  for(const gx of [1,12,23,33,44])block(gx,3);
  const legal=(x,z)=>x>=1&&x<=44&&z>=0&&z<=ZMAX&&!blocked.has(key(x,z));
  const wx=g=>X0+g*GRID;
  const wz=g=>Z0+g*GRID;

  let installed=false;
  const timer=setInterval(()=>{
    if(typeof move!=="function"||!window.controlStationRoomActive)return;
    if(installed){clearInterval(timer);return;}
    const baseMove=move;
    const state={up:false,down:false,left:false,right:false};

    /* Set the grid from Mara's actual entry position, not hard-coded (8,1). */
    if(!Number.isFinite(player.roomGridX))player.roomGridX=Math.max(1,Math.min(44,Math.round((player.x-X0)/GRID)));
    if(!Number.isFinite(player.roomGridZ))player.roomGridZ=Math.max(0,Math.min(ZMAX,Math.round((player.roomZ-Z0)/GRID)));
    player.roomTargetX=wx(player.roomGridX);
    player.roomTargetZ=wz(player.roomGridZ);
    player.roomVisualX=player.x;
    player.roomVisualZ=player.roomZ;

    move=function(){
      if(!window.controlStationRoomActive){baseMove();return;}
      const up=!!(keys.w||keys.arrowup),down=!!(keys.s||keys.arrowdown),left=!!(keys.a||keys.arrowleft),right=!!(keys.d||keys.arrowright);
      const pressed=(n,v)=>{const was=state[n];state[n]=v;return v&&!was;};
      let gx=player.roomGridX,gz=player.roomGridZ;
      if(pressed("up",up)&&legal(gx,gz+1))gz++;
      if(pressed("down",down)&&legal(gx,gz-1))gz--;
      if(pressed("left",left)&&legal(gx-1,gz))gx--;
      if(pressed("right",right)&&legal(gx+1,gz))gx++;
      player.roomGridX=gx;player.roomGridZ=gz;
      player.roomTargetX=wx(gx);player.roomTargetZ=wz(gz);
      player.roomVisualX+=(player.roomTargetX-player.roomVisualX)*.20;
      player.roomVisualZ+=(player.roomTargetZ-player.roomVisualZ)*.20;
      if(Math.abs(player.roomTargetX-player.roomVisualX)<.15)player.roomVisualX=player.roomTargetX;
      if(Math.abs(player.roomTargetZ-player.roomVisualZ)<.15)player.roomVisualZ=player.roomTargetZ;
      player.x=player.roomVisualX;player.roomZ=player.roomVisualZ;

      const jump=!!keys[" "];
      if(jump&&!move._jumpHeld&&(!player.roomJumpY||player.roomJumpY===0)){player.roomJumpY=0;player.roomJumpV=11;}
      move._jumpHeld=jump;
      if(player.roomJumpV||player.roomJumpY){player.roomJumpY+=player.roomJumpV;player.roomJumpV-=1.1;if(player.roomJumpY<=0){player.roomJumpY=0;player.roomJumpV=0;}}
      player.y=580-player.roomZ*.268-player.h-player.roomJumpY;
      player.vx=0;player.vy=0;player.grounded=player.roomJumpY===0;
      if(right)player.facing=1;if(left)player.facing=-1;
      if(keys.e&&!ePressed)action();
      if(!keys.e&&player.grapple)releaseGrapple(true);
      ePressed=keys.e;player.anim+=.08;
      camX=Math.max(0,Math.min(Math.max(0,13180-innerWidth),player.x-innerWidth*.45));camY=0;
    };
    move._controlStationMovementV2=true;

    /* The old depth pass can paint a furniture silhouette over Mara even
       when its projection is not aligned with the 2D player canvas.
       Redraw Mara after it so she is never permanently trapped behind an
       object. The 3D room remains unchanged underneath. */
    if(typeof draw==="function"&&!draw._controlStationDepthV2){
      const baseDraw=draw;
      draw=function(){
        baseDraw();
        if(window.controlStationRoomActive&&typeof drawPlayer==="function")drawPlayer();
      };
      draw._controlStationDepthV2=true;
    }
    installed=true;
    clearInterval(timer);
  },25);
})();