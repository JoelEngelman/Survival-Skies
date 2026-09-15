/* ============================================================
   CONTROL STATION MARA VISIBILITY
   Keep Mara clearly visible even when foreground depth objects are
   being drawn. This is intentionally a small overlay, not a room
   renderer rewrite.
   ============================================================ */
(function(){
  function install(){
    if(typeof draw!=="function")return false;
    if(!draw._controlStationMaraVisibility)return false;
    if(draw._controlStationMaraVisibilityFixed)return true;

    const originalDraw=draw;
    draw=function(){
      originalDraw();
      if(!window.controlStationRoomActive)return;
      if(typeof player==="undefined"||typeof drawPlayer!=="function")return;

      /* draw() normally calls drawPlayer while the 2D canvas is translated
         into world coordinates. After draw() returns that transform is gone,
         so restore it here before drawing Mara on top. */
      ctx.save();
      ctx.translate(-camX,-camY);
      ctx.shadowColor="rgba(190,255,220,.95)";
      ctx.shadowBlur=9;
      drawPlayer();
      ctx.restore();
    };
    draw._controlStationMaraVisibilityFixed=true;
    return true;
  }

  const timer=setInterval(()=>{
    if(install())clearInterval(timer);
  },25);
})();
