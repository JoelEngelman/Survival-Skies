/* ============================================================
   HYBRID WEBGL RENDERER
   The Control Station is rendered as a real enclosed 3D room.
   The normal 2D game remains unchanged outside the room.
   ============================================================ */
(function(){
  const canvas=document.getElementById("webgl-hybrid");
  if(!canvas)return;
  const gl=canvas.getContext("webgl",{alpha:true,antialias:true});
  if(!gl)return;

  const vsSource=`
    attribute vec3 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_camera;
    uniform float u_tilt;
    uniform float u_perspective;
    varying vec3 v_world;
    void main(){
      v_world=a_position;
      float depth=max(0.0,a_position.z);
      float scale=1.0/(1.0+depth*u_perspective);
      float sx=(a_position.x-u_camera.x)*scale;
      float sy=(a_position.y-u_camera.y-depth*u_tilt)*scale;
      gl_Position=vec4(
        sx/u_resolution.x*2.0-1.0,
        1.0-sy/u_resolution.y*2.0,
        0.0,
        1.0
      );
    }
  `;

  const fsSource=`
    precision mediump float;
    uniform vec4 u_color;
    uniform float u_time;
    varying vec3 v_world;
    void main(){
      float depthLight=1.0-clamp(v_world.z/1050.0,0.0,1.0)*0.26;
      float pulse=0.018*sin(u_time*1.5+v_world.x*0.004+v_world.z*0.003);
      gl_FragColor=vec4(u_color.rgb*(depthLight+pulse),u_color.a);
    }
  `;

  function makeShader(type,source){
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader,gl.COMPILE_STATUS)?shader:null;
  }

  const vs=makeShader(gl.VERTEX_SHADER,vsSource);
  const fs=makeShader(gl.FRAGMENT_SHADER,fsSource);
  if(!vs||!fs)return;

  const program=gl.createProgram();
  gl.attachShader(program,vs);
  gl.attachShader(program,fs);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  gl.useProgram(program);

  const buffer=gl.createBuffer();
  const position=gl.getAttribLocation(program,"a_position");
  const resolution=gl.getUniformLocation(program,"u_resolution");
  const camera=gl.getUniformLocation(program,"u_camera");
  const tilt=gl.getUniformLocation(program,"u_tilt");
  const perspective=gl.getUniformLocation(program,"u_perspective");
  const color=gl.getUniformLocation(program,"u_color");
  const timeUniform=gl.getUniformLocation(program,"u_time");

  gl.enableVertexAttribArray(position);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

  let roomMode=false;

  /* One consistent room coordinate system.
     X = left/right, Z = front/back, Y = height. */
  const station={
    left:10600,
    right:13180,
    front:0,
    back:1030,
    floorY:580,
    ceilingY:210
  };

  function resize(){
    const dpr=Math.min(2,devicePixelRatio||1);
    const w=innerWidth;
    const h=innerHeight;
    canvas.width=Math.floor(w*dpr);
    canvas.height=Math.floor(h*dpr);
    canvas.style.width=w+"px";
    canvas.style.height=h+"px";
    gl.viewport(0,0,canvas.width,canvas.height);
  }
  addEventListener("resize",resize);
  resize();

  function setRoomMode(enabled){
    roomMode=!!enabled;
    window.controlStationRoomActive=roomMode;
    canvas.classList.toggle("room-mode",roomMode);
    canvas.style.zIndex="0";
    const game=document.getElementById("game");
    if(game){
      game.style.visibility="visible";
      game.style.zIndex="1";
    }
  }
  window.hybridSetRoomMode=setRoomMode;

  function verts(data,c,a=1){
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STREAM_DRAW);
    gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
    gl.uniform4f(color,c[0],c[1],c[2],a);
    gl.drawArrays(gl.TRIANGLES,0,data.length/3);
  }

  function quad(
    x1,y1,z1,
    x2,y2,z2,
    x3,y3,z3,
    x4,y4,z4,
    c,a=1
  ){
    verts([
      x1,y1,z1,x2,y2,z2,x3,y3,z3,
      x1,y1,z1,x3,y3,z3,x4,y4,z4
    ],c,a);
  }

  function box(x,y,z,w,h,d,c,a=1){
    const x2=x+w;
    const y2=y+h;
    const z2=z+d;

    /* front */
    quad(x,y,z,x2,y,z,x2,y2,z,x,y2,z,c,a);
    /* back */
    quad(x,y,z2,x,y2,z2,x2,y2,z2,x2,y,z2,c,a);
    /* top */
    quad(x,y2,z,x2,y2,z,x2,y2,z2,x,y2,z2,c,a);
    /* bottom */
    quad(x,y,z2,x2,y,z2,x2,y,z,x,y,z,c,a);
    /* left */
    quad(x,y,z,x,y2,z,x,y2,z2,x,y,z2,c,a);
    /* right */
    quad(x2,y,z2,x2,y2,z2,x2,y2,z,x2,y,z,c,a);
  }

  function floorTile(x,z,w,d,c,a=1){
    quad(
      x,station.floorY,z,
      x+w,station.floorY,z,
      x+w,station.floorY,z+d,
      x,station.floorY,z+d,
      c,a
    );
  }

  function screen(x,y,z,w,h,c=[.48,.78,.64],a=.72){
    box(x,y,z,w,h,8,[.025,.045,.047],1);
    box(x+8,y+8,z-3,w-16,h-16,4,c,a);
  }

  function lightStrip(x,z,w,d,a=.12){
    floorTile(x,z,w,d,[.55,.86,.70],a);
  }

  /* ============================================================
     SOLID ROOM GEOMETRY
     Every visible wall/furniture footprint has a matching collider.
     The entrance is an opening in the left wall, not a fake wall.
     ============================================================ */

  const roomSolids=[];
  function solid(x1,x2,z1,z2){
    roomSolids.push({x1,x2,z1,z2});
  }

  /* Left wall with a real doorway opening around the entry point. */
  solid(10600,10685,220,1030);
  solid(10600,10685,0,18);
  solid(10600,10685,202,220);

  /* Right wall and rear wall. */
  solid(13095,13180,0,1030);
  solid(10600,13180,1012,1030);

  /* Door jambs and threshold keep the doorway feeling structural. */
  solid(10600,10685,18,42);
  solid(10600,10685,198,220);

  /* Main workstation islands. */
  solid(10830,11390,355,500);
  solid(11500,11920,515,650);
  solid(12270,12720,690,825);

  /* Storage / equipment blocks. */
  solid(10730,11010,650,790);
  solid(12780,13030,360,500);

  /* Structural columns. */
  for(let x=10770;x<=12930;x+=540){
    solid(x,x+48,180,235);
  }

  function roomCollides(x,z){
    const px1=x;
    const px2=x+player.w;
    const pz1=z-16;
    const pz2=z+16;

    return roomSolids.some(s=>
      px2>s.x1 &&
      px1<s.x2 &&
      pz2>s.z1 &&
      pz1<s.z2
    );
  }

  /* Axis-separated resolution means Mara can slide along walls instead
     of getting stuck or being teleported backwards at corners. */
  function resolveRoomCollisions(oldX,oldZ){
    let x=player.x;
    let z=player.roomZ;

    if(roomCollides(x,oldZ))x=oldX;
    if(roomCollides(x,z))z=oldZ;

    player.x=x;
    player.roomZ=z;
    player.y=station.floorY-player.roomZ*.268-player.h;
  }

  /* ============================================================
     CONTROL STATION DESIGN
     A simple believable control room: floor, enclosed walls,
     doorway, ceiling structure, consoles, workstations and aisles.
     ============================================================ */

  function drawRoom(){
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(resolution,innerWidth,innerHeight);
    gl.uniform2f(camera,camX,camY);
    gl.uniform1f(tilt,0.075);
    gl.uniform1f(perspective,0.00022);
    gl.uniform1f(timeUniform,performance.now()*0.001);

    const wall=[.055,.075,.075];
    const wallEdge=[.105,.145,.142];
    const floor=[.035,.055,.057];
    const metal=[.075,.105,.105];
    const console=[.075,.115,.115];
    const consoleTop=[.11,.17,.17];
    const green=[.45,.78,.63];

    /* ----------------------------------------------------------
       FLOOR: one continuous surface, with restrained panel lines.
       ---------------------------------------------------------- */
    floorTile(station.left,station.front,station.right-station.left,station.back,[.035,.055,.057],1);

    for(let z=0;z<=1000;z+=100){
      floorTile(station.left+15,z,station.right-station.left-30,3,[.13,.19,.18],.12);
    }
    for(let x=10600;x<=13100;x+=125){
      floorTile(x,15,3,980,[.13,.19,.18],.08);
    }

    /* ----------------------------------------------------------
       WALLS: three solid sides, with the left-side entrance open.
       ---------------------------------------------------------- */
    box(10600,170,220,85,410,790,wall,1);
    box(10600,170,0,85,410,18,wall,1);
    box(10600,170,202,85,410,18,wall,1);
    box(13095,170,0,85,410,1030,wall,1);
    box(10600,170,1012,2580,410,18,wall,1);

    /* Wall base trim makes the room read as one enclosed structure. */
    box(10685,540,0,2410,14,18,wallEdge,1);
    box(10685,540,1012,2410,14,18,wallEdge,1);
    box(10600,540,220,85,14,790,wallEdge,1);
    box(13095,540,0,85,14,1030,wallEdge,1);

    /* ----------------------------------------------------------
       CEILING BEAMS: fixed architectural structure.
       ---------------------------------------------------------- */
    for(let x=10720;x<13100;x+=400){
      box(x,station.ceilingY,55,38,34,920,metal,1);
    }
    box(10685,205,0,2410,18,28,wallEdge,1);
    box(10685,205,1002,2410,18,28,wallEdge,1);

    /* Long ceiling light bars. */
    box(10900,215,145,720,8,24,[.45,.70,.58],.30);
    box(11920,215,150,820,8,24,[.45,.70,.58],.26);
    box(12820,215,170,250,8,24,[.45,.70,.58],.22);

    /* ----------------------------------------------------------
       ENTRANCE: obvious structural frame around the actual opening.
       ---------------------------------------------------------- */
    box(10600,150,18,85,260,30,wallEdge,1);
    box(10600,150,190,85,260,30,wallEdge,1);
    box(10600,385,18,85,25,202,consoleTop,1);
    box(10600,385,18,85,25,202,[.18,.28,.27],.45);

    /* Door depth / threshold. */
    box(10605,565,18,75,10,202,[.13,.18,.18],1);
    floorTile(10605,18,75,202,[.12,.18,.18],1);

    /* ----------------------------------------------------------
       MAIN CENTRAL AISLE. Furniture is kept to the sides of it.
       ---------------------------------------------------------- */
    floorTile(11395,80,105,900,[.07,.10,.10],.38);
    floorTile(11910,80,360,120,[.07,.10,.10],.28);

    /* ----------------------------------------------------------
       LEFT CONTROL BANK
       ---------------------------------------------------------- */
    box(10830,430,355,560,70,145,console,1);
    box(10855,500,370,510,28,115,consoleTop,1);
    box(10875,528,382,145,92,8,[.035,.065,.066],1);
    box(11035,528,382,145,92,8,[.035,.065,.066],1);
    box(11195,528,382,145,92,8,[.035,.065,.066],1);
    screen(10887,545,373,121,56,green,.62);
    screen(11047,545,373,121,56,green,.54);
    screen(11207,545,373,121,56,green,.66);

    /* ----------------------------------------------------------
       MID WORKSTATION
       ---------------------------------------------------------- */
    box(11500,390,515,420,70,135,console,1);
    box(11525,460,530,370,28,105,consoleTop,1);
    box(11555,488,542,110,76,8,[.035,.065,.066],1);
    box(11680,488,542,110,76,8,[.035,.065,.066],1);
    box(11805,488,542,90,76,8,[.035,.065,.066],1);
    screen(11567,502,534,92,48,green,.55);
    screen(11692,502,534,92,48,green,.63);
    screen(11817,502,534,72,48,green,.46);

    /* ----------------------------------------------------------
       REAR COMMAND CONSOLE
       ---------------------------------------------------------- */
    box(12270,410,690,450,70,135,console,1);
    box(12295,480,705,400,28,105,consoleTop,1);
    screen(12315,512,710,110,60,green,.64);
    screen(12445,512,710,110,60,green,.48);
    screen(12575,512,710,110,60,green,.60);

    /* ----------------------------------------------------------
       EQUIPMENT / STORAGE BLOCKS
       ---------------------------------------------------------- */
    box(10730,445,650,280,125,140,[.065,.095,.095],1);
    box(10755,570,665,230,18,110,wallEdge,1);
    box(10775,588,668,190,62,6,[.08,.13,.13],1);
    box(10775,655,668,190,62,6,[.08,.13,.13],1);

    box(12780,430,360,250,90,140,[.065,.095,.095],1);
    box(12805,520,375,200,18,110,wallEdge,1);
    box(12825,538,378,160,48,6,[.08,.13,.13],1);

    /* ----------------------------------------------------------
       FIXED COLUMNS: these are architectural, not decorations.
       ---------------------------------------------------------- */
    for(let x=10770;x<=12930;x+=540){
      box(x,205,180,48,355,55,[.075,.11,.11],1);
      box(x-7,205,173,62,18,69,wallEdge,1);
      box(x-7,540,173,62,18,69,wallEdge,1);
      box(x+8,305,174,32,115,6,[.40,.64,.53],.28);
    }

    /* ----------------------------------------------------------
       SMALL FLOOR LIGHTS define the walking lanes without blocking.
       ---------------------------------------------------------- */
    lightStrip(10700,270,260,8,.12);
    lightStrip(11420,270,260,8,.10);
    lightStrip(12000,270,280,8,.10);
    lightStrip(12700,270,250,8,.09);

    /* A few contact shadows ground the large furniture. */
    floorTile(10855,345,510,18,[0,0,0],.22);
    floorTile(11525,505,370,16,[0,0,0],.20);
    floorTile(12300,680,390,16,[0,0,0],.18);
  }

  function drawDoorDepth(){
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(resolution,innerWidth,innerHeight);
    gl.uniform2f(camera,camX,camY);
    gl.uniform1f(tilt,0.045);
    gl.uniform1f(perspective,0.00008);
    gl.uniform1f(timeUniform,performance.now()*0.001);

    box(10455,220,18,290,8,8,[.10,.17,.18],1);
    box(10460,205,8,265,18,5,[.12,.19,.20],1);
    box(10720,220,18,290,8,8,[.10,.17,.18],1);
  }

  function frame(){
    if(roomMode){
      drawRoom();
    }else if(typeof stage!=="undefined"&&stage===17){
      drawDoorDepth();
    }else{
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    requestAnimationFrame(frame);
  }

  const timer=setInterval(()=>{
    if(typeof controlStationEntered==="undefined"||typeof drawTunnelWorld!=="function")return;
    clearInterval(timer);

    /* Keep the existing room movement, but give the new room real walls
       and furniture collision. */
    if(typeof move==="function"&&!move._controlStationSolidCollision){
      const originalMove=move;
      move=function(){
        if(!window.controlStationRoomActive){
          originalMove();
          return;
        }

        const oldX=player.x;
        const oldZ=Number.isFinite(player.roomZ)?player.roomZ:45;
        originalMove();
        resolveRoomCollisions(oldX,oldZ);
        player.vx=player.x-oldX;
        player.vy=0;
        player.grounded=true;
      };
      move._controlStationSolidCollision=true;
    }

    const originalTunnelDraw=drawTunnelWorld;
    drawTunnelWorld=function(){
      if(window.controlStationRoomActive){
        for(const b of controlBricks){
          ctx.save();
          ctx.fillStyle=b.held?"#6a5d4d":"#5a5146";
          ctx.fillRect(b.x,b.y,b.w,b.h);
          ctx.fillStyle="#756957";
          ctx.fillRect(b.x,b.y,b.w,6);
          ctx.strokeStyle="rgba(210,195,165,.42)";
          ctx.lineWidth=2;
          ctx.strokeRect(b.x,b.y,b.w,b.h);
          ctx.strokeStyle="rgba(20,25,25,.35)";
          ctx.beginPath();
          ctx.moveTo(b.x+12,b.y+15);
          ctx.lineTo(b.x+b.w-14,b.y+b.h-14);
          ctx.moveTo(b.x+b.w-22,b.y+12);
          ctx.lineTo(b.x+18,b.y+b.h-17);
          ctx.stroke();
          ctx.restore();
        }
        drawPlayer();
        drawParticles();
        return;
      }

      originalTunnelDraw();

      if(stage===17){
        for(const b of controlBricks){
          ctx.save();
          ctx.fillStyle=b.held?"#6a5d4d":"#5a5146";
          ctx.fillRect(b.x,b.y,b.w,b.h);
          ctx.fillStyle="#756957";
          ctx.fillRect(b.x,b.y,b.w,6);
          ctx.strokeStyle="rgba(210,195,165,.42)";
          ctx.lineWidth=2;
          ctx.strokeRect(b.x,b.y,b.w,b.h);
          ctx.strokeStyle="rgba(20,25,25,.35)";
          ctx.beginPath();
          ctx.moveTo(b.x+12,b.y+15);
          ctx.lineTo(b.x+b.w-14,b.y+b.h-14);
          ctx.moveTo(b.x+b.w-22,b.y+12);
          ctx.lineTo(b.x+18,b.y+b.h-17);
          ctx.stroke();
          ctx.restore();
        }
        drawPlayer();
        drawParticles();
      }
    };

    if(typeof drawControlStationForeground==="function")
      drawControlStationForeground=function(){};

    const originalBackground=drawBackground;
    drawBackground=function(){
      if(window.controlStationRoomActive)return;
      originalBackground();
    };

    const originalShadow=drawPlayerShadow;
    drawPlayerShadow=function(){
      if(stage===17||window.controlStationRoomActive)return;
      originalShadow();
    };

    const originalEnterRoom=enterControlRoom;
    enterControlRoom=function(){
      originalEnterRoom();
      player.x=11100;
      player.y=520;
      player.roomZ=45;
      player.spawnX=player.x;
      player.spawnY=player.y;
      player.vx=0;
      player.vy=0;
      player.grounded=true;

      const positions=[
        [11280,520],[11380,520],[11480,520],
        [11580,520],[11680,520],[11780,520]
      ];
      controlBricks.forEach((b,i)=>{
        b.held=false;
        b.x=positions[i][0];
        b.y=positions[i][1];
        b.vx=0;
        b.vy=0;
      });

      setRoomMode(true);
      camX=Math.max(0,player.x-innerWidth*.45);
      camY=0;
      saveGame();
    };

    if(stage>=18){
      controlStationEntered=true;
      setRoomMode(true);
      player.x=11100;
      player.y=520;
      player.roomZ=45;
      player.spawnX=player.x;
      player.spawnY=player.y;
      player.vx=0;
      player.vy=0;
      player.grounded=true;
      camX=Math.max(0,player.x-innerWidth*.45);
      camY=0;
    }
  },50);

  frame();
})();
