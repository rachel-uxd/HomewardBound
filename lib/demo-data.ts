export interface DemoProxyPickup {
  clientId: string;
  clientName: string;
  clientAlias?: string;
  yob?: number;
  hmisNumber: string;
}

export interface DemoClient {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  alias?: string;
  initials: string;
  yob?: number;
  pronouns?: string;
  ahopeNumber: string;
  hmisNumber: string;
  checkedIn: boolean;
  checkinTime?: string;
  hasMailAgreement: boolean;
  mailAgreementFile?: string;
  canPickUpFor: DemoProxyPickup[];
  canBePickedUpBy: DemoProxyPickup[];
  lockerNumber?: number;
  engagementPlan?: string;
  engagementPlanMeta?: string;
  flags: Array<{ label: string; variant: "red" | "gold" | "green" }>;
  metaPairs: Array<{ k: string; v: string }>;
  glimmers: Array<{ text: string; meta: string }>;
  activity: Array<{
    type: string;
    date: string;
    ago: string;
    note: string;
    by: string;
  }>;
}

export interface DemoActionItem {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  clientAlias?: string;
  task: string;
  priority: "urgent" | "high" | "normal";
  status: "open" | "in_progress" | "done";
  lastCheckedIn?: string;
  isHereToday: boolean;
}

export interface DemoMailItem {
  id: string;
  recipientName: string;
  date: string;
  type: string;
  from: string;
  bin: string;
  parcelId: string;
  status: "held" | "released" | "returned";
  loggedBy: string;
}

export interface DemoLockerAssignment {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  clientAlias?: string;
  lockerNumber: number;
  since: string;
}

export interface DemoLockerWaitlist {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  since: string;
  nextLocker: number;
}

export interface DemoShowerQueueItem {
  id: string;
  clientId: string;
  name: string;
  ahopeNumber: string;
  position: number;
  waitMinutes: number;
}

// --- Deterministic pseudo-random from seed ---
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seededRng(42);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}
function chance(pct: number): boolean {
  return rng() < pct;
}
function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// --- Name pools ---
const FIRST_NAMES_M = [
  "James","Robert","Michael","William","David","Richard","Joseph","Thomas","Charles","Christopher",
  "Daniel","Matthew","Anthony","Mark","Donald","Steven","Paul","Andrew","Joshua","Kenneth",
  "Kevin","Brian","George","Timothy","Ronald","Edward","Jason","Jeffrey","Ryan","Jacob",
  "Gary","Nicholas","Eric","Jonathan","Stephen","Larry","Justin","Scott","Brandon","Benjamin",
  "Samuel","Raymond","Gregory","Frank","Alexander","Patrick","Jack","Dennis","Jerry","Tyler",
  "Marcus","Terrence","Darnell","DeShawn","Jamal","Andre","Maurice","Carlos","Luis","Miguel",
  "Roberto","Jose","Juan","Pedro","Omar","Malik","Rashid","Tariq","Kwame","Kofi",
];

const FIRST_NAMES_F = [
  "Mary","Patricia","Jennifer","Linda","Barbara","Elizabeth","Susan","Jessica","Sarah","Karen",
  "Lisa","Nancy","Betty","Margaret","Sandra","Ashley","Dorothy","Kimberly","Emily","Donna",
  "Michelle","Carol","Amanda","Melissa","Deborah","Stephanie","Rebecca","Sharon","Laura","Cynthia",
  "Kathleen","Amy","Angela","Shirley","Anna","Brenda","Pamela","Emma","Nicole","Helen",
  "Samantha","Tanya","Latisha","Keisha","Tamika","Maya","Sophia","Crystal","Jasmine","Aaliyah",
  "Maria","Rosa","Carmen","Lucia","Ana","Gabriela","Fatima","Amina","Aisha","Zara",
];

const LAST_INITIALS = "ABCDEFGHJKLMNPRSTUVW".split("");

const ALIASES = [
  "D","JT","Mike","Los","Slim","Red","Big T","Lil' J","Bear","Ace","Doc","Pop","Smiley",
  "Rico","Ghost","Blue","Lucky","Shadow","Chief","Tank","Tiny","Mac","Flash","Duke","Cap",
  "Mookie","Nico","Rey","Sol","Nene","Mimi","Titi","Cece","Boo","Dee","Lala","Peaches",
];

const PRONOUNS_M = "he/him";
const PRONOUNS_F = "she/her";
const PRONOUNS_NB = "they/them";

const STAFF = ["Crystal G.", "Sam T.", "Alex K.", "Jordan P.", "Kim L.", "Pat R.", "Morgan D.", "Casey B."];

