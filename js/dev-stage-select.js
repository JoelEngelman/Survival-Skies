const devStages=[
  [0,"Opening — Communications Shelter"],[1,"Shelter — First Component"],[2,"Broken Road — Find the Radio"],[3,"Radio Room — Second Component"],[4,"Storm Route — Find the Power Core"],[5,"Transmitter Tower — Restore the Signal"],[6,"Settlement Approach"],[7,"Settlement — Meet the Leader"],[8,"Settlement — Find the Transit System"],[9,"Transit Gate — Enter the Underground"],[10,"Tunnel — Find a Way Through"],[11,"Tunnel — Find the Survivors"],[12,"Tunnel — Find Another Route Out"],[13,"Maintenance Lift — Escape"],[14,"Settlement — Return With Survivors"],[15,"Archive Relay — Find the Coordinates"],[16,"Transit Gate — Use the Coordinates"],[17,"Control Station — Chapter Two"]
];

function devResetWorldToStage(targetStage){
  localStorage.removeItem(SAVE_KEY);
  stage=targetStage; scrap=0; components=0;
  tunnelMode=false; tunnelEscaped=false; leaderHasBeenTold=false; survivorsFollowing=false;
  if(typeof controlStationEntered!=="undefined") controlStationEntered=false;
  tunnelProgress.trapped=false; tunnelProgress.foundPeople=false; progress.warned=false;
  items.forEach(item=>item.collected=false); scraps.forEach(item=>item.collected=false); objects.forEach(object=>object.active=false);
  player.vx=0; player.vy=0; player.stamina=100; player.facing=1; player.grounded=true; player.jumps=0; player.grapple=null;

  const surface={0:[1000,520],1:[1200,390],2:[1400,520],3:[1650,520],4:[2350,520],5:[3400,500],6:[4100,470],7:[4400,470],8:[5600,520],9:[6200,520],14:[10750,510],15:[11600,500],16:[6100,520]};
  const tunnel={10:[300,570],11:[3000,520],12:[5000,520],13:[6500,510],17:[8780,520]};
  const pos=(targetStage>=10&&targetStage<=13||targetStage===17)?tunnel[targetStage]:surface[targetStage]||surface[0];
  tunnelMode=(targetStage>=10&&targetStage<=13)||targetStage===17;
  player.x=pos[0]; player.y=pos[1]-player.h; player.spawnX=player.x; player.spawnY=player.y;

  if(targetStage>=1) items[0].collected=true;
  if(targetStage>=3) items[1].collected=true;
  if(targetStage>=5) items[2].collected=true;
  components=targetStage>=5?3:targetStage>=3?2:targetStage>=1?1:0;

  if(targetStage>=3) objects.find(o=>o.type==="radio").active=true;
  if(targetStage>=5) objects.find(o=>o.type==="tower").active=true;
  if(targetStage>=6) objects.find(o=>o.type==="settlement").active=true;
  if(targetStage>=8) objects.find(o=>o.type==="transit").active=true;
  if(targetStage>=10) objects.find(o=>o.type==="cave").active=true;
  if(targetStage>=11) objects.find(o=>o.type==="survivors").active=true;
  if(targetStage>=12) survivorsFollowing=true;
  if(targetStage>=14){ tunnelEscaped=true; survivorsFollowing=true; objects.find(o=>o.type==="settlement").active=true; }
  if(targetStage===15) objects.find(o=>o.type==="return").active=true;
  if(targetStage>=16){ leaderHasBeenTold=true; objects.find(o=>o.type==="transit").active=true; }
  if(targetStage===17) objects.find(o=>o.type==="return").active=false;

  if(survivorsFollowing) resetSurvivorFollowers();
  camX=Math.max(0,player.x-350); camY=0;
  signalEl.style.width=(components/3*100)+"%";
  cutsceneActive=false; cutscene.classList.remove("show","tunnelScene");
  gameStarted=true; document.getElementById("intro").classList.add("hidden");
  objective();
  say("DEV MODE","Teleported to stage "+targetStage+". The world is set up as if you reached it normally.",2600);
  saveGame();
}

const devButton=document.createElement("button");
devButton.id="devStageButton"; devButton.textContent="RESTART / DEV MODE"; devButton.type="button";
devButton.style.cssText="margin-top:10px;padding:11px 17px;border:1px solid rgba(185,239,200,.22);border-radius:10px;background:rgba(185,239,200,.08);color:#b9efc8;font:900 11px Inter,system-ui,sans-serif;letter-spacing:.08em;cursor:pointer";
startButton.parentElement.appendChild(devButton);

const devScreen=document.createElement("div");
devScreen.id="devStageScreen"; devScreen.className="screen hidden"; devScreen.style.zIndex="70";
devScreen.innerHTML=`<div class="story" style="max-height:88vh;overflow:auto"><div class="tag">SURVIVAL SKIES · DEVELOPER TOOLS</div><h1 style="font-size:clamp(36px,6vw,62px)">SELECT<br>STAGE.</h1><p>Choose where to begin. The game will rebuild the world so it behaves as if you reached that stage normally.</p><div id="devStageList" style="display:grid;gap:8px;margin-top:20px"></div><button id="devCancel" type="button">BACK</button></div>`;
document.body.appendChild(devScreen);

const devStageList=document.getElementById("devStageList");
for(const [number,name] of devStages){
  const button=document.createElement("button"); button.type="button"; button.textContent=number+" — "+name;
  button.style.cssText="width:100%;margin:0;text-align:left;padding:12px 14px;border:1px solid rgba(220,240,230,.12);border-radius:10px;background:rgba(255,255,255,.045);color:#d9eee4;font:700 12px Inter,system-ui,sans-serif;cursor:pointer";
  button.onclick=()=>{devScreen.classList.add("hidden");devResetWorldToStage(number)};
  devStageList.appendChild(button);
}
devButton.onclick=()=>devScreen.classList.remove("hidden");
document.getElementById("devCancel").onclick=()=>devScreen.classList.add("hidden");
