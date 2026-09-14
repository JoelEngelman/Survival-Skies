/* CAMERA FIX FOR CONTROL STATION
   The tunnel camera used to stop at x=8500, which is before the
   new control-station area. Keep the existing tunnel camera limit
   everywhere else, but allow the camera to reach the new area. */

/* The original rendering code remains unchanged below. */

function draw(){

  ctx.clearRect(0,0,W,H);
  drawBackground();

  ctx.save();
  ctx.translate(-camX,-camY);

  if(tunnelMode){
    drawTunnelWorld();
  }
  else{
    drawSurfaceWorld();
  }

  ctx.restore();

  const v=ctx.createRadialGradient(
    W/2,H/2,100,
    W/2,H/2,Math.max(W,H)*.7
  );

  v.addColorStop(0,"transparent");
  v.addColorStop(1,"rgba(0,0,0,.45)");

  ctx.fillStyle=v;
  ctx.fillRect(0,0,W,H);
  drawRain();
}

/* This replaces the old tunnel camera clamp while leaving the
   surface clamp and all gameplay mechanics alone. */
const originalUpdateForCameraFix=update;
update=function(){
  originalUpdateForCameraFix();

  if(!gameStarted || !tunnelMode || !controlStationEntered)return;

  /* The control station occupies x=9000–13200. */
  camX=Math.max(
    -100,
    Math.min(
      13200,
      camX
    )
  );
};
