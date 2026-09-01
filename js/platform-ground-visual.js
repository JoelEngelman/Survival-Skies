/* ============================================================
   PLATFORM GROUND VISUAL ONLY
   Extends the existing platform bodies to the bottom of the
   visible world while leaving their top design/pattern untouched.
   No collision, movement, objects, UI, or gameplay values change.
   ============================================================ */

const drawSurfaceWorldWithGround = drawSurfaceWorld;

function drawSurfaceWorld(){

  const originalHeights = platforms.map(p => p.h);
  const groundY = camY + H + 10;

  platforms.forEach(p => {
    p.h = Math.max(p.h, groundY - p.y);
  });

  try {
    drawSurfaceWorldWithGround();
  } finally {
    platforms.forEach((p, i) => {
      p.h = originalHeights[i];
    });
  }
}
