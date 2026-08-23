/* ============================================================
   BACKGROUND
   ============================================================ */

function drawBackground(){

  if(tunnelMode){

    drawTunnelBackground();

    return;

  }


  const g=ctx.createLinearGradient(
    0,
    0,
    0,
    H
  );

  g.addColorStop(
    0,
    "#07111e"
  );

  g.addColorStop(
    .45,
    "#21464d"
  );

  g.addColorStop(
    1,
    "#08131a"
  );

  ctx.fillStyle=g;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  ctx.save();

  const far=camX*.12;


  for(
    let i=-10;
    i<50;
    i++
  ){

    const x=i*230-far;

    const h=
      180+
      (Math.abs(i)%7)*42;

    ctx.fillStyle=
      i%2
        ? "rgba(20,42,48,.55)"
        : "rgba(25,51,56,.7)";

    ctx.fillRect(
      x,
      H-h,
      180,
      h
    );


    for(
      let y=H-h+30;
      y<H-20;
      y+=42
    ){

      ctx.fillStyle=
        "rgba(180,230,210,.08)";

      ctx.fillRect(
        x+18,
        y,
        30,
        5
      );

      ctx.fillRect(
        x+65,
        y,
        30,
        5
      );

      ctx.fillRect(
        x+112,
        y,
        30,
        5
      );

    }

  }


  for(
    let i=-8;
    i<40;
    i++
  ){

    const x=
      i*420-
      camX*.22;

    const y=
      120+
      (Math.abs(i)%4)*70;

    ctx.fillStyle=
      "rgba(130,175,175,.09)";

    ctx.fillRect(
      x,
      y,
      260,
      12
    );

    ctx.fillRect(
      x+40,
      y+12,
      170,
      40
    );

  }


  ctx.restore();

}
