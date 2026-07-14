export type StaffRole = "volunteer" | "case_manager" | "director";

export interface StaffMember {
  pin: string;
  name: string;
  first: string;
  initials: string;
  role: StaffRole;
}

export const DEMO_STAFF: StaffMember[] = [
  { pin: "1111", name: "Sam T.", first: "Sam", initials: "ST", role: "volunteer" },
  { pin: "2222", name: "Crystal G.", first: "Crystal", initials: "CG", role: "case_manager" },
  { pin: "3333", name: "Alex K.", first: "Alex", initials: "AK", role: "director" },
];

export const ROLE_LABELS: Record<StaffRole, string> = {
  volunteer: "Volunteer",
  case_manager: "Case Manager",
  director: "Director",
};

export const NAV_ITEMS = [
  { key: "attendance", label: "Attendance", roles: ["volunteer", "case_manager", "director"] as StaffRole[] },
  { key: "actions", label: "Action List", roles: ["case_manager", "director"] as StaffRole[] },
  { key: "mailroom", label: "Mailroom", roles: ["volunteer", "case_manager", "director"] as StaffRole[] },
  { key: "lockers", label: "Lockers", roles: ["volunteer", "case_manager", "director"] as StaffRole[] },
  { key: "showers", label: "Showers", roles: ["volunteer", "case_manager", "director"] as StaffRole[] },
  { key: "reports", label: "Reports", roles: ["director"] as StaffRole[] },
];

export const PIN_LENGTH = 4;
export const SESSION_STORAGE_KEY = "ahope-session";
