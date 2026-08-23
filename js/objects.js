/* ============================================================
   OBJECTS
   ============================================================ */

const objects=[

  {
    type:"shelter",
    x:1140,
    y:390,
    active:true
  },

  {
    type:"radio",
    x:1780,
    y:395,
    active:false
  },

  {
    type:"tower",
    x:3558,
    y:450,
    active:false
  },

  {
    type:"settlement",
    x:4550,
    y:400,
    active:false
  },

  {
    type:"transit",
    x:6200,
    y:420,
    active:false
  },

  {
    type:"cave",
    x:8850,
    y:450,
    active:false
  },

  {
    type:"survivors",
    x:9500,
    y:430,
    active:false
  },

  {
    type:"return",
    x:11900,
    y:450,
    active:false
  }

];


/* ============================================================
   COMPONENTS
   ============================================================ */

const items=[

  {
    x:1200,
    y:385,
    collected:false
  },

  {
    x:1780,
    y:395,
    collected:false
  },

  {
    x:2430,
    y:375,
    collected:false
  }

];


/* ============================================================
   SCRAP
   ============================================================ */

const scraps=[];

function addScrapOnPlatform(p,count){

  for(let i=0;i<count;i++){

    scraps.push({

      x:p.x+
        40+
        Math.random()*
        Math.max(20,p.w-80),

      y:p.y-12,

      collected:false

    });

  }

}

for(const p of platforms){

  if(p.w>=250){

    addScrapOnPlatform(
      p,
      Math.max(2,Math.floor(p.w/180))
    );

  }

}


/* ============================================================
   RAIN
   ============================================================ */

for(let i=0;i<300;i++){

  rain.push({

    x:Math.random()*W,

    y:Math.random()*H,

    speed:9+Math.random()*8,

    length:10+Math.random()*15,

    drift:-1.5+Math.random()

  });

}


/* ============================================================
   PARTICLES
   ============================================================ */

function spawn(x,y,n=8,type="dust"){

  for(let i=0;i<n;i++){

    particles.push({

      x,
      y,

      vx:(Math.random()-.5)*5,

      vy:(Math.random()-.7)*5,

      life:30+Math.random()*25,

      type

    });

  }

}


/* ============================================================
   OBJECTIVES
   ============================================================ */

const objectives=[

  [
    "Find the communications shelter",
    "Follow the broken road and investigate the old shelter."
  ],

  [
    "Recover the first transmitter component",
    "The shelter still contains a transmitter component."
  ],

  [
    "Reach the apartment district",
    "Cross the broken city and reach the eastern radio district."
  ],

  [
    "Recover the second component",
    "Find the old radio room and recover the second component."
  ],

  [
    "Find the final power core",
    "Push through the storm and recover the final power core."
  ],

  [
    "Restore the transmitter",
    "Reach the tower and activate the transmitter."
  ],

  [
    "Follow the lights",
    "Someone answered Mara's transmission."
  ],

  [
    "Speak to the settlement leader",
    "Find the people who have been following the signal."
  ],

  [
    "Find the underground transit system",
    "The scavengers disappeared into the old transit system."
  ],

  [
    "Enter the underground transit system",
    "The entrance is ahead. Press E beside the transit door."
  ],

  [
    "Find a way through the tunnels",
    "The collapse has sealed the way back. Keep moving."
  ],

  [
    "Find the trapped survivors",
    "Six people are alive somewhere deeper underground."
  ],

  [
    "Find another route out",
    "The survivors know a route through the lower tunnels."
  ],

  [
    "Escape the underground",
    "Find the old maintenance lift and get everyone back to the surface."
  ],

  [
    "Return to the settlement",
    "The six survivors are following you. Tell the leader what you found."
  ],

  [
    "Tell the leader what you discovered",
    "The underground facility may explain the Collapse."
  ],

  [
    "Search the eastern archive relay",
    "The leader believes the relay holds the control station's coordinates."
  ],

  [
    "Return to the transit gate",
    "Use the recovered coordinates to unlock the lower transit route."
  ],

  [
    "SURVIVAL SKIES — CHAPTER TWO",
    "The route to the control station is open. The truth beneath Sector 07 awaits."
  ]

];


function objective(){

  const o=objectives[
    Math.min(stage,objectives.length-1)
  ];

  objectiveTitle.textContent=o[0];
  objectiveText.textContent=o[1];

}
