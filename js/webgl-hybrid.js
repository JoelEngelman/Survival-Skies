/* ============================================================
   HYBRID WEBGL RENDERER
   Keeps the existing 2D canvas as the primary renderer and adds
   a transparent WebGL lighting/shadow layer. Chapter Two also
   uses the same WebGL layer for its top-down control room.
   ============================================================ */

(function(){
  const canvas=document.getElementById("webgl-hybrid");
  if(!canvas)return;

  const gl=canvas.getContext("webgl",{alpha:true,antialias:true});
  if(!gl)return;

  const vertexSource=`
    attribute vec2 a_position;
    attribute vec2 a_uv;
    varying vec2 v_uv;
    void main(){
      v_uv=a_uv;
      gl_Position=vec4(a_position,0.0,1.0);
    }
  `;

  const fragmentSource=`
    precision mediump float;
    varying vec2 v_uv;
    uniform vec4 u_color;
    uniform vec2 u_center;
    uniform float u_radius;
    uniform float u_softness;
    uniform float u_mode;
    uniform vec2 u_size;

    void main(){
      if(u_mode>0.5){
        vec2 p=(v_uv*u_size-u_center)/u_radius;
        float d=length(p);
        float a=1.0-smoothstep(0.35,1.0,d);
        gl_FragColor=vec4(u_color.rgb,u_color.a*a);
        return;
      }
      gl_FragColor=u_color;
    }
  `;

  function compile(type,source){
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))return null;
    return shader;
  }

  const vs=compile(gl.VERTEX_SHADER,vertexSource);
  const fs=compile(gl.FRAGMENT_SHADER,fragmentSource);
  if(!vs||!fs)return;

  const program=gl.createProgram();
  gl.attachShader(program,vs);
  gl.attachShader(program,fs);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  gl.useProgram(program);

  const buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
    -1,-1, 0,0,
     1,-1, 1,0,
    -1, 1, 0,1,
     1, 1, 1,1
  ]),gl.STATIC_DRAW);

  const pos=gl.getAttribLocation(program,"a_position");
  const uv=gl.getAttribLocation(program,"a_uv");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos,2,gl.FLOAT,false,16,0);
  gl.enableVertexAttribArray(uv);
  gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);

  const color=gl.getUniformLocation(program,"u_color");
  const center=gl.getUniformLocation(program,"u_center");
  const radius=gl.getUniformLocation(program,"u_radius");
  const softness=gl.getUniformLocation(program,"u_softness");
  const mode=gl.getUniformLocation(program,"u_mode");
  const size=gl.getUniformLocation(program,"u_size");

  let roomMode=false;
  let roomPlayer={x:0,y:0,w:34,h:34,vx:0,vy:0};
  const keys={};
  const roomWalls=[
    {x:55,y:55,w:890,h:26},
    {x:55,y:585,w:890,h:26},
    {x:55,y:55,w:26,h:556},
    {x:919,y:55,w:26,h:556},
    {x:250,y:180,w:300,h:28},
    {x:250,y:180,w:28,h:210},
    {x:680,y:300,w:185,h:28},
    {x:680,y:300,w:28,h:180}
  ];

  function resize(){
    const dpr=Math.min(2,window.devicePixelRatio||1);
    const w=Math.max(1,window.innerWidth);
    const h=Math.max(1,window.innerHeight);
    canvas.width=Math.floor(w*dpr);
    canvas.height=Math.floor(h*dpr);
    canvas.style.width=w+"px";
    canvas.style.height=h+"px";
    gl.viewport(0,0,canvas.width,canvas.height);
  }
  window.addEventListener("resize",resize);
  resize();

  window.hybridSetRoomMode=function(enabled){
    roomMode=!!enabled;
    canvas.classList.toggle("room-mode",roomMode);
    const gameCanvas=document.getElementById("game");
    if(gameCanvas)gameCanvas.style.visibility=roomMode?"hidden":"visible";
    if(roomMode){
      roomPlayer={x:150,y:500,w:34,h:34,vx:0,vy:0};
    }
  };

  window.hybridGetRoomPlayer=function(){return roomPlayer;};

  window.addEventListener("keydown",e=>{
    keys[e.key.toLowerCase()]=true;
    if(roomMode && ["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase()))e.preventDefault();
  });
  window.addEventListener("keyup",e=>{keys[e.key.toLowerCase()]=false;});

  function hitWall(nx,ny){
    for(const w of roomWalls){
      if(nx+roomPlayer.w>w.x&&nx<w.x+w.w&&ny+roomPlayer.h>w.y&&ny<w.y+w.h)return true;
    }
    return false;
  }

  function updateRoom(){
    let x=0,y=0;
    if(keys.a||keys.arrowleft)x-=1;
    if(keys.d||keys.arrowright)x+=1;
    if(keys.w||keys.arrowup)y-=1;
    if(keys.s||keys.arrowdown)y+=1;
    const length=Math.hypot(x,y)||1;
    const speed=4.2;
    roomPlayer.vx=(x/length)*speed;
    roomPlayer.vy=(y/length)*speed;
    if(!x&&!y){roomPlayer.vx=0;roomPlayer.vy=0;}
    const nx=roomPlayer.x+roomPlayer.vx;
    const ny=roomPlayer.y+roomPlayer.vy;
    if(!hitWall(nx,roomPlayer.y))roomPlayer.x=nx;
    if(!hitWall(roomPlayer.x,ny))roomPlayer.y=ny;
    roomPlayer.x=Math.max(82,Math.min(885-roomPlayer.w,roomPlayer.x));
    roomPlayer.y=Math.max(82,Math.min(574-roomPlayer.h,roomPlayer.y));
  }

  function rect(x,y,w,h,c,a=1){
    const W=canvas.width,H=canvas.height;
    const x0=x/W*2-1,x1=(x+w)/W*2-1;
    const y0=1-y/H*2,y1=1-(y+h)/H*2;
    const data=new Float32Array([x0,y1,0,0,x1,y1,1,0,x0,y0,0,1,x1,y0,1,1]);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,data,gl.STREAM_DRAW);
    gl.vertexAttribPointer(pos,2,gl.FLOAT,false,16,0);
    gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);
    gl.uniform1f(mode,0);
    gl.uniform4f(color,c[0],c[1],c[2],a);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }

  function shadow(x,y,r,a){
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,0,0,1,-1,1,0,-1,1,0,1,1,1,1,1]),gl.STREAM_DRAW);
    gl.vertexAttribPointer(pos,2,gl.FLOAT,false,16,0);
    gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);
    gl.uniform1f(mode,1);
    gl.uniform2f(center,x,y);
    gl.uniform1f(radius,r);
    gl.uniform1f(softness,1);
    gl.uniform2f(size,canvas.width,canvas.height);
    gl.uniform4f(color,0,0,0,a);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }

  function drawRoom(){
    const W=canvas.width,H=canvas.height;
    gl.clearColor(.015,.035,.04,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    /* Same muted Survival Skies palette, now rendered as a top-down room. */
    rect(0,0,W,H,[.018,.043,.048],1);
    rect(55,55,890,556,[.055,.105,.11],1);
    rect(82,82,837,503,[.075,.14,.145],1);

    /* Floor panels. */
    for(let x=90;x<915;x+=70)rect(x,90,2,490,[.18,.28,.28],.12);
    for(let y=90;y<580;y+=70)rect(90,y,825,2,[.18,.28,.28],.12);

    /* Walls and industrial structures. */
    for(const w of roomWalls)rect(w.x,w.y,w.w,w.h,[.12,.19,.20],1);
    rect(120,120,95,95,[.07,.13,.14],1);
    rect(130,130,75,75,[.13,.24,.24],1);
    rect(590,105,250,100,[.07,.13,.14],1);
    rect(610,125,210,10,[.72,.94,.78],.5);
    rect(610,150,145,6,[.72,.94,.78],.25);
    rect(610,170,185,6,[.72,.94,.78],.18);
    rect(310,235,210,100,[.11,.17,.18],1);
    rect(325,250,180,70,[.15,.24,.24],1);
    rect(715,390,120,70,[.10,.16,.17],1);
    rect(730,405,90,8,[.72,.94,.78],.35);
    rect(730,430,60,6,[.72,.94,.78],.2);

    /* Soft WebGL shadows. */
    shadow(382,300,150,.28);
    shadow(770,430,100,.22);
    shadow(170,170,75,.18);
    shadow(roomPlayer.x+roomPlayer.w/2+12,roomPlayer.y+roomPlayer.h/2+18,55,.45);

    /* Mara from above. */
    rect(roomPlayer.x,roomPlayer.y,roomPlayer.w,roomPlayer.h,[.06,.11,.12],1);
    shadow(roomPlayer.x+roomPlayer.w/2,roomPlayer.y+roomPlayer.h+8,38,.35);
    rect(roomPlayer.x+7,roomPlayer.y+6,20,8,[.72,.94,.78],.7);

    /* Exit/door zone. */
    rect(440,560,130,25,[.03,.07,.08],1);
    rect(455,562,100,5,[.72,.94,.78],.55);

    gl.uniform1f(mode,0);
  }

  function drawShadowLayer(){
    const W=canvas.width,H=canvas.height;
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if(roomMode){drawRoom();return;}
    if(typeof player==="undefined")return;
    const sx=(player.x+player.w/2-camX)*window.devicePixelRatio;
    const sy=(player.y+player.h-camY+6)*window.devicePixelRatio;
    shadow(sx,sy,46,.32);
  }

  function frame(){
    if(roomMode)updateRoom();
    drawShadowLayer();
    requestAnimationFrame(frame);
  }
  frame();
})();
