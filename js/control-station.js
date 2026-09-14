/* ============================================================
   CONTROL STATION — CHAPTER TWO EXPLORATION
   ADDITIVE CONTENT ONLY
   ============================================================ */

/* New underground platforms. Existing platforms are untouched. */
[
  {x:8750,y:520,w:500,h:150},
  {x:9300,y:450,w:320,h:220},
  {x:9720,y:520,w:480,h:150},
  {x:10250,y:420,w:620,h:250},
  {x:10920,y:500,w:430,h:170},
  {x:11400,y:450,w:700,h:220},
  {x:12150,y:520,w:520,h:150}
].forEach(p=>tunnelPlatforms.push(p));

/* New grapple points for the new area. */
[
  [8800,300],
  [9250,260],
  [9700,300],
  [10200,240],
  [10850,280],
  [11350,250],
  [12050,300],
  [12600,280]
].forEach(p=>{
  tunnelAnchors.push({x:p[0],y:p[1]});
});


/* ============================================================
   ENTER THE NEW AREA
   ============================================================ */

let controlStationEntered=false;

function enterControlStation(){

  if(controlStationEntered)return;

  /* Stage 17 is the existing post-coordinate descent stage. */
  if(stage!==17 || cutsceneActive)return;

  controlStationEntered=true;

  tunnelMode=true;

  player.x=8780;
  player.y=520-player.h;

  player.spawnX=8780;
  player.spawnY=520-player.h;

  player.vx=0;
  player.vy=0;
  player.grounded=true;
  player.grapple=null;

  camX=8380;
  camY=0;

  objectiveTitle.textContent="EXPLORE THE CONTROL STATION";
  objectiveText.textContent="The coordinates led to a sealed facility beneath Sector 07. Find out what is still running inside.";

  say(
    "MARA",
    "This is it... the control station."
  );

}

/* The existing descent cutscene already ends at stage 17.
   Watching that existing state lets this new area attach to it
   without replacing or modifying the original cutscene. */

const controlStationWatcher=setInterval(()=>{

  if(!controlStationEntered && stage===17 && !cutsceneActive){
    enterControlStation();
  }

},100);


/* ============================================================
   CONTROL STATION VISUALS
   ============================================================ */

const originalDrawTunnelWorld=drawTunnelWorld;

drawTunnelWorld=function(){

  originalDrawTunnelWorld();

  if(!controlStationEntered)return;

  /* Large control-station walls */
  ctx.fillStyle="#071114";
  ctx.fillRect(8950,120,420,300);
  ctx.fillRect(9800,90,360,330);
  ctx.fillRect(10400,130,520,290);
  ctx.fillRect(11500,100,500,320);
  ctx.fillRect(12200,130,360,290);

  /* Structural frames */
  ctx.strokeStyle="rgba(130,175,165,.16)";
  ctx.lineWidth=8;

  [8950,9370,9800,10160,10400,10920,11500,12000,12200,12560]
    .forEach(x=>{
      ctx.strokeRect(x,120,4,300);
    });

  /* Glowing control panels */
  const panels=[
    [9010,185,260,90],
    [9870,160,210,110],
    [10500,190,300,95],
    [11600,160,280,110],
    [12260,190,230,90]
  ];

  panels.forEach(([x,y,w,h],i)=>{

    ctx.fillStyle="#0c2024";
    ctx.fillRect(x,y,w,h);

    ctx.strokeStyle="rgba(185,239,200,.2)";
    ctx.lineWidth=2;
    ctx.strokeRect(x,y,w,h);

    for(let j=0;j<5;j++){
      ctx.fillStyle=
        j===i%5
          ? "rgba(185,239,200,.65)"
          : "rgba(185,239,200,.12)";

      ctx.fillRect(
        x+18+j*((w-50)/5),
        y+20,
        22,
        6
      );
    }

    ctx.fillStyle="rgba(185,239,200,.18)";
    ctx.fillRect(x+20,y+h-25,w-40,5);

  });

  /* Central station core */
  ctx.fillStyle="#10282c";
  ctx.fillRect(10600,330,190,190);

  ctx.strokeStyle="rgba(185,239,200,.35)";
  ctx.lineWidth=3;
  ctx.strokeRect(10600,330,190,190);

  ctx.fillStyle="#b9efc8";
  ctx.shadowBlur=25;
  ctx.shadowColor="#b9efc8";

  ctx.beginPath();
  ctx.arc(10695,425,32+Math.sin(Date.now()/220)*3,0,Math.PI*2);
  ctx.fill();

  ctx.shadowBlur=0;

  /* Warning strips */
  for(let x=11600;x<11900;x+=55){
    ctx.fillStyle="rgba(220,190,90,.22)";
    ctx.fillRect(x,300,30,8);
  }

  /* Station signage */
  ctx.fillStyle="rgba(185,239,200,.55)";
  ctx.font="900 18px monospace";
  ctx.fillText("SECTOR 07 // CONTROL",9000,155);
  ctx.fillText("STABILISER NETWORK",11600,145);

};