const FLAG_POOL: Array<{ label: string; variant: "red" | "gold" | "green" }> = [
  { label: "Active client", variant: "green" },
  { label: "Housing referral", variant: "gold" },
  { label: "Mental health referral", variant: "gold" },
  { label: "New client", variant: "gold" },
  { label: "Recently housed", variant: "green" },
  { label: "Safety concern", variant: "red" },
  { label: "Medical alert", variant: "red" },
  { label: "Behavioral note", variant: "gold" },
  { label: "Substance use support", variant: "gold" },
  { label: "Employment referral", variant: "green" },
  { label: "ID replacement", variant: "gold" },
  { label: "Benefits pending", variant: "gold" },
  { label: "Veteran", variant: "green" },
  { label: "DV survivor", variant: "red" },
];

const ENGAGEMENT_PLANS = [
  "Primary goal is housing stability. Connecting with VASH case worker on Wednesday. Prefers morning appointments. Has valid ID on file.",
  "Working on getting replacement ID. Referral to mental health services pending. Check in weekly.",
  "Recently housed. Monthly check-ins to maintain connection to services. Strong social network forming.",
  "Substance use recovery — 90 days sober. Attending daily groups. Looking into job training programs.",
  "Transitional housing application submitted. Waiting on Section 8 voucher. Needs bus pass for appointments.",
  "Employment focus — resume updated, applying to food service positions. Practice interviews scheduled.",
  "Medical follow-up needed after ER visit. Coordinating with BMC social worker. Medication management.",
  "New to services. Building trust. Start with basic needs — showers, mail, meals. No pressure on housing yet.",
  "Family reunification goal. Working with DCF case worker. Parenting classes on Thursdays.",
  "SSI application in progress. Needs documentation from prior provider. Legal aid referral made.",
  "Aging in place concerns. Mobility issues. Connected to elder services. Weekly wellness checks.",
  "Youth transition plan — aging out of foster care. Housing voucher application pending.",
];

const GLIMMER_POOL = [
  "Got a call back for a kitchen job interview!",
  "Finished pre-screen paperwork without frustration — big step.",
  "Stayed for lunch and a full conversation for the first time.",
  "First month of rent paid on time — celebrated with the team.",
  "Brought his own towel — small but it mattered to him.",
  "Showed up three days in a row — first time in months.",
  "Helped another client navigate the bus system.",
  "Completed anger management module on their own.",
  "Got their birth certificate replacement in the mail.",
  "Talked about future plans for the first time.",
  "Signed up for the computer skills class.",
  "Made a doctor appointment and actually went.",
  "Reconnected with a sibling after two years.",
  "Volunteered to help set up chairs for the group session.",
  "Smiled and said 'good morning' to staff — first time.",
  "Asked about GED classes — self-motivated.",
  "Brought in a pay stub from a new part-time job.",
  "Went to AA meeting without being asked.",
  "Saved $40 this week in their savings envelope.",
  "Read aloud during group for the first time.",
  "Said 'thank you' to the shower attendant unprompted.",
  "Brought a friend who needed services.",
  "Got a library card.",
  "Wore the new interview clothes and felt confident.",
];

