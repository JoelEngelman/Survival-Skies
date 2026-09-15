/* ============================================================
   CONTROL STATION MARA VISIBILITY
   Keep Mara clearly visible even when foreground depth objects are
   being drawn. This is intentionally a small overlay, not a room
   renderer rewrite.
   ============================================================ */
(function(){
  function install(){
    if(typeof draw!=="function")return false;
    if(!draw._controlStationMaraVisibility)return true;
    const originalDraw=draw;
    draw=function(){
      originalDraw();
      if(!window.controlStationRoomActive)return;
      if(typeof player==="undefined"||typeof drawPlayer!=="function")return;

      /* Redraw Mara last so furniture can never hide her completely. */
      ctx.save();
      ctx.shadowColor="rgba(190,255,220,.95)";
      ctx.shadowBlur=9;
      drawPlayer();
      ctx.restore();
    };
    draw._controlStationMaraVisibility=true;
    return true;
  }

  const timer=setInterval(()=>{
    if(install())clearInterval(timer);
  },25);
})();
