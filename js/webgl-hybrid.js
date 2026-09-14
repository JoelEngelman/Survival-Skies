/* ============================================================
   CONTROL STATION 3D ROOM
   Invisible 50px movement grid; the grid is NOT the visual design.
   ============================================================ */
(function(){
  const canvas=document.getElementById("webgl-hybrid");
  if(!canvas)return;
  const gl=canvas.getContext("webgl",{alpha:true,antialias:true});
  if(!gl)return;

  const vs=`attribute vec3 a_position;uniform vec2 u_resolution;uniform vec2 u_camera;uniform float u_tilt;uniform float u_perspective;varying vec3 v_world;void main(){v_world=a_position;float depth=max(0.0,a_position.z);float scale=1.0/(1.0+depth*u_perspective);float sx=(a_position.x-u_camera.x)*scale;float sy=(a_position.y-u_camera.y-depth*u_tilt)*scale;gl_Position=vec4(sx/u_resolution.x*2.0-1.0,1.0-sy/u_resolution.y*2.0,0.0,1.0);}`;
  const fs=`precision mediump float;uniform vec4 u_color;uniform float u_time;varying vec3 v_world;void main(){float light=1.0-clamp(v_world.z/1000.0,0.0,1.0)*.12;float pulse=.006*sin(u_time*1.1+v_world.x*.002);gl_FragColor=vec4(u_color.rgb*(light+pulse),u_color.a);}`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;}
  const v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs);if(!v||!f)return;
  const program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
  const buffer=gl.createBuffer(),position=gl.getAttribLocation(program,"a_position"),resolution=gl.getUniformLocation(program,"u_resolution"),camera=gl.getUniformLocation(program,"u_camera"),tilt=gl.getUniformLocation(program,"u_tilt"),perspective=gl.getUniformLocation(program,"u_perspective"),color=gl.getUniformLocation(program,"u_color"),timeUniform=gl.getUniformLocation(program,"u_time");
  gl.enableVertexAttribArray(position);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

  const GRID=50,X0=10700,Z0=50,COLS=46,ROWS=18,floorY=580;let roomMode=false;
  function resize(){const dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.floor(innerWidth*dpr);canvas.height=Math.floor(innerHeight*dpr);canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";gl.viewport(0,0,canvas.width,canvas.height);}addEventListener("resize",resize);resize();
  function verts(data,c,a=1){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STREAM_DRAW);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);gl.uniform4f(color,c[0],c[1],c[2],a);gl.drawArrays(gl.TRIANGLES,0,data.length/3);}
  function quad(x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4,c,a=1){verts([x1,y1,z1,x2,y2,z2,x3,y3,z3,x1,y1,z1,x3,y3,z3,x4,y4,z4],c,a);}
  function box(x,y,z,w,h,d,c,a=1){const x2=x+w,y2=y+h,z2=z+d;quad(x,y,z,x2,y,z,x2,y2,z,x,y2,z,c,a);quad(x,y,z2,x,y2,z2,x2,y2,z2,x2,y,z2,c,a);quad(x,y2,z,x2,y2,z,x2,y2,z2,x,y2,z2,c,a);quad(x,y,z2,x2,y,z2,x2,y,z,x,y,z,c,a);quad(x,y,z,x,y2,z,x,y2,z2,x,y,z2,c,a);quad(x2,y,z2,x2,y2,z2,x2,y2,z,x2,y,z,c,a);}
  function floorRect(gx,gz,w,d,c,a=1){quad(X0+gx*GRID,floorY,Z0+gz*GRID,X0+(gx+w)*GRID,floorY,Z0+gz*GRID,X0+(gx+w)*GRID,floorY,Z0+(gz+d)*GRID,X0+gx*GRID,floorY,Z0+(gz+d)*GRID,c,a);}

  /* ------------------------------------------------------------
     INVISIBLE GRID COLLISION MAP
     ------------------------------------------------------------ */
  const blocked=new Set();
  function block(gx,gz,w=1,d=1){for(let x=gx;x<gx+w;x++)for(let z=gz;z<gz+d;z++)blocked.add(x+","+z);}
  for(let z=0;z<ROWS;z++){if(z<3||z>4)block(0,z);block(COLS-1,z);}for(let x=0;x<COLS;x++)block(x,ROWS-1);
  /* Operator desks */ block(6,6,10,2);block(20,6,8,2);block(32,6,8,2);
  /* Central operations table */ block(17,11,12,3);
  /* Cabinets / machinery */ block(4,13,8,2);block(35,12,7,3);
  /* Structural columns only */ block(3,8);block(42,8);
  window.controlStationCanMove=function(gx,gz){return !blocked.has(gx+","+gz);};

  function screen(x,y,z,w,h){box(x,y,z,w,h,10,[.025,.04,.042],1);box(x+7,y+7,z-4,w-14,h-14,4,[.30,.52,.41],.78);box(x+15,y+18,z-6,w*.5,4,3,[.8,.88,.82],.22);box(x+15,y+29,z-6,w*.3,3,3,[.8,.88,.82],.16);}

  function drawRoom(){
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(resolution,innerWidth,innerHeight);gl.uniform2f(camera,camX,camY);gl.uniform1f(tilt,.10);gl.uniform1f(perspective,.000035);gl.uniform1f(timeUniform,performance.now()*.001);
    const floor=[.055,.065,.064],wall=[.105,.12,.118],dark=[.065,.078,.078],trim=[.20,.23,.22],desk=[.115,.135,.132],top=[.18,.195,.185],metal=[.14,.16,.16];
    /* Solid floor -- no road/grid pattern. */ floorRect(0,0,COLS,ROWS,floor,1);
    /* Enclosed shell. */
    box(X0,floorY-340,Z0,48,340,3*GRID,dark,1);box(X0,floorY-340,Z0+5*GRID,48,340,(ROWS-6)*GRID,wall,1);box(X0,floorY-340,Z0+(ROWS-1)*GRID,COLS*GRID,340,50,dark,1);box(X0+(COLS-1)*GRID,floorY-340,Z0,50,340,ROWS*GRID,dark,1);
    /* Ceiling structure and broad lights. */
    for(const x of [5,15,25,35])box(X0+x*GRID,205,Z0+GRID,28,24,(ROWS-3)*GRID,trim,1);
    for(const x of [8,18,28,38])box(X0+x*GRID,232,Z0+2*GRID,120,7,180,[.72,.78,.72],.18);
    /* Proper doorway at the front-left. */
    box(X0,225,Z0,45,105,GRID,trim,1);box(X0,225,Z0+2*GRID,45,105,GRID,trim,1);box(X0,330,Z0,45,24,GRID*3,top,1);box(X0+8,344,Z0+GRID,8,185,GRID,metal,1);
    /* Large back-wall command display. */
    box(X0+4*GRID,315,Z0+(ROWS-1)*GRID-20,38*GRID,115,18,dark,1);
    for(const x of [7,13,19,25,31,37])screen(X0+x*GRID,360,Z0+(ROWS-1)*GRID-38,4*GRID,62);
    /* Three recognizable operator desks. */
    for(const [gx,w] of [[6,10],[20,8],[32,8]]){const x=X0+gx*GRID,z=Z0+6*GRID;box(x,430,z,w*GRID,72,2*GRID,desk,1);box(x+10,502,z+10,w*GRID-20,16,2*GRID-20,top,1);for(let i=0;i<(w>=10?3:2);i++)screen(x+22+i*((w*GRID-44)/((w>=10?3:2)-1||1)),380,z+2,72,48);}
    /* Central command table, making the room read as a control center. */
    box(X0+17*GRID,475,Z0+11*GRID,12*GRID,36,3*GRID,desk,1);box(X0+17*GRID+16,511,Z0+11*GRID+16,12*GRID-32,12,3*GRID-32,top,1);for(let i=0;i<4;i++)screen(X0+(18+i*3)*GRID,435,Z0+11*GRID+5,92,34);
    /* Storage and engineering banks. */
    box(X0+4*GRID,420,Z0+13*GRID,8*GRID,150,2*GRID,dark,1);for(let i=0;i<4;i++)box(X0+(4+i*2)*GRID+8,455,Z0+13*GRID+8,84,82,6,metal,1);
    box(X0+35*GRID,420,Z0+12*GRID,7*GRID,150,3*GRID,dark,1);for(let i=0;i<3;i++)box(X0+(35+i*2)*GRID+12,455,Z0+12*GRID+12,70,82,8,metal,1);
    /* Two structural columns, not a row of street poles. */
    for(const [gx,gz] of [[3,8],[42,8]]){const x=X0+gx*GRID,z=Z0+gz*GRID;box(x+8,205,z+8,34,375,34,[.16,.18,.18],1);box(x,565,z,50,15,50,trim,1);box(x+2,205,z+2,46,10,46,trim,1);}
    floorRect(0,0,1,3,[.18,.21,.20],.55);
  }

  function setRoomMode(enabled){roomMode=!!enabled;window.controlStationRoomActive=roomMode;canvas.classList.toggle("room-mode",roomMode);canvas.style.zIndex="0";const game=document.getElementById("game");if(game){game.style.visibility="visible";game.style.zIndex="1";}}
  window.hybridSetRoomMode=setRoomMode;

  /* Keep the normal tunnel renderer outside the room; inside, draw only the player. */
  const originalTunnelDraw=typeof drawTunnelWorld==="function"?drawTunnelWorld:null;
  if(originalTunnelDraw){drawTunnelWorld=function(){if(window.controlStationRoomActive){if(typeof drawPlayer==="function")drawPlayer();if(typeof drawParticles==="function")drawParticles();return;}originalTunnelDraw();};}

  const existingEnter=window.enterControlRoom;
  if(typeof existingEnter==="function"&&!existingEnter._roomWrapped){
    const wrapped=function(){existingEnter.apply(this,arguments);setRoomMode(true);player.roomGridX=8;player.roomGridZ=1;player.roomTargetX=8;player.roomTargetZ=1;player.roomVisualX=X0+8*GRID;player.roomVisualZ=Z0+GRID;player.x=player.roomVisualX;player.roomZ=player.roomVisualZ;player.roomJumpY=0;player.roomJumpV=0;player.y=floorY-player.roomZ*.268-player.h;};wrapped._roomWrapped=true;window.enterControlRoom=wrapped;
  }
  if(typeof window.enterControlRoom!=="function")window.enterControlRoom=function(){setRoomMode(true);player.roomGridX=8;player.roomGridZ=1;player.roomTargetX=8;player.roomTargetZ=1;player.roomVisualX=X0+8*GRID;player.roomVisualZ=Z0+GRID;player.x=player.roomVisualX;player.roomZ=player.roomVisualZ;player.roomJumpY=0;player.roomJumpV=0;player.y=floorY-player.roomZ*.268-player.h;if(typeof saveGame==="function")saveGame();};

  if(typeof stage!=="undefined"&&stage>=18)setRoomMode(true);
  function frame(){if(roomMode)drawRoom();else{gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);}requestAnimationFrame(frame);}frame();
})();
