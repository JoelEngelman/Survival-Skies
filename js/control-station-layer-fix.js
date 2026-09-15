/* ============================================================
   CONTROL STATION — 3D TRANSITION
   The brief blank state is now an intentional handoff from the
   2D tutorial into the actual 3D Control Station.
   ============================================================ */
(function(){
  let popup=null;
  let started=false;

  function makePopup(){
    if(popup)return;

    popup=document.createElement("div");
    popup.id="control-station-3d-transition";
    popup.innerHTML=`
      <div class="control-3d-card">
        <div class="control-3d-tag">TUTORIAL COMPLETE</div>
        <h1>Welcome to the Control Station</h1>
        <p>The tutorial is finished. From here on, the expedition enters full 3D.</p>
        <div class="control-3d-prompt">PRESS <b>SPACE</b> TO START</div>
      </div>
    `;

    const style=document.createElement("style");
    style.textContent=`
      #control-station-3d-transition{
        position:fixed;
        inset:0;
        z-index:100;
        display:grid;
        place-items:center;
        background:rgba(2,8,11,.78);
        backdrop-filter:blur(8px);
      }
      .control-3d-card{
        width:min(620px,calc(100vw - 32px));
        padding:38px;
        border:1px solid rgba(205,239,220,.2);
        border-radius:22px;
        background:linear-gradient(145deg,rgba(18,37,43,.97),rgba(5,13,16,.97));
        box-shadow:0 30px 100px rgba(0,0,0,.55);
        text-align:center;
      }
      .control-3d-tag{
        color:#aee9bb;
        font-size:10px;
        font-weight:900;
        letter-spacing:.18em;
      }
      .control-3d-card h1{
        margin:12px 0 14px;
        font-size:clamp(30px,5vw,52px);
        line-height:1;
      }
      .control-3d-card p{
        margin:0 auto;
        max-width:480px;
        color:#afc0ba;
        line-height:1.6;
      }
      .control-3d-prompt{
        margin-top:24px;
        color:#d9f3df;
        font-size:12px;
        letter-spacing:.14em;
      }
      .control-3d-prompt b{font-weight:900}
    `;
    document.head.appendChild(style);
    document.body.appendChild(popup);
  }

  function setLayers(isStarted){
    const game=document.getElementById("game");
    const room=document.getElementById("webgl-hybrid");
    if(!game||!room)return;

    game.style.visibility="visible";
    game.style.zIndex="1";

    /* Before Space, the dark handoff screen intentionally sits over
       the unfinished 3D scene. After Space, 3D becomes the main layer. */
    room.style.zIndex=isStarted?"60":"0";
  }

  function start3D(){
    if(started)return;
    started=true;
    window.controlStation3DStarted=true;

    if(popup)popup.remove();
    popup=null;

    const room=document.getElementById("webgl-hybrid");
    if(room)room.style.zIndex="60";

    /* The transition key should not also become a jump. */
    if(typeof keys!=="undefined")keys[" "]=false;
  }

  function keydown(e){
    if(!window.controlStationRoomActive || started)return;
    if(e.key!==" ")return;

    e.preventDefault();
    e.stopPropagation();
    start3D();
  }

  document.addEventListener("keydown",keydown,true);

  const timer=setInterval(()=>{
    if(!window.controlStationRoomActive)return;

    if(!started && typeof stage!=="undefined" && stage>=18){
      makePopup();
      setLayers(false);

      /* Keep movement keys from leaking through the transition. */
      if(typeof keys!=="undefined"){
        keys.w=false; keys.a=false; keys.s=false; keys.d=false;
        keys.arrowup=false; keys.arrowdown=false;
        keys.arrowleft=false; keys.arrowright=false;
        keys[" "]=false;
      }
    }else if(started){
      setLayers(true);
    }
  },25);
})();