/* ============================================================
   CONTROL STATION — MOVABLE BRICK CHALLENGE
   ============================================================ */

/* These are intentionally ordinary heavy blocks: Mara can push them,
   pick them up with E, carry them, and drop them to build a route. */

const controlBricks=[
  {x:9000,y:460,w:82,h:60,held:false,vx:0,vy:0},
  {x:9200,y:460,w:82,h:60,held:false,vx:0,vy:0},
  {x:9400,y:460,w:82,h:60,held:false,vx:0,vy:0},
  {x:9600,y:460,w:82,h:60,held:false,vx:0,vy:0},
  {x:9800,y:460,w:82,h:60,held:false,vx:0,vy:0},
  {x:10000,y:460,w:82,h:60,held:false,vx:0,vy:0}
];

let heldControlBrick=null;

function controlBrickDistance(b){
  return Math.hypot(
    player.x+player.w/2-(b.x+b.w/2),
    player.y+player.h/2-(b.y+b.h/2)
  );
}

function nearestControlBrick(){

  let best=null;
  let distance=110;

  for(const b of controlBricks){

    const d=controlBrickDistance(b);

    if(d<distance){
      distance=d;
      best=b;
    }

  }

  return best;
}

function dropControlBrick(){

  if(!heldControlBrick)return;

  const b=heldControlBrick;
  const direction=player.facing||1;

  b.held=false;
  b.x=player.x+player.w/2-b.w/2+direction*55;
  b.y=player.y+player.h-b.h;
  b.vx=player.vx*0.25;
  b.vy=0;

  heldControlBrick=null;

  say("MARA","That should hold.",1200);
}

function controlBrickAction(){

  if(heldControlBrick){
    dropControlBrick();
    return true;
  }

  const b=nearestControlBrick();

  if(!b)return false;

  b.held=true;
  b.vx=0;
  b.vy=0;
  heldControlBrick=b;

  say("MARA","Heavy... but I can move it.",1200);

  return true;
}

/* Preserve the existing E interaction system and only intercept E when
   Mara is actually next to one of the new bricks. */
const originalAction=action;

action=function(){

  if(
    controlStationEntered &&
    stage===17 &&
    controlBrickAction()
  ){
    return;
  }

  originalAction();
};


/* ============================================================
   BRICK PHYSICS
   ============================================================ */

function controlBrickSupportY(b){

  let support=700;

  for(const p of tunnelPlatforms){

    if(
      b.x+b.w>p.x &&
      b.x<p.x+p.w &&
      p.y>=b.y+b.h-4 &&
      p.y<support
    ){
      support=p.y;
    }

  }

  for(const other of controlBricks){

    if(other===b || other.held)continue;

    if(
      b.x+b.w>other.x+5 &&
      b.x<other.x+other.w-5 &&
      other.y>=b.y+b.h-4 &&
      other.y<support
    ){
      support=other.y;
    }

  }

  return support;
}

