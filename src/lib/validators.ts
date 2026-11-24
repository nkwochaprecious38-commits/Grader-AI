import { z } from "zod";
export const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(160);
export const password = z.string().min(8, "Password must be at least 8 characters.").max(128)
  .regex(/[A-Za-z]/, "Password must include at least one letter.").regex(/[0-9]/, "Password must include at least one number.");
export const ORG_TYPES = ["University or college", "Secondary school", "Primary school", "Online learning provider", "Examination body", "Tutoring organization", "Corporate training provider", "Independent educator", "Other"] as const;
export const JOB_ROLES = ["Administrator", "Lecturer or instructor", "Teacher", "Teaching assistant", "Examiner", "Tutor", "Training manager", "Other"] as const;
export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100),
  email, organization: z.string().trim().min(2, "Enter your institution or organization name.").max(120),
  orgType: z.string().min(1, "Select an organization type."), role: z.string().min(1, "Select your role."),
  password, confirm: z.string(), terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms and conditions." }) }),
  invite: z.string().optional(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match.", path: ["confirm"] });
