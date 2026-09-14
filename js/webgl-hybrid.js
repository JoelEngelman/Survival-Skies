/* ============================================================
   CONTROL STATION 3D RENDERER
   The room is organized on a 50px invisible floor grid.
   X = left/right, Z = up/down the room, Y = vertical height.
   ============================================================ */
(function(){
  const canvas=document.getElementById("webgl-hybrid");
  if(!canvas)return;
  const gl=canvas.getContext("webgl",{alpha:true,antialias:true});
  if(!gl)return;
  const vsSource=`attribute vec3 a_position;uniform vec2 u_resolution;uniform vec2 u_camera;uniform float u_tilt;uniform float u_perspective;varying vec3 v_world;void main(){v_world=a_position;float depth=max(0.0,a_position.z);float scale=1.0/(1.0+depth*u_perspective);float sx=(a_position.x-u_camera.x)*scale;float sy=(a_position.y-u_camera.y-depth*u_tilt)*scale;gl_Position=vec4(sx/u_resolution.x*2.0-1.0,1.0-sy/u_resolution.y*2.0,0.0,1.0);}`;
  const fsSource=`precision mediump float;uniform vec4 u_color;uniform float u_time;varying vec3 v_world;void main(){float light=1.0-clamp(v_world.z/1000.0,0.0,1.0)*.18;float pulse=.012*sin(u_time*1.3+v_world.x*.003);gl_FragColor=vec4(u_color.rgb*(light+pulse),u_color.a);}`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;}
  const vs=shader(gl.VERTEX_SHADER,vsSource),fs=shader(gl.FRAGMENT_SHADER,fsSource);if(!vs||!fs)return;
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
  const buffer=gl.createBuffer(),position=gl.getAttribLocation(program,"a_position"),resolution=gl.getUniformLocation(program,"u_resolution"),camera=gl.getUniformLocation(program,"u_camera"),tilt=gl.getUniformLocation(program,"u_tilt"),perspective=gl.getUniformLocation(program,"u_perspective"),color=gl.getUniformLocation(program,"u_color"),timeUniform=gl.getUniformLocation(program,"u_time");
  gl.enableVertexAttribArray(position);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  const GRID=50,X0=10700,Z0=50,COLS=46,ROWS=18,floorY=580;let roomMode=false;
  function resize(){const dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.floor(innerWidth*dpr);canvas.height=Math.floor(innerHeight*dpr);canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";gl.viewport(0,0,canvas.width,canvas.height);}addEventListener("resize",resize);resize();
  function setRoomMode(enabled){roomMode=!!enabled;window.controlStationRoomActive=roomMode;canvas.classList.toggle("room-mode",roomMode);canvas.style.zIndex="0";const game=document.getElementById("game");if(game){game.style.visibility="visible";game.style.zIndex="1";}}
  window.hybridSetRoomMode=setRoomMode;
  function verts(data,c,a=1){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STREAM_DRAW);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);gl.uniform4f(color,c[0],c[1],c[2],a);gl.drawArrays(gl.TRIANGLES,0,data.length/3);}
  function quad(x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4,c,a=1){verts([x1,y1,z1,x2,y2,z2,x3,y3,z3,x1,y1,z1,x3,y3,z3,x4,y4,z4],c,a);}
  function box(x,y,z,w,h,d,c,a=1){const x2=x+w,y2=y+h,z2=z+d;quad(x,y,z,x2,y,z,x2,y2,z,x,y2,z,c,a);quad(x,y,z2,x,y2,z2,x2,y2,z2,x2,y,z2,c,a);quad(x,y2,z,x2,y2,z,x2,y2,z2,x,y2,z2,c,a);quad(x,y,z2,x2,y,z2,x2,y,z,x,y,z,c,a);quad(x,y,z,x,y2,z,x,y2,z2,x,y,z2,c,a);quad(x2,y,z2,x2,y2,z2,x2,y2,z,x2,y,z,c,a);}
  function floorRect(gx,gz,w,d,c,a=1){quad(X0+gx*GRID,floorY,Z0+gz*GRID,X0+(gx+w)*GRID,floorY,Z0+gz*GRID,X0+(gx+w)*GRID,floorY,Z0+(gz+d)*GRID,X0+gx*GRID,floorY,Z0+(gz+d)*GRID,c,a);}
  const blocked=new Set();
  function block(gx,gz,w=1,d=1){for(let x=gx;x<gx+w;x++)for(let z=gz;z<gz+d;z++)blocked.add(x+","+z);}
  for(let z=0;z<ROWS;z++){if(z!==0)block(0,z);block(COLS-1,z);}for(let x=0;x<COLS;x++)block(x,ROWS-1);
  block(5,5,9,3);block(19,5,7,3);block(32,5,7,3);block(5,12,5,3);block(39,7,4,3);
  for(const p of [[3,3],[12,3],[21,3],[30,3],[39,3]])block(p[0],p[1]);
  window.controlStationCanMove=function(gx,gz){return !blocked.has(gx+","+gz);};
  function roomCollides(x,z){const gx=Math.round((x-X0)/GRID),gz=Math.round((z-Z0)/GRID);return blocked.has(gx+","+gz);}
  function resolveRoomCollisions(){if(!roomCollides(player.x,player.roomZ))return;if(Number.isFinite(player.roomPrevX))player.x=player.roomPrevX;if(Number.isFinite(player.roomPrevZ))player.roomZ=player.roomPrevZ;player.roomGridX=Math.round((player.x-X0)/GRID);player.roomGridZ=Math.round((player.roomZ-Z0)/GRID);}
  function screen(gx,gz,w,h){const x=X0+gx*GRID,z=Z0+gz*GRID;box(x,420,z,w*GRID,h,10,[.025,.045,.045],1);box(x+8,428,z-4,w*GRID-16,h-16,4,[.48,.76,.61],.82);}
  function drawRoom(){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(resolution,innerWidth,innerHeight);gl.uniform2f(camera,camX,camY);gl.uniform1f(tilt,.065);gl.uniform1f(perspective,.00016);gl.uniform1f(timeUniform,performance.now()*.001);const floor=[.045,.065,.065],wall=[.075,.10,.10],edge=[.16,.21,.20],console=[.11,.15,.15],top=[.16,.21,.20],dark=[.025,.04,.04];
    floorRect(0,0,COLS,ROWS,floor,1);
    for(let x=0;x<=COLS;x++)floorRect(x,0,1,ROWS,[.12,.17,.16],.07);
    for(let z=0;z<=ROWS;z++)floorRect(0,z,COLS,1,[.12,.17,.16],.07);
    box(X0,floorY-330,Z0,45,330,ROWS*GRID,wall,1);box(X0+(COLS-1)*GRID,floorY-330,Z0,50,330,ROWS*GRID,wall,1);box(X0,floorY-330,Z0+(ROWS-1)*GRID,COLS*GRID,330,50,wall,1);
    box(X0+45,floorY-12,Z0,GRID*(COLS-2),12,18,edge,1);box(X0+45,floorY-12,Z0+(ROWS-1)*GRID-18,GRID*(COLS-2),12,18,edge,1);
    for(let gx=4;gx<COLS-1;gx+=8)box(X0+gx*GRID,210,Z0+GRID,24,28,(ROWS-2)*GRID,edge,1);
    box(X0,220,Z0,45,105,GRID,edge,1);box(X0,220,Z0+GRID,45,105,GRID,edge,1);box(X0,325,Z0,45,25,GRID*2,top,1);
    box(X0+5*GRID,425,Z0+5*GRID,9*GRID,65,3*GRID,console,1);box(X0+5*GRID+10,490,Z0+5*GRID+10,9*GRID-20,22,3*GRID-20,top,1);screen(6,5,2,55);screen(9,5,2,55);screen(12,5,2,55);
    box(X0+19*GRID,425,Z0+5*GRID,7*GRID,65,3*GRID,console,1);box(X0+19*GRID+10,490,Z0+5*GRID+10,7*GRID-20,22,3*GRID-20,top,1);screen(20,5,2,55);screen(23,5,2,55);
    box(X0+32*GRID,425,Z0+5*GRID,7*GRID,65,3*GRID,console,1);box(X0+32*GRID+10,490,Z0+5*GRID+10,7*GRID-20,22,3*GRID-20,top,1);screen(33,5,2,55);screen(36,5,2,55);
    box(X0+5*GRID,435,Z0+12*GRID,5*GRID,125,3*GRID,[.075,.105,.105],1);box(X0+39*GRID,435,Z0+7*GRID,4*GRID,90,3*GRID,[.075,.105,.105],1);
    for(const p of [[3,3],[12,3],[21,3],[30,3],[39,3]]){const x=X0+p[0]*GRID,z=Z0+p[1]*GRID;box(x+9,210,z+9,32,370,32,[.12,.16,.16],1);box(x+2,560,z+2,46,12,46,edge,1);box(x+12,275,z+4,26,170,5,[.42,.66,.54],.55);}
    for(const z of [1,4,8,11,15])floorRect(16,z,1,1,[.45,.68,.56],.20);
    floorRect(0,0,1,2,[.18,.25,.23],.8);
  }
  function drawDoorDepth(){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(resolution,innerWidth,innerHeight);gl.uniform2f(camera,camX,camY);gl.uniform1f(tilt,.045);gl.uniform1f(perspective,.00008);gl.uniform1f(timeUniform,performance.now()*.001);box(10455,220,18,290,8,8,[.10,.17,.18],1);box(10460,205,8,265,18,5,[.12,.19,.20],1);box(10720,220,18,290,8,8,[.10,.17,.18],1);}
  const timer=setInterval(()=>{if(typeof controlStationEntered==="undefined"||typeof drawTunnelWorld!=="function")return;clearInterval(timer);if(typeof move==="function"&&!move._controlStationSolidCollision){const originalMove=move;move=function(){if(!window.controlStationRoomActive){originalMove();return;}const oldX=player.x,oldZ=Number.isFinite(player.roomZ)?player.roomZ:Z0;player.roomPrevX=oldX;player.roomPrevZ=oldZ;originalMove();resolveRoomCollisions();player.vx=0;player.vy=0;};move._controlStationSolidCollision=true;}const originalTunnelDraw=drawTunnelWorld;drawTunnelWorld=function(){if(window.controlStationRoomActive){for(const b of controlBricks){ctx.save();ctx.fillStyle=b.held?"#6a5d4d":"#5a5146";ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle="#756957";ctx.fillRect(b.x,b.y,b.w,6);ctx.strokeStyle="rgba(210,195,165,.42)";ctx.lineWidth=2;ctx.strokeRect(b.x,b.y,b.w,b.h);ctx.restore();}drawPlayer();drawParticles();return;}originalTunnelDraw();};},100);
  const existingEnter=window.enterControlRoom;if(typeof existingEnter==="function"&&!existingEnter._roomWrapped){const wrappedEnter=function(){existingEnter.apply(this,arguments);setRoomMode(true);player.roomGridX=8;player.roomGridZ=1;player.roomTargetX=8;player.roomTargetZ=1;player.roomVisualX=X0+8*GRID;player.roomVisualZ=Z0+GRID;player.x=player.roomVisualX;player.roomZ=player.roomVisualZ;player.roomJumpY=0;player.roomJumpV=0;player.y=floorY-player.roomZ*.268-player.h;};wrappedEnter._roomWrapped=true;window.enterControlRoom=wrappedEnter;}
  if(typeof window.enterControlRoom!=="function")window.enterControlRoom=function(){setRoomMode(true);player.roomGridX=8;player.roomGridZ=1;player.roomTargetX=8;player.roomTargetZ=1;player.roomVisualX=X0+8*GRID;player.roomVisualZ=Z0+GRID;player.x=player.roomVisualX;player.roomZ=player.roomVisualZ;player.roomJumpY=0;player.roomJumpV=0;player.y=floorY-player.roomZ*.268-player.h;if(typeof saveGame==="function")saveGame();};
  if(typeof stage!=="undefined"&&stage>=18)setRoomMode(true);
  function frame(){if(roomMode)drawRoom();else if(typeof stage!=="undefined"&&stage===17)drawDoorDepth();else{gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);}requestAnimationFrame(frame);}frame();
})();