function updateControlBricks(){

  if(!controlStationEntered)return;

  if(heldControlBrick){

    const b=heldControlBrick;
    const direction=player.facing||1;

    b.x=player.x+player.w/2-b.w/2+direction*45;
    b.y=player.y-12;
    b.vx=0;
    b.vy=0;

  }

  for(const b of controlBricks){

    if(b.held)continue;

    /* Gravity */
    b.vy+=0.55;
    b.vy=Math.min(15,b.vy);
    b.x+=b.vx;
    b.y+=b.vy;
    b.vx*=0.82;

    /* Push the block when Mara walks into its side. */
    if(
      player.x+player.w>b.x &&
      player.x<b.x+b.w &&
      player.y+player.h>b.y+8 &&
      player.y<b.y+b.h
    ){

      const playerCenter=player.x+player.w/2;
      const brickCenter=b.x+b.w/2;

      if(Math.abs(playerCenter-brickCenter)<player.w+b.w/2){
        b.x+=player.vx*0.9;
        b.vx=player.vx*0.55;
      }

    }

    const support=controlBrickSupportY(b);

    if(b.y+b.h>=support && b.vy>=0){
      b.y=support-b.h;
      b.vy=0;
    }

    b.x=Math.max(8750,Math.min(12750-b.w,b.x));
  }

}

/* Wrap the existing movement loop so the brick simulation runs every frame. */
const originalMove=move;

move=function(){

  originalMove();
  updateControlBricks();

};


/* ============================================================
   BRICK RENDERING
   ============================================================ */

const originalDrawTunnelWithBricks=drawTunnelWorld;

drawTunnelWorld=function(){

  originalDrawTunnelWithBricks();

  if(!controlStationEntered)return;

  for(const b of controlBricks){

    ctx.save();

    ctx.fillStyle="#5a5146";
    ctx.fillRect(b.x,b.y,b.w,b.h);

    ctx.fillStyle="#716758";
    ctx.fillRect(b.x,b.y,b.w,6);

    ctx.strokeStyle="rgba(210,195,165,.28)";
    ctx.lineWidth=2;
    ctx.strokeRect(b.x,b.y,b.w,b.h);

    ctx.strokeStyle="rgba(20,25,25,.35)";
    ctx.beginPath();
    ctx.moveTo(b.x+12,b.y+16);
    ctx.lineTo(b.x+b.w-15,b.y+b.h-13);
    ctx.moveTo(b.x+b.w-25,b.y+12);
    ctx.lineTo(b.x+20,b.y+b.h-18);
    ctx.stroke();

    ctx.fillStyle="rgba(185,239,200,.18)";
    ctx.fillRect(b.x+10,b.y+10,12,4);

    ctx.restore();
  }

  /* The inaccessible control system and the route Mara is building toward. */
  ctx.fillStyle="#091719";
  ctx.fillRect(10420,90,430,95);

  ctx.strokeStyle="rgba(185,239,200,.28)";
  ctx.lineWidth=2;
  ctx.strokeRect(10420,90,430,95);

  ctx.fillStyle="rgba(185,239,200,.7)";
  ctx.font="900 16px monospace";
  ctx.fillText("CONTROL SYSTEM // ACCESS",10455,125);
  ctx.fillStyle="rgba(185,239,200,.35)";
  ctx.fillText("MANUAL OVERRIDE",10455,153);

};


/* ============================================================
   CONTROL SYSTEM GOAL
   ============================================================ */

function checkControlSystem(){

  if(!controlStationEntered || stage!==17)return;

  /* The upper terminal can only be reached once Mara has physically
     built a usable staircase from the movable bricks. */
  if(
    player.x>10420 &&
    player.y<210
  ){

    stage=18;

    objectiveTitle.textContent="ACCESS THE CONTROL SYSTEM";
    objectiveText.textContent="The manual override is open. Find out what the station was built to control.";

    say(
      "MARA",
      "I can reach the control system. Let's see what they were hiding."
    );

    saveGame();
  }
}

const originalProgress=progress;

progress=function(){

  originalProgress();
  checkControlSystem();

};
