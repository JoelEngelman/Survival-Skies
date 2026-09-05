/* ============================================================
   HUMAN DIALOGUE PASS
   Keeps the story logic intact, but makes the writing shorter,
   messier and more conversational.
   ============================================================ */

const HUMAN_LINES={
  "Hello? Is anyone receiving this?":"Hello? Anyone there?",
  "...Mara?":"...Mara?",
  "Who is this? How do you know my name?":"Who is this? How do you know my name?",
  "Because we heard your signal. Every night.":"We've been hearing you. Every night.",
  "You were here the whole time?":"You've been here this whole time?",
  "We were trapped. The Collapse cut the city apart.":"Yeah. We got trapped when everything came down.",
  "Then I am getting you out.":"Then I'm getting you out.",
  "Mara... follow the lights east.":"Mara... follow the lights. Head east.",
  "Where do they lead?":"Where do they go?",
  "To the people still living above the ruins.":"There's a settlement out there. People are still alive.",

  "They're alive. Follow the lights.":"They're alive. I need to follow those lights.",

  "Hello? Anyone down here?":"Hello? Anybody down here?",
  "That wasn't the wind.":"That wasn't the wind...",
  "DON'T MOVE!":"DON'T MOVE!",
  "The floor. It's unstable.":"The floor's giving way!",
  "Oh no—":"Oh, no—",
  "RUN!":"RUN!",
  "Mara? Are you alive?":"Mara? You okay?",
  "I'm trapped.":"I'm stuck.",
  "So are we.":"Yeah. Us too.",
  "How many of you are there?":"How many of you?",
  "Then we're getting all seven of us out.":"Then we're all getting out of here.",
  "The entrance is gone. We're trapped underground.":"The entrance collapsed. Great. We're stuck down here.",

  "This place is older than the city.":"This place looks older than the city.",
  "Our people followed a signal down here.":"Some of our people followed a signal down here.",
  "And they never came back.":"And they never came back?",
  "Be careful.":"Just watch your step.",
  "I'll find them.":"I'll find them.",
  "The door sealed behind us.":"Well... that's not opening again.",

  "You're the people from the radio.":"You're the ones from the radio.",
  "And you're Mara.":"You're Mara.",
  "How does everyone know my name?":"Okay, why does everyone know my name?",
  "Because your signal wasn't the first.":"Because yours wasn't the first signal we heard.",
  "What do you mean?":"What do you mean?",
  "Someone transmitted from beneath the city.":"Someone was transmitting from under the city.",
  "The Collapse?":"Before the Collapse?",
  "It wasn't natural.":"The Collapse wasn't an accident.",
  "Then what happened?":"Then what happened?",
  "The city was shut down deliberately.":"Someone shut the city down on purpose.",
  "By who?":"Who did it?",
  "We don't know.":"We don't know.",
  "But we found a facility below the transit system.":"But we found some kind of facility under the transit system.",
  "What kind of facility?":"What kind of place?",
  "A control station.":"A control station.",
  "It was still powered.":"And somehow, it still had power.",
  "What did you find inside?":"What was inside?",
  "Records.":"Records. A lot of them.",
  "Records of what?":"Records of what?",
  "The day the sky cities fell.":"The day the sky cities fell.",
  "Then we need to get out.":"Then we need to get out of here.",
  "There's a maintenance shaft further east.":"There's a maintenance shaft farther east.",
  "If we reach it, we can get everyone back to the surface.":"It should get us back to the surface.",
  "Then stay close.":"Stay close.",
  "We have six people.":"There are six of us.",
  "Then I'm getting six people home.":"Then I'm getting all six of you home.",
  "Everyone stays together. We're finding that shaft.":"Nobody wanders off. We're finding that shaft.",

  "We made it. Everyone's alive.":"We made it. Everyone's okay.",
  "We need to warn your leader about that facility.":"Your leader needs to hear about that facility.",

  "We found six people underground.":"We found six people underground.",
  "Six?":"Six people?",
  "They're alive. They survived the Collapse down there.":"They're alive. They've been down there since the Collapse.",
  "What did they tell you?":"What did they tell you?",
  "The Collapse wasn't an accident.":"They said the Collapse wasn't an accident.",
  "I always knew it.":"I had a feeling.",
  "They found a powered facility beneath the transit system.":"They found a powered facility under the transit system.",
  "The old control station...":"The old control station...",
  "You know it?":"You know that place?",
  "My father used to talk about it.":"My dad used to talk about it.",
  "What was it?":"What was it?",
  "A system designed to control the floating city's stabilisers.":"It controlled the stabilisers for the floating city.",
  "Then the Collapse could have been triggered.":"So someone could've triggered the Collapse.",
  "Not could have.":"Not could've.",
  "It was.":"They did.",
  "Who did it?":"Who?",
  "That's the part nobody knows.":"That's what we don't know.",
  "Then we go back.":"Then we go back.",
  "Mara...":"Mara...",
  "If that facility is still powered, someone may still be using it.":"If it's still powered, someone might still be down there.",
  "Then we find them.":"Then we'll find them.",
  "The eastern archive relay may still hold the control station's coordinates.":"The old archive relay might still have the coordinates.",
  "Then this isn't the end.":"So we're not done yet.",

  "This relay still has power.":"This thing still has power.",
  "It used to guide cargo lifts below Sector 07.":"It used to run the cargo lifts under Sector 07.",
  "There. Coordinates for the control station.":"There. The control station's coordinates.",
  "Bring them to the transit gate. We can unlock the lower route.":"Bring them to the transit gate. We can open the lower route.",
  "The transit gate is west. Stay with me.":"The transit gate's west. Come on.",

  "The coordinates worked. The lower gate is open.":"It worked. The lower gate's open.",
  "Then the control station is waiting for us.":"Then the control station's down there.",
  "Not waiting. Watching.":"Not waiting. Watching us.",
  "The descent begins.":"Here we go.",

  "Power is flowing... someone is answering.":"Power's coming through... someone's answering.",
  "One piece secured. The rest of the transmitter is somewhere east.":"Got one. The other pieces should be farther east.",
  "Second component. The last power core is ahead.":"That's two. One more to go.",
  "That's the last piece. The tower should answer now.":"That's all three. Let's see if the tower still works.",
  "Someone was here recently. The transmitter component is still warm.":"Someone's been here. This part's still warm.",
  "The second component was hidden in the radio cabinet.":"Found the second piece in the radio cabinet.",
  "I followed your signal. Who are you?":"I followed your signal. Who are you?",
  "We're what's left of Sector 07.":"We're what's left of Sector 07.",
  "There's someone deeper in here. I can hear them.":"Someone's down here. I can hear them.",
  "That shaft... that's our way out.":"That shaft's our way out.",
  "Keep exploring":"Keep looking around",
  "Press E to speak with the survivors":"Press E to talk to the survivors",
  "Press E to use the maintenance lift":"Press E to use the lift",
  "Press E to activate transmitter":"Press E to turn on the transmitter",
  "Press E to enter underground transit":"Press E to enter the underground",
  "Press E to investigate":"Press E to take a look",
  "Press E to speak to the leader":"Press E to talk to the leader",
  "Press E to access archive relay":"Press E to check the archive relay",
  "Press E to unlock lower transit gate":"Press E to open the lower gate",
  "Press E to collect component":"Press E to pick this up",
  "Press E to interact":"Press E to interact",
  "Hold E to grapple":"Hold E to grapple",
  "Release E to launch":"Release E to launch"
};

function humaniseLine(text){
  return HUMAN_LINES[text] || text;
}

/* Replace the normal HUD speech without changing the game logic. */
const survivalSkiesOriginalSay=say;
say=function(s,t,d=3200){
  survivalSkiesOriginalSay(s,humaniseLine(t),d);
};

/* Replace cutscene text as it is displayed. */
const survivalSkiesOriginalShowCut=showCut;
showCut=function(){
  survivalSkiesOriginalShowCut();
  cutText.textContent=humaniseLine(cutText.textContent);
};

/* Make interaction prompts sound like normal game UI. */
const survivalSkiesOriginalUpdatePrompt=updatePrompt;
updatePrompt=function(){
  survivalSkiesOriginalUpdatePrompt();
  prompt.textContent=humaniseLine(prompt.textContent);
};
