/* ============================================================
   CONTROL STATION — CHAPTER TWO EXPLORATION
   ADDITIVE CONTENT ONLY
   ============================================================ */

/* Extend the existing underground route with a completely new
   exploration area. Existing tunnel platforms are untouched. */

[
  {x:8750,y:520,w:500,h:150},
  {x:9300,y:450,w:320,h:220},
  {x:9720,y:520,w:480,h:150},
  {x:10250,y:420,w:620,h:250},
  {x:10920,y:500,w:430,h:170},
  {x:11400,y:450,w:700,h:220},
  {x:12150,y:520,w:520,h:150}
].forEach(p=>tunnelPlatforms.push(p));

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
   ENTER THE NEW AREA AFTER THE COORDINATE CUTSCENE
   ============================================================ */

const originalEndDescentCutscene=endDescentCutscene;

endDescentCutscene=function(){

  originalEndDescentCutscene();

  tunnelMode=true;

  stage=17;

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

};


/* ============================================================
   CONTROL STATION VISUALS
   ============================================================ */

const originalDrawTunnelWorld=drawTunnelWorld;

drawTunnelWorld=function(){

  originalDrawTunnelWorld();

  if(stage<17)return;

  /* large control-station walls */
  ctx.fillStyle="#071114";
  ctx.fillRect(8950,120,420,300);
  ctx.fillRect(9800,90,360,330);
  ctx.fillRect(10400,130,520,290);
  ctx.fillRect(11500,100,500,320);
  ctx.fillRect(12200,130,360,290);

  /* structural frames */
  ctx.strokeStyle="rgba(130,175,165,.16)";
  ctx.lineWidth=8;

  [8950,9370,9800,10160,10400,10920,11500,12000,12200,12560]
    .forEach(x=>{
      ctx.strokeRect(x,120,4,300);
    });

  /* glowing control panels */
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

  /* central station core */
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

  /* warning strips */
  for(let x=11600;x<11900;x+=55){
    ctx.fillStyle="rgba(220,190,90,.22)";
    ctx.fillRect(x,300,30,8);
  }

  /* station signage */
  ctx.fillStyle="rgba(185,239,200,.55)";
  ctx.font="900 18px monospace";
  ctx.fillText("SECTOR 07 // CONTROL",9000,155);
  ctx.fillText("STABILISER NETWORK",11600,145);

};
