/* ─── Popover positioning helper ───
   Opens the dropdown toward whichever side of the trigger has room inside the
   nearest scroll/clip container, and caps the popover height so its top (search
   header) is never clipped. */
export const fitPopoverInContainer = (el, trigger, setOpenUpwards) => {
  if (!el) return;

  let clip = el.parentElement;
  while (clip && clip !== document.body) {
    const cs = getComputedStyle(clip);
    if (
      cs.overflowY === "auto" ||
      cs.overflowY === "scroll" ||
      cs.overflowY === "hidden"
    ) {
      break;
    }
    clip = clip.parentElement;
  }
  const clipRect = clip
    ? clip.getBoundingClientRect()
    : { top: 0, bottom: window.innerHeight };
  const triggerRect = trigger
    ? trigger.getBoundingClientRect()
    : el.getBoundingClientRect();
  const gap = 8;

  const spaceBelow = Math.max(0, clipRect.bottom - triggerRect.bottom - gap);
  const spaceAbove = Math.max(0, triggerRect.top - clipRect.top - gap);

  const openUp = spaceBelow < 240 && spaceAbove >= spaceBelow;
  setOpenUpwards(openUp);

  const available = openUp ? spaceAbove : spaceBelow;
  el.style.height = "auto";
  el.style.maxHeight = `${Math.max(200, Math.min(310, available))}px`;
};

export const ICON_CATEGORIES = [
  { id: "all", label: "All Icons", icon: "ri-grid-fill" },
  { id: "daily", label: "Daily Life", icon: "ri-sun-line" },
  { id: "fitness", label: "Fitness", icon: "ri-heart-pulse-line" },
  { id: "work", label: "Work & Code", icon: "ri-code-s-slash-line" },
  { id: "study", label: "Study", icon: "ri-book-open-line" },
  { id: "leisure", label: "Hobbies & Leisure", icon: "ri-gamepad-line" },
  { id: "social", label: "Social & Apps", icon: "ri-chat-3-line" },
];

