/* ============================================================
   LOCAL SAVE GAME
   ============================================================ */

const SAVE_KEY="survival-skies-save-v1";

function readSave(){

  try{

    const raw=localStorage.getItem(
      SAVE_KEY
    );

    if(!raw)return null;

    const data=JSON.parse(raw);

    return data?.version===1
      ? data
      : null;

  }
  catch(error){

    return null;

  }

}


function hasSavedGame(){

  return readSave()!==null;

}


function saveGame(){

  if(!gameStarted)return;

  try{

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({

        version:1,

        stage,
        scrap,
        components,

        tunnelMode,
        tunnelEscaped,
        leaderHasBeenTold,
        survivorsFollowing,

        player:{
          x:player.x,
          y:player.y,
          spawnX:player.spawnX,
          spawnY:player.spawnY,
          stamina:player.stamina,
          facing:player.facing
        },

        items:
          items.map(
            item=>item.collected
          ),

        scraps:
          scraps.map(
            scrap=>scrap.collected
          ),

        objects:
          objects.map(
            object=>object.active
          )

      })
    );

  }
  catch(error){

    /* Saving is optional if browser storage is unavailable. */

  }

}


function loadGame(){

  const data=readSave();

  if(!data)return false;

  stage=data.stage;
  scrap=data.scrap;
  components=data.components;

  tunnelMode=Boolean(
    data.tunnelMode
  );

  tunnelEscaped=Boolean(
    data.tunnelEscaped
  );

  leaderHasBeenTold=Boolean(
    data.leaderHasBeenTold
  );

  survivorsFollowing=Boolean(
    data.survivorsFollowing
  );

  const savedPlayer=data.player||{};

  player.x=savedPlayer.x??player.x;
  player.y=savedPlayer.y??player.y;
  player.spawnX=savedPlayer.spawnX??player.spawnX;
  player.spawnY=savedPlayer.spawnY??player.spawnY;
  player.stamina=savedPlayer.stamina??player.stamina;
  player.facing=savedPlayer.facing??player.facing;

  items.forEach(
    (item,index)=>{

      item.collected=Boolean(
        data.items?.[index]
      );

    }
  );

  scraps.forEach(
    (scrap,index)=>{

      scrap.collected=Boolean(
        data.scraps?.[index]
      );

    }
  );

  objects.forEach(
    (object,index)=>{

      if(
        typeof data.objects?.[index]===
        "boolean"
      ){

        object.active=
          data.objects[index];

      }

    }
  );

  signalEl.style.width=
    (components/3*100)+"%";

  if(survivorsFollowing){

    resetSurvivorFollowers();

  }

  return true;

}


addEventListener(
  "beforeunload",
  saveGame
);


let autosaveElapsed=0;

function autosaveGame(delta){

  autosaveElapsed+=delta;

  if(autosaveElapsed<5000)return;

  autosaveElapsed=0;

  saveGame();

}
