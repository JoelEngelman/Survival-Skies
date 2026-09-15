/* ============================================================
   CONTROL STATION LAYER FIX
   Keep the WebGL room visible without changing the renderer.
   The normal 2D canvas must remain available because Mara and HUD
   are drawn there; only its stacking order is adjusted.
   ============================================================ */
(function(){
  const timer=setInterval(()=>{
    if(typeof window.hybridSetRoomMode!=="function")return;
    if(window.hybridSetRoomMode._controlStationLayerFix)return;

    const original=window.hybridSetRoomMode;
    window.hybridSetRoomMode=function(enabled){
      original(enabled);

      const game=document.getElementById("game");
      const room=document.getElementById("webgl-hybrid");
      if(!game||!room)return;

      if(enabled){
        /* Do not hide #game: the room's normal 2D character/overlay
           rendering still needs it. Put WebGL behind the game canvas. */
        game.style.visibility="visible";
        game.style.zIndex="1";
        room.style.zIndex="0";
      }else{
        game.style.visibility="visible";
        game.style.zIndex="1";
        room.style.zIndex="2";
      }
    };

    window.hybridSetRoomMode._controlStationLayerFix=true;
    clearInterval(timer);
  },25);
})();
