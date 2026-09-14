/* ============================================================
   HYBRID WEBGL RENDERER
   Existing Canvas 2D remains the game renderer. WebGL is a
   transparent architectural/lighting layer underneath it.
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
    void main(){
      float depth=a_position.z;
      float scale=1.0/(1.0+depth*u_perspective);
      float sx=(a_position.x-u_camera.x)*scale;
      float sy=(a_position.y-u_camera.y-depth*u_tilt)*scale;
      gl_Position=vec4(sx/u_resolution.x*2.0-1.0,1.0-sy/u_resolution.y*2.0,0.0,1.0);
    }
  `;
  const fsSource=`
    precision mediump float;
    uniform vec4 u_color;
    void main(){gl_FragColor=u_color;}
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
  gl.enableVertexAttribArray(position);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

  let roomMode=false;
  const station={left:10600,right:13180,front:580,back:165};

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
    canvas.style.zIndex=roomMode?"0":"2";
    const game=document.getElementById("game");
    if(game){
      game.style.visibility="visible";
      game.style.zIndex="1";
      game.classList.toggle("room-tilt",roomMode);
    }
    canvas.classList.toggle("room-tilt",roomMode);
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
    quad(x,y,z,x2,y,z2,x2,y,z,c,a);
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
    gl.uniform1f(tilt,.12);
    gl.uniform1f(perspective,.00016);

    /* A shallow 3D floor: depth moves gently upward, like a tilted map. */
    quad(station.left,station.front,0,station.right,station.front,0,station.right,station.front,1050,station.left,station.front,1050,[.055,.095,.098],1);
    for(let z=0;z<1050;z+=105){
      quad(station.left,station.front,z,station.right,station.front,z,station.right,station.front,z+3,station.left,station.front,z+3,[.15,.23,.23],.12);
    }

    /* Rear and side structures create the layered depth. */
    box(station.left,station.back,900,station.right-station.left,415,70,[.055,.095,.098],1);
    box(station.left,station.back,0,70,415,900,[.07,.12,.12],1);
    box(station.right-70,station.back,0,70,415,900,[.07,.12,.12],1);

    /* Control banks. */
    box(10880,350,420,470,420,150,[.10,.16,.17],1);
    box(10920,320,460,370,70,120,[.14,.21,.22],1);
    box(11540,300,650,300,70,170,[.075,.13,.14],1);
    box(11590,270,570,220,45,110,[.12,.20,.20],1);
    box(12400,360,400,150,90,150,[.08,.14,.15],1);

    /* Smaller raised layers. */
    for(let x=10820;x<13000;x+=420){
      box(x,270,180,55,170,55,[.12,.19,.20],1);
      box(x+8,255,195,39,145,39,[.17,.25,.24],1);
    }

    /* Screens. */
    box(11635,330,820,190,190,12,[.05,.09,.10],1);
    box(11650,345,830,160,155,5,[.55,.86,.70],.16);
    box(12720,385,760,140,130,10,[.05,.09,.10],1);
    box(12732,400,770,110,105,5,[.55,.86,.70],.18);

    /* WebGL soft contact shadows. */
    ellipse(11200,580,230,35,8,[0,0,0],.24);
    ellipse(11900,580,260,38,10,[0,0,0],.22);
    ellipse(12700,580,180,30,12,[0,0,0],.20);
  }

  function drawDoorDepth(){
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(resolution,innerWidth,innerHeight);
    gl.uniform2f(camera,camX,camY);
    gl.uniform1f(tilt,.05); gl.uniform1f(perspective,.00005);
    box(10455,220,18,290,8,8,[.10,.17,.18],1);
    box(10720,220,18,290,8,8,[.10,.17,.18],1);
    box(10460,205,8,265,18,5,[.12,.19,.20],1);
  }

  function frame(){
    if(roomMode)drawRoom();
    else if(typeof stage!=="undefined"&&stage===17)drawDoorDepth();
    else{gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);}
    requestAnimationFrame(frame);
  }

  /* Wait until control-station.js exists, then fix its world draw ordering. */
  const timer=setInterval(()=>{
    if(typeof controlStationEntered==="undefined"||typeof drawTunnelWorld!=="function")return;
    clearInterval(timer);

    const originalTunnelDraw=drawTunnelWorld;
    drawTunnelWorld=function(){
      if(window.controlStationRoomActive){
        for(const b of controlBricks){
          if(b.held)continue;
          ctx.save();
          ctx.fillStyle="#5a5146"; ctx.fillRect(b.x,b.y,b.w,b.h);
          ctx.fillStyle="#756957"; ctx.fillRect(b.x,b.y,b.w,6);
          ctx.strokeStyle="rgba(210,195,165,.35)"; ctx.lineWidth=2; ctx.strokeRect(b.x,b.y,b.w,b.h);
          ctx.restore();
        }
        drawPlayer(); drawParticles();
        return;
      }
      originalTunnelDraw();
      if(stage===17){
        for(const b of controlBricks){
          if(b.held)continue;
          ctx.save();
          ctx.fillStyle="#5a5146"; ctx.fillRect(b.x,b.y,b.w,b.h);
          ctx.fillStyle="#756957"; ctx.fillRect(b.x,b.y,b.w,6);
          ctx.strokeStyle="rgba(210,195,165,.35)"; ctx.lineWidth=2; ctx.strokeRect(b.x,b.y,b.w,b.h);
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
      player.x=11100; player.y=532;
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
      player.x=11100; player.y=532;
      player.spawnX=player.x; player.spawnY=player.y;
      player.vx=0; player.vy=0; player.grounded=true;
    }
  },50);

  frame();
})();