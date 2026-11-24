export type Role = "org_admin" | "institution_admin" | "instructor" | "ta" | "examiner" | "student";
export const ROLE_LABEL: Record<Role, string> = {
  org_admin: "Organization Administrator", institution_admin: "Institution Administrator",
  instructor: "Instructor", ta: "Teaching Assistant", examiner: "Examiner", student: "Student",
};
export const STAFF: Role[] = ["org_admin", "institution_admin", "instructor", "ta", "examiner"];
export const ADMINS: Role[] = ["org_admin", "institution_admin"];
export const APPROVERS: Role[] = ["org_admin", "institution_admin", "instructor", "examiner"];
export const isStaff = (r: Role) => r !== "student";

export type NavItem = { key: string; label: string; href: string; icon: string; roles: Role[] };
const ALL = STAFF;
export const NAV: NavItem[] = [
  { key: "overview", label: "Overview", href: "/app", icon: "LayoutDashboard", roles: ALL },
  { key: "institutions", label: "Institutions", href: "/app/institutions", icon: "Landmark", roles: ADMINS },
  { key: "courses", label: "Courses", href: "/app/courses", icon: "BookOpen", roles: ALL },
  { key: "students", label: "Students", href: "/app/students", icon: "Users", roles: ["org_admin", "institution_admin", "instructor", "ta"] },
  { key: "assignments", label: "Assignments", href: "/app/assignments", icon: "ClipboardList", roles: ALL },
  { key: "examinations", label: "Examinations", href: "/app/examinations", icon: "FileCheck2", roles: ["org_admin", "institution_admin", "instructor", "examiner"] },
  { key: "submissions", label: "Submissions", href: "/app/submissions", icon: "Inbox", roles: ALL },
  { key: "ai-grading", label: "AI Grading", href: "/app/ai-grading", icon: "ScanSearch", roles: ALL },
  { key: "rubrics", label: "Rubrics", href: "/app/rubrics", icon: "ListChecks", roles: ALL },
  { key: "gradebook", label: "Gradebook", href: "/app/gradebook", icon: "Table2", roles: ALL },
  { key: "feedback", label: "Feedback", href: "/app/feedback", icon: "MessageSquareText", roles: ALL },
  { key: "regrades", label: "Regrade Requests", href: "/app/regrades", icon: "RotateCcw", roles: ALL },
  { key: "programming", label: "Programming Autograder", href: "/app/programming", icon: "Code2", roles: ["org_admin", "institution_admin", "instructor", "ta"] },
  { key: "analytics", label: "Analytics", href: "/app/analytics", icon: "BarChart3", roles: ALL },
  { key: "assistant", label: "AI Assistant", href: "/app/assistant", icon: "Bot", roles: ALL },
  { key: "integrations", label: "Integrations", href: "/app/integrations", icon: "Plug", roles: ADMINS },
  { key: "team", label: "Team Management", href: "/app/team", icon: "UserCog", roles: ADMINS },
  { key: "settings", label: "Settings", href: "/app/settings", icon: "Settings", roles: ALL },
];
export const STUDENT_NAV: NavItem[] = [
  { key: "home", label: "Overview", href: "/app/student", icon: "LayoutDashboard", roles: ["student"] },
  { key: "courses", label: "My Courses", href: "/app/student/courses", icon: "BookOpen", roles: ["student"] },
  { key: "assessments", label: "Assessments", href: "/app/student/assessments", icon: "ClipboardList", roles: ["student"] },
  { key: "grades", label: "Grades and Feedback", href: "/app/student/grades", icon: "Table2", roles: ["student"] },
  { key: "regrades", label: "Regrade Requests", href: "/app/student/regrades", icon: "RotateCcw", roles: ["student"] },
  { key: "progress", label: "Progress", href: "/app/student/progress", icon: "TrendingUp", roles: ["student"] },
  { key: "settings", label: "Settings", href: "/app/student/settings", icon: "Settings", roles: ["student"] },
];

/** Collection policy. Students never use the generic data API for writes. */
export const COLLECTIONS: Record<string, { read: Role[]; write: Role[]; required?: string }> = {
  institutions: { read: ADMINS, write: ADMINS, required: "name" },
  courses: { read: STAFF, write: ["org_admin", "institution_admin", "instructor"], required: "title" },
  students: { read: ["org_admin", "institution_admin", "instructor", "ta"], write: ["org_admin", "institution_admin", "instructor"], required: "name" },
  assignments: { read: STAFF, write: ["org_admin", "institution_admin", "instructor", "examiner"], required: "title" },
  rubrics: { read: STAFF, write: ["org_admin", "institution_admin", "instructor", "examiner"], required: "name" },
  submissions: { read: STAFF, write: STAFF },
  regrades: { read: STAFF, write: ["org_admin", "institution_admin", "instructor", "examiner"] },
  tests: { read: STAFF, write: ["org_admin", "institution_admin", "instructor"] },
  integrations: { read: ADMINS, write: ADMINS },
  notifications: { read: STAFF, write: STAFF },
  audit: { read: ADMINS, write: [] },
  groups: { read: STAFF, write: STAFF },
};
