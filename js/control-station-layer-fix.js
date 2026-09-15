/* ============================================================
   CONTROL STATION LAYER FIX
   The room itself is rendered by WebGL. Keep the normal 2D game
   canvas underneath it, but hidden while the room is active so it
   cannot paint over the room.
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
        game.style.visibility="hidden";
        room.style.zIndex="60";
      }else{
        game.style.visibility="visible";
        room.style.zIndex="2";
      }
    };

    window.hybridSetRoomMode._controlStationLayerFix=true;
    clearInterval(timer);
  },25);
})();
