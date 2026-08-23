/* ============================================================
   SURVIVAL SKIES
   STORY BUILD
   ============================================================ */

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

let W=innerWidth;
let H=innerHeight;
let DPR=Math.min(devicePixelRatio||1,2);

function resize(){

  W=innerWidth;
  H=innerHeight;

  DPR=Math.min(devicePixelRatio||1,2);

  canvas.width=W*DPR;
  canvas.height=H*DPR;

  canvas.style.width=W+"px";
  canvas.style.height=H+"px";

  ctx.setTransform(DPR,0,0,DPR,0,0);
}

addEventListener("resize",resize);

resize();


/* ============================================================
   HUD
   ============================================================ */

const staminaEl=document.getElementById("stamina");
const signalEl=document.getElementById("signal");
const scrapEl=document.getElementById("scrap");
const componentsEl=document.getElementById("components");

const objectiveTitle=document.getElementById("objectiveTitle");
const objectiveText=document.getElementById("objectiveText");

const prompt=document.getElementById("prompt");

const dialogue=document.getElementById("dialogue");
const speaker=document.getElementById("speaker");
const dialogueText=document.getElementById("dialogueText");

const cutscene=document.getElementById("cutscene");
const cutSpeaker=document.getElementById("cutSpeaker");
const cutText=document.getElementById("cutText");


/* ============================================================
   INPUT
   ============================================================ */

const keys={};

let jumpPressed=false;
let ePressed=false;

addEventListener("keydown",e=>{

  const k=e.key.toLowerCase();

  keys[k]=true;

  if(
    [" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k)
  ){
    e.preventDefault();
  }

  if(k==="r" && gameStarted){
    respawn();
  }

  if(
    cutsceneActive &&
    (k==="enter" || k==="e")
  ){
    e.preventDefault();
    advanceCutscene();
  }

});

addEventListener("keyup",e=>{

  keys[e.key.toLowerCase()]=false;

});


/* ============================================================
   GAME STATE
   ============================================================ */

let gameStarted=false;

let cutsceneActive=false;

let cutLines=[];
let cutIndex=0;
let cutTimer=null;
let cutMode="";

let camX=0;
let camY=0;

let scrap=0;
let components=0;

let stage=0;

let interactionLock=0;

let particles=[];
let rain=[];

let worldTime=0;

let tunnelMode=false;
let tunnelEscaped=false;
let survivorsFollowing=false;

let leaderHasBeenTold=false;
