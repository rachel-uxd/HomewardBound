export interface MailProxy {
  id: string;
  name: string;
  initials: string;
  hasAgreement: boolean;
  agreementThumb: string | null;
  signedByLabel: string;
}

export interface MailPickup {
  id: string;
  collectorName: string;
  collectorType: "self" | "proxy";
  staffName: string;
  staffRole: string;
  date: string;
  isToday?: boolean;
}

export type AgreementStatus = "active" | "expired";

export interface MailClient {
  id: string;
  name: string;
  initials: string;
  ahopeNumber: string;
  yob?: number;
  /** Everyone in the mailroom list has (or had) a signed agreement */
  agreementStatus: AgreementStatus;
  agreementSigned: string;
  agreementExpires: string;
  agreementThumb: string | null;
  proxies: MailProxy[];
  pickups: MailPickup[];
  /** "Here Today" attendance — written automatically when a pickup is logged */
  checkedIn: boolean;
  checkinTime?: string;
}

let _nextId = 100;
export function genId(prefix: string): string {
  return `${prefix}-${_nextId++}`;
}

let _nextAhope = 910;
export function genAhopeNumber(): string {
  return `A-${_nextAhope++}`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* Deterministic pseudo-random generator so the demo data is stable per load */
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const FIRST_NAMES = [
  "James","Robert","Michael","William","David","Richard","Joseph","Charles","Christopher",
  "Daniel","Matthew","Anthony","Donald","Steven","Paul","Andrew","Joshua","Kenneth",
  "Kevin","Brian","George","Timothy","Ronald","Edward","Jason","Jeffrey","Ryan","Jacob",
  "Mary","Patricia","Jennifer","Linda","Barbara","Elizabeth","Susan","Jessica","Karen",
  "Nancy","Betty","Margaret","Sandra","Ashley","Dorothy","Kimberly","Emily","Donna",
  "Michelle","Carol","Amanda","Melissa","Deborah","Stephanie","Rebecca","Sharon","Laura",
  "Marcus","Terrence","Darnell","Jamal","Andre","Maurice","Carlos","Luis","Miguel",
  "Rosa","Carmen","Lucia","Ana","Gabriela","Fatima","Aisha","Maya","Crystal","Jasmine",
];
const LAST_INITIALS = "ABCDEFGHJKLMNPRSTUVW".split("");
const STAFF_POOL: Array<{ name: string; role: string }> = [
  { name: "Sam T.", role: "Volunteer" },
  { name: "Crystal G.", role: "Case Manager" },
  { name: "Alex K.", role: "Director" },
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function generateClients(count: number): MailClient[] {
  const rng = seededRng(97);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const chance = (pct: number) => rng() < pct;

  const usedNumbers = new Set(["A-1041", "A-1187", "A-1290", "A-1502", "A-0763", "A-0651", "A-1633", "A-1348"]);
  const clients: MailClient[] = [];

  for (let i = 0; i < count; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_INITIALS)}.`;
    let ahope: string;
    do {
      ahope = `A-${String(randInt(100, 2500)).padStart(4, "0")}`;
    } while (usedNumbers.has(ahope));
    usedNumbers.add(ahope);

    // Agreements run one year from signing. ~8% have lapsed.
    const expired = chance(0.08);
    const signedMonth = pick(ALL_MONTHS);
    const signedDay = randInt(1, 28);
    const signedYear = expired ? 2025 : chance(0.5) ? 2025 : 2026;
    const expiresMonth = expired ? MONTHS[randInt(0, 5)] : signedMonth;
    const agreementSigned = `${signedMonth} ${signedDay}, ${signedYear}`;
    const agreementExpires = expired
      ? `${expiresMonth} ${signedDay}, 2026`
      : `${signedMonth} ${signedDay}, ${signedYear + 1}`;

    const checkedIn = chance(0.35);
    const checkinHour = randInt(8, 11);
    const checkinMin = randInt(0, 59);
    const checkinTime = `${checkinHour}:${String(checkinMin).padStart(2, "0")} AM`;

    const proxies: MailProxy[] = [];
    if (chance(0.18)) {
      const proxyName = `${pick(FIRST_NAMES)} ${pick(LAST_INITIALS)}.`;
      proxies.push({
        id: `gp-${i}`,
        name: proxyName,
        initials: getInitials(proxyName),
        hasAgreement: chance(0.85),
        agreementThumb: "on-file",
        signedByLabel: `${proxyName} + ${name}`,
      });
    }

    const pickups: MailPickup[] = [];
    const pickupCount = chance(0.4) ? 0 : randInt(1, 3);
    for (let p = 0; p < pickupCount; p++) {
      const staff = pick(STAFF_POOL);
      const isToday = p === 0 && checkedIn && !expired && chance(0.3);
      const collectorIsProxy = proxies.length > 0 && chance(0.3);
      pickups.push({
        id: `gk-${i}-${p}`,
        collectorName: collectorIsProxy ? proxies[0].name : name,
        collectorType: collectorIsProxy ? "proxy" : "self",
        staffName: staff.name,
        staffRole: staff.role,
        date: isToday
          ? `Jul 22, ${checkinHour}:${String(checkinMin).padStart(2, "0")} AM`
          : `${pick(MONTHS)} ${randInt(1, 21)}, ${randInt(9, 12)}:${String(randInt(0, 59)).padStart(2, "0")} ${chance(0.5) ? "AM" : "PM"}`,
        isToday,
      });
    }

    clients.push({
      id: `gc-${i}`,
      name,
      initials: getInitials(name),
      ahopeNumber: ahope,
      yob: randInt(1950, 2004),
      agreementStatus: expired ? "expired" : "active",
      agreementSigned,
      agreementExpires,
      agreementThumb: "on-file",
      checkedIn,
      checkinTime: checkedIn ? checkinTime : undefined,
      proxies,
      pickups,
    });
  }

  return clients;
}

export function createInitialClients(): MailClient[] {
  return [...curatedClients(), ...generateClients(280)];
}

function curatedClients(): MailClient[] {
  return [
    {
      id: "mc-1",
      name: "Thomas R.",
      initials: "TR",
      ahopeNumber: "A-1041",
      yob: 1978,
      agreementStatus: "active",
      agreementSigned: "Nov 4, 2025",
      agreementExpires: "Nov 4, 2026",
      agreementThumb: "on-file",
      checkedIn: true,
      checkinTime: "9:12 AM",
      proxies: [
        {
          id: "mp-1",
          name: "Joe M.",
          initials: "JM",
          hasAgreement: true,
          agreementThumb: "on-file",
          signedByLabel: "Joe M. + Thomas R.",
        },
      ],
      pickups: [
        {
          id: "pk-1",
          collectorName: "Thomas R.",
          collectorType: "self",
          staffName: "Crystal G.",
          staffRole: "Case Manager",
          date: "Jul 20, 2:14 PM",
        },
        {
          id: "pk-2",
          collectorName: "Joe M.",
          collectorType: "proxy",
          staffName: "Sam T.",
          staffRole: "Volunteer",
          date: "Jul 15, 10:30 AM",
        },
      ],
    },
    {
      id: "mc-2",
      name: "Sara L.",
      initials: "SL",
      ahopeNumber: "A-1187",
      yob: 1990,
      agreementStatus: "active",
      agreementSigned: "Feb 18, 2026",
      agreementExpires: "Feb 18, 2027",
      agreementThumb: "on-file",
      checkedIn: false,
      proxies: [
        {
          id: "mp-2",
          name: "Joe M.",
          initials: "JM",
          hasAgreement: true,
          agreementThumb: "on-file",
          signedByLabel: "Joe M. + Sara L.",
        },
      ],
      pickups: [],
    },
    {
      id: "mc-3",
      name: "Mark D.",
      initials: "MD",
      ahopeNumber: "A-1290",
      yob: 1969,
      agreementStatus: "active",
      agreementSigned: "Apr 2, 2026",
      agreementExpires: "Apr 2, 2027",
      agreementThumb: "on-file",
      checkedIn: false,
      proxies: [
        {
          id: "mp-3",
          name: "Joe M.",
          initials: "JM",
          hasAgreement: true,
          agreementThumb: "on-file",
          signedByLabel: "Joe M. + Mark D.",
        },
      ],
      pickups: [
        {
          id: "pk-3",
          collectorName: "Joe M.",
          collectorType: "proxy",
          staffName: "Crystal G.",
          staffRole: "Case Manager",
          date: "Jul 18, 11:05 AM",
        },
      ],
    },
    {
      id: "mc-4",
      name: "Denise K.",
      initials: "DK",
      ahopeNumber: "A-1502",
      yob: 1984,
      agreementStatus: "expired",
      agreementSigned: "Jun 10, 2025",
      agreementExpires: "Jun 10, 2026",
      agreementThumb: "on-file",
      checkedIn: false,
      proxies: [],
      pickups: [
        {
          id: "pk-9",
          collectorName: "Denise K.",
          collectorType: "self",
          staffName: "Crystal G.",
          staffRole: "Case Manager",
          date: "May 28, 1:12 PM",
        },
      ],
    },
    {
      id: "mc-5",
      name: "Angela P.",
      initials: "AP",
      ahopeNumber: "A-0763",
      yob: 1959,
      agreementStatus: "active",
      agreementSigned: "Sep 22, 2025",
      agreementExpires: "Sep 22, 2026",
      agreementThumb: "on-file",
      checkedIn: true,
      checkinTime: "8:47 AM",
      proxies: [],
      pickups: [
        {
          id: "pk-4",
          collectorName: "Angela P.",
          collectorType: "self",
          staffName: "Crystal G.",
          staffRole: "Case Manager",
          date: "Jul 22, 9:22 AM",
          isToday: true,
        },
        {
          id: "pk-5",
          collectorName: "Angela P.",
          collectorType: "self",
          staffName: "Sam T.",
          staffRole: "Volunteer",
          date: "Jul 14, 3:45 PM",
        },
      ],
    },
    {
      id: "mc-6",
      name: "Robert C.",
      initials: "RC",
      ahopeNumber: "A-0651",
      yob: 1972,
      agreementStatus: "active",
      agreementSigned: "Jan 30, 2026",
      agreementExpires: "Jan 30, 2027",
      agreementThumb: "on-file",
      checkedIn: true,
      checkinTime: "10:03 AM",
      proxies: [
        {
          id: "mp-4",
          name: "Maria G.",
          initials: "MG",
          hasAgreement: false,
          agreementThumb: null,
          signedByLabel: "Maria G. + Robert C.",
        },
      ],
      pickups: [
        {
          id: "pk-7",
          collectorName: "Robert C.",
          collectorType: "self",
          staffName: "Sam T.",
          staffRole: "Volunteer",
          date: "Jul 19, 1:30 PM",
        },
      ],
    },
    {
      id: "mc-7",
      name: "James W.",
      initials: "JW",
      ahopeNumber: "A-1633",
      yob: 1995,
      agreementStatus: "active",
      agreementSigned: "May 11, 2026",
      agreementExpires: "May 11, 2027",
      agreementThumb: "on-file",
      checkedIn: false,
      proxies: [],
      pickups: [],
    },
    {
      id: "mc-8",
      name: "Lisa T.",
      initials: "LT",
      ahopeNumber: "A-1348",
      yob: 1981,
      agreementStatus: "active",
      agreementSigned: "Oct 7, 2025",
      agreementExpires: "Oct 7, 2026",
      agreementThumb: "on-file",
      checkedIn: false,
      proxies: [
        {
          id: "mp-5",
          name: "Robert C.",
          initials: "RC",
          hasAgreement: true,
          agreementThumb: "on-file",
          signedByLabel: "Robert C. + Lisa T.",
        },
      ],
      pickups: [
        {
          id: "pk-8",
          collectorName: "Robert C.",
          collectorType: "proxy",
          staffName: "Crystal G.",
          staffRole: "Case Manager",
          date: "Jul 16, 11:40 AM",
        },
      ],
    },
  ];
}
