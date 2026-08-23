/* ============================================================
   TUNNEL BACKGROUND
   ============================================================ */

function drawTunnelBackground(){

  const g=ctx.createLinearGradient(
    0,
    0,
    0,
    H
  );

  g.addColorStop(
    0,
    "#020609"
  );

  g.addColorStop(
    .45,
    "#0b171a"
  );

  g.addColorStop(
    1,
    "#03080a"
  );

  ctx.fillStyle=g;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* distant tunnel walls */

  ctx.save();

  const offset=camX*.25;


  for(
    let i=-2;
    i<30;
    i++
  ){

    const x=i*420-offset;

    ctx.fillStyle=
      "rgba(25,43,46,.4)";

    ctx.fillRect(
      x,
      80,
      340,
      360
    );


    ctx.strokeStyle=
      "rgba(90,125,120,.12)";

    ctx.lineWidth=5;

    ctx.strokeRect(
      x,
      80,
      340,
      360
    );


    ctx.fillStyle=
      "rgba(170,225,200,.08)";

    ctx.fillRect(
      x+40,
      150,
      160,
      4
    );

    ctx.fillRect(
      x+40,
      170,
      100,
      4
    );

  }

  ctx.restore();


  /* ceiling */

  ctx.fillStyle=
    "rgba(0,0,0,.55)";

  ctx.fillRect(
    0,
    0,
    W,
    90
  );


  /* dust particles */

  for(
    let i=0;
    i<70;
    i++
  ){

    const x=
      ((i*173-worldTime*.015)%W+W)%W;

    const y=
      90+
      ((i*71)%Math.max(1,H-150));

    ctx.fillStyle=
      "rgba(190,220,210,.08)";

    ctx.fillRect(
      x,
      y,
      2,
      2
    );

  }

}


/* ============================================================
   RAIN
   ============================================================ */

function drawRain(){

  if(tunnelMode)return;

  ctx.save();

  ctx.strokeStyle=
    "rgba(190,225,220,.17)";

  ctx.lineWidth=1;


  for(const r of rain){

    ctx.beginPath();

    ctx.moveTo(
      r.x,
      r.y
    );

    ctx.lineTo(
      r.x+r.drift,
      r.y+r.length
    );

    ctx.stroke();


    r.y+=r.speed;
    r.x+=r.drift;


    if(r.y>H+30){

      r.y=-30;
      r.x=Math.random()*W;

    }


    if(r.x<-20)
      r.x=W+20;

    if(r.x>W+20)
      r.x=-20;

  }

  ctx.restore();

}


/* ============================================================
   PLAYER SHADOW
   ============================================================ */