export const ICON_GRID_ITEMS = [
  // Daily & Routine
  { class: "ri-hotel-bed-line", category: "daily", keywords: "bed sleep rest night lie down routine" },
  { class: "ri-moon-line", category: "daily", keywords: "moon night sleep rest dark evening" },
  { class: "ri-zzz-line", category: "daily", keywords: "zzz sleep rest nap snooze" },
  { class: "ri-rest-time-line", category: "daily", keywords: "rest time relax break chill" },
  { class: "ri-shower-line", category: "daily", keywords: "shower bath clean hygiene wash bath routine" },
  { class: "ri-coffee-line", category: "daily", keywords: "coffee tea cup drink morning mug cafe espresso" },
  { class: "ri-cup-line", category: "daily", keywords: "cup drink tea beverage matcha" },
  { class: "ri-restaurant-line", category: "daily", keywords: "restaurant food eating meal lunch dinner fork knife" },
  { class: "ri-restaurant-2-line", category: "daily", keywords: "food meal dinner plate dish" },
  { class: "ri-cake-line", category: "daily", keywords: "cake dessert food sweet treat" },
  { class: "ri-apple-line", category: "daily", keywords: "apple fruit healthy food snack diet" },
  { class: "ri-drop-line", category: "daily", keywords: "water hydration drop drink liquid" },
  { class: "ri-t-shirt-line", category: "daily", keywords: "t-shirt clothes laundry dress wear outfit" },
  { class: "ri-alarm-line", category: "daily", keywords: "alarm clock morning wake up timer" },
  { class: "ri-time-line", category: "daily", keywords: "time clock schedule hour duration" },
  { class: "ri-home-2-line", category: "daily", keywords: "home house routine chores cleaning" },
  { class: "ri-home-gear-line", category: "daily", keywords: "home chores maintenance repair fix" },
  { class: "ri-shopping-cart-line", category: "daily", keywords: "shopping cart buy groceries store market" },
  { class: "ri-shopping-bag-line", category: "daily", keywords: "shopping bag store buy retail" },
  { class: "ri-sun-line", category: "daily", keywords: "sun morning day sunshine wake up rise" },

  // Fitness & Health
  { class: "ri-run-line", category: "fitness", keywords: "run running exercise cardio jog track" },
  { class: "ri-walk-line", category: "fitness", keywords: "walk walking steps exercise movement outdoor" },
  { class: "ri-riding-line", category: "fitness", keywords: "bike bicycle riding cycling workout ride" },
  { class: "ri-boxing-line", category: "fitness", keywords: "boxing dumbbell gym workout fight exercise strength heavy" },
  { class: "ri-dribbble-line", category: "fitness", keywords: "exercise sports workout gym fitness" },
  { class: "ri-basketball-line", category: "fitness", keywords: "basketball sports game play court" },
  { class: "ri-football-line", category: "fitness", keywords: "football soccer sports play match" },
  { class: "ri-ping-pong-line", category: "fitness", keywords: "ping pong table tennis sports match" },
  { class: "ri-heart-pulse-line", category: "fitness", keywords: "heart pulse fitness health cardio vitals" },
  { class: "ri-mental-health-line", category: "fitness", keywords: "meditation mental health brain calm relax yoga zen" },
  { class: "ri-capsule-line", category: "fitness", keywords: "medication medicine pills vitamins health supplement" },
  { class: "ri-stethoscope-line", category: "fitness", keywords: "doctor health medical checkup clinic" },
  { class: "ri-shield-cross-line", category: "fitness", keywords: "health care medical safety protection" },
  { class: "ri-footprint-line", category: "fitness", keywords: "footprint steps walking distance health goal" },
  { class: "ri-fire-line", category: "fitness", keywords: "fire burn calories workout streak hot" },

  // Work & Code
  { class: "ri-briefcase-line", category: "work", keywords: "work briefcase job office business corporate" },
  { class: "ri-laptop-line", category: "work", keywords: "laptop computer work coding dev machine" },
  { class: "ri-computer-line", category: "work", keywords: "desktop computer pc work setup screen" },
  { class: "ri-code-s-slash-line", category: "work", keywords: "code coding developer programming leetcode html js" },
  { class: "ri-terminal-box-line", category: "work", keywords: "terminal bash command line shell code cli" },
  { class: "ri-code-box-line", category: "work", keywords: "code box dev script component" },
  { class: "ri-bug-line", category: "work", keywords: "bug debugging fix code error issue" },
  { class: "ri-git-branch-line", category: "work", keywords: "git github branch commit push repo pr" },
  { class: "ri-database-line", category: "work", keywords: "database sql backend server storage data" },
  { class: "ri-cpu-line", category: "work", keywords: "cpu hardware processing tech chip" },
  { class: "ri-robot-2-line", category: "work", keywords: "robot ai bot automation prompt" },
  { class: "ri-gemini-fill", category: "work", keywords: "gemini ai google model assistant prompt" },
  { class: "ri-github-fill", category: "work", keywords: "github code open source repo git" },
  { class: "ri-task-line", category: "work", keywords: "task check todo work done checklist" },
  { class: "ri-file-list-3-line", category: "work", keywords: "file list documents tasks notes specs" },
  { class: "ri-presentation-line", category: "work", keywords: "presentation slides meeting demo pitch decks" },
  { class: "ri-building-line", category: "work", keywords: "building office company workplace headquarters" },

  // Study & Learn
  { class: "ri-book-open-line", category: "study", keywords: "book reading study learn pages literature" },
  { class: "ri-book-read-line", category: "study", keywords: "read reading education study textbook" },
  { class: "ri-graduation-cap-line", category: "study", keywords: "graduation cap college university course school degree" },
  { class: "ri-pencil-ruler-line", category: "study", keywords: "design draw pencil ruler craft geometry" },
  { class: "ri-quill-pen-line", category: "study", keywords: "quill pen writing journal blog article essay" },
  { class: "ri-lightbulb-line", category: "study", keywords: "idea lightbulb solution brain insight spark" },
  { class: "ri-brain-line", category: "study", keywords: "brain thinking focus mind puzzle memory intelligence" },
  { class: "ri-microscope-line", category: "study", keywords: "science research lab study microscope biology" },
  { class: "ri-flask-line", category: "study", keywords: "flask experiment chemistry lab test science" },
  { class: "ri-notion-fill", category: "study", keywords: "notion notes workspace docs study summary" },

  // Hobbies & Leisure
  { class: "ri-gamepad-line", category: "leisure", keywords: "game gaming gamepad arcade play console ps5 steam" },
  { class: "ri-headphone-line", category: "leisure", keywords: "music headphones audio stream podcast listen" },
  { class: "ri-music-2-line", category: "leisure", keywords: "music song lofi audio sound track playlist" },
  { class: "ri-film-line", category: "leisure", keywords: "film movie cinema video watch netflix show" },
  { class: "ri-palette-line", category: "leisure", keywords: "art palette paint drawing creative hobby paint" },
  { class: "ri-camera-line", category: "leisure", keywords: "camera photography photo picture snapshot record" },
  { class: "ri-tv-line", category: "leisure", keywords: "tv television show watch stream anime" },
  { class: "ri-brush-line", category: "leisure", keywords: "brush paint art creative studio canvas" },
  { class: "ri-trophy-line", category: "leisure", keywords: "trophy winner achievement reward streak goal cup" },
  { class: "ri-star-line", category: "leisure", keywords: "star favorite priority bookmark highlight key" },
  { class: "ri-heart-line", category: "leisure", keywords: "heart love care passion favorite like" },
  { class: "ri-youtube-fill", category: "leisure", keywords: "youtube video stream watch music channel" },
  { class: "ri-wallet-line", category: "leisure", keywords: "wallet money finance budget gold savings" },

  // Social & Apps
  { class: "ri-chat-3-line", category: "social", keywords: "chat message talk communication social discuss" },
  { class: "ri-mail-line", category: "social", keywords: "mail email message inbox contact newsletter" },
  { class: "ri-discord-fill", category: "social", keywords: "discord chat community voice server hang out" },
  { class: "ri-twitter-x-fill", category: "social", keywords: "twitter x social news feed posts" },
  { class: "ri-instagram-line", category: "social", keywords: "instagram social media photos story reels" },
  { class: "ri-linkedin-fill", category: "social", keywords: "linkedin network professional jobs career" },
  { class: "ri-reddit-line", category: "social", keywords: "reddit social forum community posts threads" },
  { class: "ri-globe-line", category: "social", keywords: "web globe internet online browsing world" },
  { class: "ri-map-pin-line", category: "social", keywords: "map pin location travel trip spot vacation" },
  { class: "ri-team-line", category: "social", keywords: "team group people friends meeting hang" },
  { class: "ri-user-smile-line", category: "social", keywords: "user profile me person avatar happy" },
];