const ACTIVITY_TYPES = ["Check-in", "Shower", "Note", "Mail pickup", "Locker", "Flag", "Glimmer"];
const ACTIVITY_NOTES: Record<string, string[]> = {
  "Check-in": [
    "Checked in at the front desk.",
    "Arrived early, seemed in good spirits.",
    "Late arrival — came in after lunch.",
    "Checked in for morning services.",
    "Walk-in, first visit this week.",
  ],
  "Shower": [
    "Men's queue, waited 14 min.",
    "Women's queue, waited 8 min.",
    "Quick shower, no wait.",
    "Men's queue, waited 22 min. Busy day.",
    "Women's queue, waited 5 min.",
  ],
  "Note": [
    "VASH case worker confirmed Wed 10 AM slot. Bring ID copy.",
    "Seemed upset today — offered to talk but declined. Will check in tomorrow.",
    "Discussed housing options. Interested in shared housing.",
    "Coordinated with BMC for follow-up appointment.",
    "Left a message with legal aid on client's behalf.",
    "Client asked about job training — gave referral list.",
    "Medication refill needed — called pharmacy.",
    "Client mentioned family conflict. Offered counseling referral.",
    "Helped fill out benefits application.",
    "Client completed intake assessment.",
  ],
  "Mail pickup": [
    "Picked up 2 pieces — letter from DHS, package.",
    "Picked up letter from MassHealth.",
    "Package from Amazon released.",
    "Gov/Legal mail from City of Boston.",
    "Medical correspondence from BMC.",
    "Picked up 3 items — mixed mail.",
  ],
  "Locker": [
    "Locker assigned.",
    "Locker contents retrieved.",
    "Locker released — client moved to housing.",
    "Added items to locker.",
  ],
  "Flag": [
    "Safety concern flagged — altercation in common area.",
    "Housing referral flag added.",
    "Medical alert — ER visit last night.",
    "Behavioral note — raised voice at staff, de-escalated.",
  ],
  "Glimmer": [
    "Glimmer recorded — see glimmers section.",
  ],
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MAIL_SENDERS = [
  "DHS","MassHealth","City of Boston","BMC","USPS","Amazon","SSA","IRS",
  "Legal Aid","Housing Authority","VA","Medicaid","Medicare","Salvation Army",
  "SNAP Office","WIC","Unemployment Office","Court System","Probation Office",
  "Child Support","DMV","Registry","Health Connector","Cambridge Health Alliance",
  "Beth Israel","Partners Healthcare","Tufts Medical","Community Health Center",
  "Pine Street Inn","Rosie's Place","St. Francis House","Bridge Over Troubled Waters",
];
const MAIL_TYPES = ["Letter", "Package", "Gov/Legal", "Medical", "Financial", "Personal"];

// --- Generate 200 clients ---
function generateClients(count: number): DemoClient[] {
  const clients: DemoClient[] = [];
  const usedNumbers = new Set<string>();

  for (let i = 0; i < count; i++) {
    const isFemale = chance(0.38);
    const isNB = !isFemale && chance(0.05);
    const firstName = isFemale ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
    const lastInit = pick(LAST_INITIALS);
    const name = `${firstName} ${lastInit}.`;
    const initials = `${firstName[0]}${lastInit}`;

    let ahopeNum: string;
    do {
      ahopeNum = `A-${String(randInt(100, 2500)).padStart(4, "0")}`;
    } while (usedNumbers.has(ahopeNum));
    usedNumbers.add(ahopeNum);

    const yob = randInt(1955, 2005);
    const pronouns = isFemale ? PRONOUNS_F : isNB ? PRONOUNS_NB : PRONOUNS_M;
    const alias = chance(0.4) ? pick(ALIASES) : undefined;
    const checkedIn = chance(0.42);
    const hasMailAgreement = chance(0.72);

    const firstSeenMonth = pick(MONTHS);
    const firstSeenYear = randInt(2020, 2025);
    const visits30d = checkedIn ? randInt(8, 28) : randInt(0, 15);

    const flagCount = chance(0.15) ? 0 : chance(0.5) ? 1 : randInt(2, 3);
    const flags = pickN(FLAG_POOL, flagCount);

    const hasPlan = chance(0.45);
    const engagementPlan = hasPlan ? pick(ENGAGEMENT_PLANS) : undefined;
    const engagementPlanMeta = hasPlan ? `Updated by ${pick(STAFF)} · ${pick(MONTHS)} ${randInt(1, 14)}` : undefined;

    const hasLocker = chance(0.25);
    const lockerNumber = hasLocker ? randInt(1, 120) : undefined;

    const glimmerCount = chance(0.3) ? 0 : randInt(1, 3);
    const glimmers = Array.from({ length: glimmerCount }, () => ({
      text: pick(GLIMMER_POOL),
      meta: `${pick(STAFF)} · ${pick(MONTHS)} ${randInt(1, 14)}`,
    }));

    const checkinHour = randInt(7, 11);
    const checkinMin = randInt(0, 59);
    const ampm = checkinHour >= 12 ? "PM" : "AM";
    const displayHour = checkinHour > 12 ? checkinHour - 12 : checkinHour;
    const checkinTime = checkedIn ? `${displayHour}:${String(checkinMin).padStart(2, "0")} ${ampm}` : undefined;

    const activityCount = randInt(1, 8);
    const activity = Array.from({ length: activityCount }, (_, ai) => {
      const type = pick(ACTIVITY_TYPES);
      const notes = ACTIVITY_NOTES[type] ?? ["Activity recorded."];
      const daysAgo = ai === 0 && checkedIn ? 0 : randInt(1, 90);
      const dateLabel = daysAgo === 0 ? `Jul 14, ${checkinTime}` : `${pick(MONTHS)} ${randInt(1, 28)}`;
      const agoLabel = daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`;
      return {
        type,
        date: dateLabel,
        ago: agoLabel,
        note: pick(notes),
        by: pick(STAFF),
      };
    });

    const metaPairs = [
      { k: "AHOPE #", v: ahopeNum },
      { k: "YOB", v: String(yob) },
      { k: "Pronouns", v: pronouns },
      ...(alias ? [{ k: "Alias", v: alias }] : []),
      { k: "First seen", v: `${firstSeenMonth} ${firstSeenYear}` },
      { k: "Visits (30d)", v: String(visits30d) },
    ];

    const hmisNum = String(randInt(100000, 999999));

    clients.push({
      id: `c${i + 1}`,
      firstName,
      lastName: `${lastInit}.`,
      name,
      alias,
      initials,
      yob,
      pronouns,
      ahopeNumber: ahopeNum,
      hmisNumber: hmisNum,
      checkedIn,
      checkinTime,
      hasMailAgreement,
      mailAgreementFile: hasMailAgreement && chance(0.8) ? `mail-agreement-${hmisNum}.pdf` : undefined,
      canPickUpFor: [],
      canBePickedUpBy: [],
      lockerNumber,
      engagementPlan,
      engagementPlanMeta,
      flags,
      metaPairs,
      glimmers,
      activity,
    });
  }

  // Build proxy pickup relationships (~15% of clients with agreements)
  const withAgreement = clients.filter((c) => c.hasMailAgreement);
  const proxyCount = Math.floor(withAgreement.length * 0.15);
  for (let i = 0; i < proxyCount; i++) {
    const picker = withAgreement[randInt(0, withAgreement.length - 1)];
    const recipient = withAgreement[randInt(0, withAgreement.length - 1)];
    if (picker.id === recipient.id) continue;
    if (picker.canPickUpFor.some((p) => p.clientId === recipient.id)) continue;

    const proxyRef: DemoProxyPickup = {
      clientId: recipient.id,
      clientName: recipient.name,
      clientAlias: recipient.alias,
      yob: recipient.yob,
      hmisNumber: recipient.hmisNumber,
    };
    const reverseRef: DemoProxyPickup = {
      clientId: picker.id,
      clientName: picker.name,
      clientAlias: picker.alias,
      yob: picker.yob,
      hmisNumber: picker.hmisNumber,
    };
    picker.canPickUpFor.push(proxyRef);
    recipient.canBePickedUpBy.push(reverseRef);
  }

  return clients;
}

// --- Generate action items ---
function generateActionItems(clients: DemoClient[], count: number): DemoActionItem[] {
  const TASKS = [
    "VASH appointment follow-up — confirm slot",
    "ID replacement application — needs signature",
    "Job interview prep — review resume draft",
    "Intake paperwork — follow-up visit",
    "Monthly housing check-in — schedule next",
    "New client orientation — complete intake form",
    "Benefits application — missing documentation",
    "Medical follow-up — coordinate with BMC",
    "Mental health referral — schedule intake",
    "Legal aid consultation — prepare documents",
    "SSI application — gather records",
    "Housing voucher renewal — deadline approaching",
    "Substance use assessment — schedule with counselor",
    "GED enrollment — help with registration",
    "Job training program — submit application",
    "Bus pass renewal — verify eligibility",
    "Court date reminder — prepare client",
    "Family reunification meeting — coordinate with DCF",
    "Medication management — pharmacy coordination",
    "Dental appointment — schedule at community health",
    "Eye exam — referral to vision center",
    "Food stamp recertification — due this month",
    "Parenting class enrollment — Thursday sessions",
    "Anger management referral — group starts next week",
    "Financial literacy workshop — sign up client",
    "Shelter bed reservation — confirm for tonight",
    "Storage unit contents — inventory check needed",
    "Employment verification — fax to case worker",
    "Birth certificate request — submitted, follow up",
    "Social security card replacement — track status",
  ];

  const priorities: Array<"urgent" | "high" | "normal"> = ["urgent", "high", "normal"];
  const statuses: Array<"open" | "in_progress" | "done"> = ["open", "in_progress", "done"];

  return Array.from({ length: count }, (_, i) => {
    const client = pick(clients);
    return {
      id: `a${i + 1}`,
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
      clientAlias: client.alias,
      task: pick(TASKS),
      priority: chance(0.15) ? "urgent" : chance(0.4) ? "high" : "normal",
      status: chance(0.6) ? "open" : chance(0.5) ? "in_progress" : "done",
      lastCheckedIn: client.checkedIn ? `Today, ${client.checkinTime}` : `${pick(MONTHS)} ${randInt(1, 13)}`,
      isHereToday: client.checkedIn,
    };
  });
}

// --- Generate 10,000 mail items ---
function generateMail(clients: DemoClient[], count: number): DemoMailItem[] {
  const items: DemoMailItem[] = [];

  for (let i = 0; i < count; i++) {
    const hasName = chance(0.92);
    const client = hasName ? pick(clients) : null;
    const daysAgo = randInt(0, 180);
    const month = MONTHS[Math.floor((6 - Math.floor(daysAgo / 30) + 12) % 12)];
    const day = randInt(1, 28);

    const binLetter = String.fromCharCode(65 + randInt(0, 25));
    const binNum = randInt(1, 40);

    items.push({
      id: `m${i + 1}`,
      recipientName: client?.name ?? "Unknown recipient",
      date: `${month} ${day}`,
      type: pick(MAIL_TYPES),
      from: pick(MAIL_SENDERS),
      bin: `${binLetter}-${binNum}`,
      parcelId: `AH-${String(10000 + i).slice(1)}-${randInt(100, 999)}`,
      status: chance(0.85) ? "held" : chance(0.7) ? "released" : "returned",
      loggedBy: pick(STAFF),
    });
  }

  return items;
}

// --- Generate locker data (~220 assigned, ~87 waiting) ---
function generateLockers(clients: DemoClient[], assignedTarget: number, waitlistTarget: number): {
  assignments: DemoLockerAssignment[];
  waitlist: DemoLockerWaitlist[];
} {
  const shuffled = [...clients].sort(() => rng() - 0.5);
  const assignedClients = shuffled.slice(0, assignedTarget);
  const remainingPool = shuffled.slice(assignedTarget);
  const waitlistClients = remainingPool.slice(0, waitlistTarget);

  const usedLockers = new Set<number>();
  const assignments: DemoLockerAssignment[] = assignedClients.map((c, i) => {
    let num: number;
    do { num = randInt(1, 300); } while (usedLockers.has(num));
    usedLockers.add(num);
    return {
      id: `l${i + 1}`,
      clientId: c.id,
      clientName: c.name,
      clientInitials: c.initials,
      clientAlias: c.alias,
      lockerNumber: num,
      since: `${pick(MONTHS)} ${randInt(1, 28)}, ${randInt(2024, 2025)}`,
    };
  });

  const maxLocker = Math.max(...assignments.map((a) => a.lockerNumber), 0);
  const waitlist: DemoLockerWaitlist[] = waitlistClients.map((c, i) => ({
    id: `lw${i + 1}`,
    clientId: c.id,
    clientName: c.name,
    clientInitials: c.initials,
    since: `${pick(MONTHS)} ${randInt(1, 28)}`,
    nextLocker: maxLocker + i + 1,
  }));

  return { assignments, waitlist };
}

// --- Generate shower queues ---
function generateShowerQueues(clients: DemoClient[]): {
  women: DemoShowerQueueItem[];
  men: DemoShowerQueueItem[];
} {
  const checkedIn = clients.filter((c) => c.checkedIn);
  const women = checkedIn.filter((c) => c.pronouns === "she/her");
  const men = checkedIn.filter((c) => c.pronouns !== "she/her");

  const womenQueue = pickN(women, Math.min(women.length, randInt(4, 8)));
  const menQueue = pickN(men, Math.min(men.length, randInt(5, 10)));

  return {
    women: womenQueue.map((c, i) => ({
      id: `sw${i + 1}`,
      clientId: c.id,
      name: c.name,
      ahopeNumber: c.ahopeNumber,
      position: i + 1,
      waitMinutes: Math.max(1, randInt(2, 35) - i * 3),
    })),
    men: menQueue.map((c, i) => ({
      id: `sm${i + 1}`,
      clientId: c.id,
      name: c.name,
      ahopeNumber: c.ahopeNumber,
      position: i + 1,
      waitMinutes: Math.max(1, randInt(2, 35) - i * 3),
    })),
  };
}

// --- Build all data ---
export const DEMO_CLIENTS = generateClients(350);
export const DEMO_ACTION_ITEMS = generateActionItems(DEMO_CLIENTS, 500);
export const DEMO_MAIL = generateMail(DEMO_CLIENTS, 10_000);

const lockerData = generateLockers(DEMO_CLIENTS, 220, 87);
export const DEMO_LOCKERS = lockerData.assignments;
export const DEMO_LOCKER_WAITLIST = lockerData.waitlist;

const showerData = generateShowerQueues(DEMO_CLIENTS);
export const DEMO_SHOWER_WOMEN = showerData.women;
export const DEMO_SHOWER_MEN = showerData.men;

export const TODAY_LABEL = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});