function drawPlayerShadow(){

  const centerX=
    player.x+
    player.w/2;

  let groundY=700;

  const list=
    tunnelMode
      ? tunnelPlatforms
      : platforms;


  for(const p of list){

    if(

      centerX>=p.x &&

      centerX<=p.x+p.w &&

      p.y>=
        player.y+
        player.h-
        2

    ){

      if(p.y<groundY)
        groundY=p.y;

    }

  }


  const height=
    Math.max(
      0,
      groundY-
      (player.y+player.h)
    );


  const scale=
    Math.max(
      .18,
      1-height/330
    );


  ctx.save();

  ctx.globalAlpha=
    .25*scale;

  ctx.fillStyle="#000";


  ctx.beginPath();

  ctx.ellipse(
    centerX,
    groundY+3,
    22*scale,
    5*scale,
    0,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.restore();

}


/* ============================================================
   WORLD DRAW
   ============================================================ */

function draw(){

  ctx.clearRect(
    0,
    0,
    W,
    H
  );


  drawBackground();


  ctx.save();

  ctx.translate(
    -camX,
    -camY
  );


  if(tunnelMode){

    drawTunnelWorld();

  }
  else{

    drawSurfaceWorld();

  }


  ctx.restore();


  /* VIGNETTE */

  const v=
    ctx.createRadialGradient(
      W/2,
      H/2,
      100,
      W/2,
      H/2,
      Math.max(W,H)*.7
    );

  v.addColorStop(
    0,
    "transparent"
  );

  v.addColorStop(
    1,
    "rgba(0,0,0,.45)"
  );

  ctx.fillStyle=v;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  drawRain();

}


/* ============================================================
   SURFACE WORLD
   ============================================================ */

function drawSurfaceWorld(){

  /* FOG */

  for(
    let i=-5;
    i<50;
    i++
  ){

    const x=i*350;

    ctx.fillStyle=
      "rgba(180,220,210,.025)";

    ctx.fillRect(
      x,
      -300,
      230,
      1100
    );

  }


  /* PLATFORMS */

  platforms.forEach((p,i)=>{

    ctx.fillStyle=
      i>=10
        ? "#263b40"
        : "#293d42";

    ctx.fillRect(
      p.x,
      p.y,
      p.w,
      p.h
    );


    ctx.fillStyle="#60736d";

    ctx.fillRect(
      p.x,
      p.y,
      p.w,
      5
    );


    for(
      let x=p.x+35;
      x<p.x+p.w-20;
      x+=95
    ){

      ctx.fillStyle=
        "rgba(8,18,22,.55)";

      ctx.fillRect(
        x,
        p.y+18,
        45,
        5
      );

      ctx.fillStyle=
        "rgba(160,205,190,.08)";

      ctx.fillRect(
        x+5,
        p.y+30,
        8,
        18
      );

      ctx.fillRect(
        x+20,
        p.y+30,
        8,
        18
      );

    }

  });


  /* CITY */

  if(stage>=6){

    for(
      let x=4000;
      x<6000;
      x+=180
    ){

      const h=
        110+
        (Math.floor(x/180)%4)*35;

      ctx.fillStyle="#15272c";

      ctx.fillRect(
        x,
        500-h,
        145,
        h
      );


      for(
        let y=530-h;
        y<470;
        y+=32
      ){

        ctx.fillStyle=
          "rgba(185,239,200,.12)";

        ctx.fillRect(
          x+18,
          y,
          25,
          7
        );

        ctx.fillRect(
          x+65,
          y,
          25,
          7
        );

      }

    }

  }


  /* ANCHORS */

  anchors.forEach(a=>{

    const pulse=
      9+
      Math.sin(Date.now()/180)*2;

    ctx.strokeStyle=
      player.grapple===a
        ? "rgba(220,255,240,.9)"
        : "rgba(150,240,220,.35)";

    ctx.lineWidth=
      player.grapple===a
        ? 3
        : 1;


    ctx.beginPath();

    ctx.arc(
      a.x,
      a.y,
      pulse,
      0,
      Math.PI*2
    );

    ctx.stroke();


    ctx.fillStyle="#b9efc8";

    ctx.beginPath();

    ctx.arc(
      a.x,
      a.y,
      4,
      0,
      Math.PI*2
    );

    ctx.fill();

  });


  /* SCRAP */

  scraps.forEach(s=>{

    if(s.collected)return;

    ctx.save();

    ctx.translate(
      s.x,
      s.y
    );

    ctx.rotate(
      Math.sin(
        worldTime/300+s.x
      )*.2
    );

    ctx.fillStyle="#e5c76f";

    ctx.shadowBlur=12;
    ctx.shadowColor="#e5c76f";

    ctx.fillRect(
      -6,
      -5,
      12,
      10
    );

    ctx.fillStyle="#fff1a8";

    ctx.fillRect(
      -3,
      -5,
      3,
      10
    );

    ctx.restore();

  });


  /* COMPONENTS */

  items.forEach(it=>{

    if(it.collected)return;

    ctx.fillStyle="#d9f8df";

    ctx.shadowBlur=20;
    ctx.shadowColor="#b9efc8";


    ctx.beginPath();

    ctx.arc(
      it.x,
      it.y,
      9+
        Math.sin(
          Date.now()/150
        )*2,
      0,
      Math.PI*2
    );

    ctx.fill();

    ctx.shadowBlur=0;

  });


  /* TRANSMITTER */

  ctx.fillStyle="#51686a";

  ctx.fillRect(
    3510,
    150,
    16,
    350
  );

  ctx.fillRect(
    3590,
    150,
    16,
    350
  );


  ctx.fillStyle=
    components>=3
      ? "#d9f8df"
      : "#657879";

  ctx.shadowBlur=
    components>=3
      ? 30
      : 5;

  ctx.shadowColor="#b9efc8";


  ctx.beginPath();

  ctx.arc(
    3558,
    125,
    23,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.shadowBlur=0;


  /* SETTLEMENT LIGHTS */

  if(stage>=6){

    for(
      let i=0;
      i<55;
      i++
    ){

      const x=
        4000+
        i*70;

      const y=
        445-
        (i%4)*28;

      ctx.fillStyle=
        "rgba(185,239,200,.7)";

      ctx.shadowBlur=10;
      ctx.shadowColor="#b9efc8";


      ctx.beginPath();

      ctx.arc(
        x,
        y,
        3,
        0,
        Math.PI*2
      );

      ctx.fill();

    }

    ctx.shadowBlur=0;

  }


  /* LEADER */

  if(stage>=7){

    ctx.fillStyle="#111b1d";

    ctx.fillRect(
      4535,
      418,
      30,
      58
    );


    ctx.beginPath();

    ctx.arc(
      4550,
      405,
      16,
      0,
      Math.PI*2
    );

    ctx.fill();


    ctx.fillStyle="#b9efc8";

    ctx.fillRect(
      4558,
      402,
      7,
      3
    );

  }


  /* TRANSIT */

  if(stage>=8){

    /* huge solid entrance */

    ctx.fillStyle="#0b1417";

    ctx.fillRect(
      6030,
      270,
      340,
      250
    );


    ctx.strokeStyle=
      "#6d8580";

    ctx.lineWidth=7;

    ctx.strokeRect(
      6030,
      270,
      340,
      250
    );


    /* doorway */

    ctx.fillStyle="#020708";

    ctx.fillRect(
      6100,
      350,
      200,
      170
    );


    ctx.strokeStyle=
      "rgba(185,239,200,.55)";

    ctx.lineWidth=4;

    ctx.strokeRect(
      6100,
      350,
      200,
      170
    );


    /* sign */

    ctx.fillStyle=
      "rgba(185,239,200,.8)";

    ctx.fillRect(
      6080,
      315,
      240,
      7
    );


    ctx.fillStyle=
      "rgba(185,239,200,.4)";

    ctx.fillRect(
      6130,
      335,
      130,
      4
    );


    /* stairs */

    for(
      let i=0;
      i<7;
      i++
    ){

      ctx.fillStyle=
        "#314346";

      ctx.fillRect(
        6150+i*10,
        500-i*9,
        100-i*20,
        8
      );

    }

  }


  /* SURVIVORS */

  if(
    stage>=11 &&
    !tunnelMode
  ){

    for(
      let i=0;
      i<6;
      i++
    ){

      const x=
        9350+
        i*34;

      const y=
        454-
        (i%2)*5;

      ctx.fillStyle="#111b1d";

      ctx.fillRect(
        x,
        y,
        22,
        42
      );


      ctx.beginPath();

      ctx.arc(
        x+11,
        y-7,
        10,
        0,
        Math.PI*2
      );

      ctx.fill();

    }

  }


  /* RETURN FACILITY */

  if(stage>=14){

    ctx.fillStyle="#17282d";

    ctx.fillRect(
      11680,
      320,
      330,
      180
    );

    ctx.strokeStyle="#78918a";

    ctx.lineWidth=4;

    ctx.strokeRect(
      11680,
      320,
      330,
      180
    );


    ctx.fillStyle=
      "rgba(185,239,200,.18)";

    ctx.fillRect(
      11730,
      370,
      230,
      8
    );

    ctx.fillRect(
      11730,
      400,
      160,
      6
    );

  }


  /* GRAPPLE CABLE */

  if(player.grapple){

    ctx.strokeStyle="#d6eee6";

    ctx.lineWidth=2;

    ctx.beginPath();

    ctx.moveTo(
      player.x+14,
      player.y+20
    );

    ctx.lineTo(
      player.grapple.x,
      player.grapple.y
    );

    ctx.stroke();

  }


  drawPlayer();

  drawParticles();

}


/* ============================================================
   TUNNEL WORLD
   ============================================================ */

function drawTunnelWorld(){

  /* ceiling */

  ctx.fillStyle="#050a0c";

  ctx.fillRect(
    -500,
    0,
    9500,
    100
  );


  /* tunnel walls */

  for(
    let x=-300;
    x<9000;
    x+=280
  ){

    const wobble=
      Math.sin(x*.03)*20;

    ctx.fillStyle=
      "#111e21";

    ctx.beginPath();

    ctx.moveTo(
      x,
      100+wobble
    );

    ctx.lineTo(
      x+240,
      100+wobble
    );

    ctx.lineTo(
      x+270,
      620
    );

    ctx.lineTo(
      x,
      620
    );

    ctx.closePath();

    ctx.fill();


    ctx.strokeStyle=
      "rgba(80,115,110,.2)";

    ctx.lineWidth=3;

    ctx.stroke();


    /* pipes */

    ctx.strokeStyle=
      "rgba(105,145,135,.18)";

    ctx.lineWidth=10;

    ctx.beginPath();

    ctx.moveTo(
      x+60,
      120
    );

    ctx.lineTo(
      x+60,
      500
    );

    ctx.stroke();


    ctx.strokeStyle=
      "rgba(190,230,210,.12)";

    ctx.lineWidth=3;

    ctx.beginPath();

    ctx.moveTo(
      x+100,
      160
    );

    ctx.lineTo(
      x+220,
      160
    );

    ctx.stroke();

  }


  /* platforms */

  tunnelPlatforms.forEach((p,i)=>{

    ctx.fillStyle=
      i%2
        ? "#25373a"
        : "#1d3034";

    ctx.fillRect(
      p.x,
      p.y,
      p.w,
      p.h
    );


    ctx.fillStyle=
      "#566d68";

    ctx.fillRect(
      p.x,
      p.y,
      p.w,
      5
    );


    /* cracks */

    for(
      let x=p.x+40;
      x<p.x+p.w-20;
      x+=100
    ){

      ctx.strokeStyle=
        "rgba(0,0,0,.4)";

      ctx.lineWidth=2;

      ctx.beginPath();

      ctx.moveTo(
        x,
        p.y+12
      );

      ctx.lineTo(
        x+15,
        p.y+30
      );

      ctx.lineTo(
        x-5,
        p.y+50
      );

      ctx.stroke();

    }

  });


  /* old lights */

  for(
    let x=100;
    x<8500;
    x+=210
  ){

    const active=
      Math.sin(
        x*.17+
        worldTime*.004
      )>.15;

    ctx.fillStyle=
      active
        ? "rgba(185,239,200,.6)"
        : "rgba(100,130,125,.15)";

    ctx.shadowBlur=
      active
        ? 18
        : 0;

    ctx.shadowColor=
      "#b9efc8";

    ctx.fillRect(
      x,
      185,
      34,
      6
    );

    ctx.shadowBlur=0;

  }


  /* danger signs */

  for(
    let x=900;
    x<8000;
    x+=700
  ){

    ctx.fillStyle=
      "rgba(180,90,70,.18)";

    ctx.fillRect(
      x,
      250,
      80,
      30
    );

    ctx.fillStyle=
      "rgba(220,130,100,.5)";

    ctx.fillRect(
      x+15,
      262,
      50,
      3
    );

  }


  /* survivor camp */

  if(stage>=11){

    ctx.fillStyle=
      "rgba(120,170,150,.08)";

    ctx.fillRect(
      4850,
      360,
      900,
      210
    );


    /* tents */

    for(
      let i=0;
      i<6;
      i++
    ){

      const x=
        5000+
        i*110;

      ctx.fillStyle="#263b3c";

      ctx.beginPath();

      ctx.moveTo(
        x,
        500
      );

      ctx.lineTo(
        x+50,
        410
      );

      ctx.lineTo(
        x+100,
        500
      );

      ctx.closePath();

      ctx.fill();


      ctx.strokeStyle=
        "rgba(180,220,205,.15)";

      ctx.stroke();

    }


    /* fire */

    ctx.fillStyle=
      "#d9f8df";

    ctx.shadowBlur=30;
    ctx.shadowColor="#b9efc8";

    ctx.beginPath();

    ctx.arc(
      5350,
      470,
      14+
        Math.sin(
          worldTime*.02
        )*4,
      0,
      Math.PI*2
    );

    ctx.fill();

    ctx.shadowBlur=0;

  }


  /* maintenance shaft */

  if(stage>=12){

    ctx.fillStyle=
      "#071012";

    ctx.fillRect(
      7850,
      180,
      260,
      250
    );


    ctx.strokeStyle=
      "#829890";

    ctx.lineWidth=5;

    ctx.strokeRect(
      7850,
      180,
      260,
      250
    );


    for(
      let y=230;
      y<420;
      y+=35
    ){

      ctx.fillStyle=
        "#435a57";

      ctx.fillRect(
        7900,
        y,
        160,
        7
      );

    }


    ctx.fillStyle=
      "#b9efc8";

    ctx.shadowBlur=25;
    ctx.shadowColor="#b9efc8";

    ctx.fillRect(
      7900,
      200,
      160,
      6
    );

    ctx.shadowBlur=0;

  }


  /* exit opening */

  if(stage>=13){

    ctx.fillStyle=
      "#b9efc8";

    ctx.shadowBlur=50;
    ctx.shadowColor="#b9efc8";

    ctx.fillRect(
      8300,
      350,
      450,
      12
    );

    ctx.shadowBlur=0;


    ctx.fillStyle=
      "rgba(185,239,200,.12)";

    ctx.fillRect(
      8300,
      360,
      450,
      310
    );

  }


  /* tunnel anchors */

  tunnelAnchors.forEach(a=>{

    const pulse=
      8+
      Math.sin(
        Date.now()/180
      )*2;

    ctx.strokeStyle=
      player.grapple===a
        ? "rgba(220,255,240,.9)"
        : "rgba(150,240,220,.35)";

    ctx.lineWidth=
      player.grapple===a
        ? 3
        : 1;

    ctx.beginPath();

    ctx.arc(
      a.x,
      a.y,
      pulse,
      0,
      Math.PI*2
    );

    ctx.stroke();


    ctx.fillStyle=
      "#b9efc8";

    ctx.beginPath();

    ctx.arc(
      a.x,
      a.y,
      4,
      0,
      Math.PI*2
    );

    ctx.fill();

  });


  /* cable */

  if(player.grapple){

    ctx.strokeStyle=
      "#d6eee6";

    ctx.lineWidth=2;

    ctx.beginPath();

    ctx.moveTo(
      player.x+14,
      player.y+20
    );

    ctx.lineTo(
      player.grapple.x,
      player.grapple.y
    );

    ctx.stroke();

  }


  drawPlayer();

  drawParticles();

}


/* ============================================================
   PLAYER
   ============================================================ */

function drawPlayer(){

  drawPlayerShadow();


  ctx.save();


  const tilt=
    Math.max(
      -.08,
      Math.min(
        .08,
        player.vx*.012
      )
    );


  ctx.translate(
    player.x+14,
    player.y+24
  );

  ctx.rotate(tilt);


  /* body */

  ctx.fillStyle="#d8e8e0";

  ctx.fillRect(
    -9,
    -8,
    18,
    24
  );


  /* head */

  ctx.fillStyle="#17292e";

  ctx.beginPath();

  ctx.arc(
    0,
    -16,
    11,
    0,
    Math.PI*2
  );

  ctx.fill();


  /* visor */

  ctx.fillStyle="#b9efc8";

  ctx.fillRect(
    player.facing>0
      ? 3
      : -10,
    -18,
    7,
    3
  );


  /* backpack */

  ctx.fillStyle="#31464a";

  ctx.fillRect(
    -14,
    -6,
    5,
    17
  );


  ctx.restore();

}


/* ============================================================
   PARTICLES
   ============================================================ */

function drawParticles(){

  particles.forEach(q=>{

    ctx.globalAlpha=
      Math.max(
        0,
        q.life/40
      );

    ctx.fillStyle=
      q.type==="energy"
        ? "#b9efc8"
        : "#ccd8d3";

    ctx.fillRect(
      q.x,
      q.y,
      4,
      4
    );

  });

  ctx.globalAlpha=1;

}


/* ============================================================
   UPDATE
   ============================================================ */

function update(){

  if(!gameStarted)return;

  worldTime+=16;

  move();

  collectScrap();

  progress();


  const targetX=
    player.x-
    W*.35;

  const targetY=
    player.y-
    H*.55;


  camX+=
    (targetX-camX)*
    .09;

  camY+=
    (targetY-camY)*
    .07;


  if(tunnelMode){

    camX=Math.max(
      -100,
      Math.min(
        8500,
        camX
      )
    );

    camY=Math.max(
      -300,
      Math.min(
        250,
        camY
      )
    );

  }
  else{

    camX=Math.max(
      -100,
      Math.min(
        12100,
        camX
      )
    );

    camY=Math.max(
      -250,
      Math.min(
        180,
        camY
      )
    );

  }


  staminaEl.style.width=
    player.stamina+"%";

  scrapEl.textContent=
    scrap;

  componentsEl.textContent=
    components+"/3";


  updatePrompt();


  particles.forEach(q=>{

    q.x+=q.vx;
    q.y+=q.vy;

    q.vy+=.08;

    q.life--;

  });


  particles=
    particles.filter(
      q=>q.life>0
    );

}
