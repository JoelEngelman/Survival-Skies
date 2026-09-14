/* ============================================================
   HYBRID WEBGL RENDERER
   Canvas 2D remains the game renderer. WebGL adds the actual
   architectural depth, lighting, shadows and subtle map-like tilt.
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
      gl_Position=vec4(sx/u_resolution.x*2.0-1.0,1.0-sy/u_resolution.y*2.0,0.0,1.0);
    }
  `;
  const fsSource=`
    precision mediump float;
    uniform vec4 u_color;
    uniform float u_time;
    varying vec3 v_world;
    void main(){
      float depthLight=1.0-clamp(v_world.z/1100.0,0.0,1.0)*0.30;
      float pulse=0.035*sin(u_time*1.7+v_world.x*0.006+v_world.z*0.002);
      float gridX=step(0.96,fract(v_world.x/105.0));
      float gridZ=step(0.975,fract(v_world.z/105.0));
      float grid=(gridX+gridZ)*0.08;
      vec3 lit=u_color.rgb*(depthLight+pulse)+vec3(grid);
      gl_FragColor=vec4(lit,u_color.a);
    }
  `;
  function makeShader(type,source){
    const s=gl.createShader(type);
    gl.shaderSource(s,source); gl.compileShader(s);
    return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;
  }
  const vs=makeShader(gl.VERTEX_SHADER,vsSource),fs=makeShader(gl.FRAGMENT_SHADER,fsSource);
  if(!vs||!fs)return;
  const program=gl.createProgram();
  gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
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
  const station={left:10600,right:13180,front:580,back:0};

  function resize(){
    const dpr=Math.min(2,devicePixelRatio||1);
    const w=innerWidth,h=innerHeight;
    canvas.width=Math.floor(w*dpr); canvas.height=Math.floor(h*dpr);
    canvas.style.width=w+"px"; canvas.style.height=h+"px";
    gl.viewport(0,0,canvas.width,canvas.height);
  }
  addEventListener("resize",resize); resize();

  function setRoomMode(enabled){
    roomMode=!!enabled;
    window.controlStationRoomActive=roomMode;
    canvas.classList.toggle("room-mode",roomMode);
    canvas.style.zIndex="0";
    const game=document.getElementById("game");
    if(game){game.style.visibility="visible";game.style.zIndex="1";}
  }
  window.hybridSetRoomMode=setRoomMode;

  function verts(data,c,a=1){
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STREAM_DRAW);
    gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
    gl.uniform4f(color,c[0],c[1],c[2],a);
    gl.drawArrays(gl.TRIANGLES,0,data.length/3);
  }
  function quad(x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4,c,a=1){
    verts([x1,y1,z1,x2,y2,z2,x3,y3,z3,x1,y1,z1,x3,y3,z3,x4,y4,z4],c,a);
  }
  function box(x,y,z,w,h,d,c,a=1){
    const x2=x+w,y2=y+h,z2=z+d;
    quad(x,y,z,x2,y,z,x2,y2,z,x,y2,z,c,a);
    quad(x,y,z2,x,y2,z2,x2,y2,z2,x2,y,z2,c,a);
    quad(x,y,z,x2,y,z2,x2,y,z,x2,y,z2,c,a);
    quad(x,y2,z,x2,y2,z,x2,y2,z2,x,y2,z2,c,a);
    quad(x,y,z,x,y2,z,x,y2,z2,x,y,z2,c,a);
    quad(x2,y,z2,x2,y2,z2,x2,y2,z,x2,y,z,c,a);
  }
  function ellipse(cx,cy,rx,ry,z,c,a){
    const data=[];
    for(let i=0;i<32;i++){
      const p=i/32*Math.PI*2,q=(i+1)/32*Math.PI*2;
      data.push(cx,cy,z,cx+Math.cos(p)*rx,cy+Math.sin(p)*ry,z,cx+Math.cos(q)*rx,cy+Math.sin(q)*ry,z);
    }
    verts(data,c,a);
  }

  function drawRoom(){
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(resolution,innerWidth,innerHeight);
    gl.uniform2f(camera,camX,camY);
    gl.uniform1f(tilt,0.095);
    gl.uniform1f(perspective,0.00034);
    gl.uniform1f(timeUniform,performance.now()*0.001);

    /* Floor extends exactly to the rear wall so there is no visible gap. */
    quad(station.left,580,0,station.right,580,0,station.right,285,1100,station.left,285,1100,[.055,.095,.098],1);
    for(let z=0;z<1100;z+=110){
      const y=580-z*0.268;
      quad(station.left,y,z,station.right,y,z,station.right,y-2,z+3,station.left,y-2,z+3,[.16,.25,.24],.16);
    }

    /* Rear and side walls meet the floor cleanly. */
    box(station.left,120,1030,station.right-station.left,470,70,[.045,.075,.078],1);
    box(station.left,165,0,85,415,1030,[.065,.11,.11],1);
    box(station.right-85,165,0,85,415,1030,[.065,.11,.11],1);

    /* Raised walkways and 3D layers. */
    box(10720,430,300,740,35,190,[.08,.14,.15],1);
    box(11820,395,530,820,35,220,[.075,.13,.14],1);
    box(12620,425,780,390,35,180,[.08,.14,.15],1);

    /* Control banks with visible depth. */
    box(10860,330,410,500,250,150,[.10,.16,.17],1);
    box(10905,295,455,410,55,120,[.14,.22,.22],1);
    box(11470,315,570,340,190,150,[.075,.13,.14],1);
    box(11520,280,600,270,55,120,[.12,.20,.20],1);
    box(12280,350,710,290,180,145,[.08,.14,.15],1);
    box(12320,315,745,210,55,115,[.12,.20,.20],1);

    for(let x=10820;x<13000;x+=420){
      box(x,265,180,55,155,55,[.12,.19,.20],1);
      box(x+8,250,195,39,130,39,[.18,.27,.26],1);
    }

    /* Glowing monitors. */
    box(10925,270,500,145,115,12,[.04,.08,.09],1);
    box(10938,282,513,119,91,4,[.52,.88,.70],.32);
    box(11595,245,670,210,145,12,[.04,.08,.09],1);
    box(11610,260,683,180,115,4,[.52,.88,.70],.30);
    box(12350,285,815,175,125,12,[.04,.08,.09],1);
    box(12363,300,828,145,95,4,[.52,.88,.70],.28);

    /* Subtle volumetric light strips. */
    box(10750,535,100,1100,8,12,[.55,.86,.70],.08);
    box(11980,500,260,800,8,12,[.55,.86,.70],.07);
    box(12900,540,120,700,8,12,[.55,.86,.70],.06);

    /* Contact shadows are placed beneath their corresponding structures. */
    ellipse(11100,500,260,34,300,[0,0,0],.30);
    ellipse(11950,465,300,38,530,[0,0,0],.27);
    ellipse(12700,495,230,32,780,[0,0,0],.25);
  }

  function drawDoorDepth(){
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(resolution,innerWidth,innerHeight);
    gl.uniform2f(camera,camX,camY);
    gl.uniform1f(tilt,0.045); gl.uniform1f(perspective,0.00008);
    gl.uniform1f(timeUniform,performance.now()*0.001);
    box(10455,220,18,290,8,8,[.10,.17,.18],1);
    box(10460,205,8,265,18,5,[.12,.19,.20],1);
    box(10720,220,18,290,8,8,[.10,.17,.18],1);
  }

  function frame(){
    if(roomMode)drawRoom();
    else if(typeof stage!=="undefined"&&stage===17)drawDoorDepth();
    else{gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);}
    requestAnimationFrame(frame);
  }

  const timer=setInterval(()=>{
    if(typeof controlStationEntered==="undefined"||typeof drawTunnelWorld!=="function")return;
    clearInterval(timer);

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
        drawPlayer(); drawParticles();
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
        drawPlayer(); drawParticles();
      }
    };

    if(typeof drawControlStationForeground==="function")drawControlStationForeground=function(){};

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
      player.x=11100; player.y=520;
      player.spawnX=player.x; player.spawnY=player.y;
      player.vx=0; player.vy=0; player.grounded=true;
      const positions=[[11280,520],[11380,520],[11480,520],[11580,520],[11680,520],[11780,520]];
      controlBricks.forEach((b,i)=>{b.held=false;b.x=positions[i][0];b.y=positions[i][1];b.vx=0;b.vy=0;});
      setRoomMode(true);
      camX=Math.max(0,player.x-innerWidth*.45); camY=0;
      saveGame();
    };

    if(stage>=18){
      controlStationEntered=true;
      setRoomMode(true);
      player.x=11100; player.y=520;
      player.spawnX=player.x; player.spawnY=player.y;
      player.vx=0; player.vy=0; player.grounded=true;
      camX=Math.max(0,player.x-innerWidth*.45); camY=0;
    }
  },50);

  frame();
})();