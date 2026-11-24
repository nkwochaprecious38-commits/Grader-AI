import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "./globals.css";
import { ToastProvider } from "@/components/ui";

export const metadata: Metadata = {
  title: { default: "Grader AI: Smarter Grading. Better Feedback. Stronger Learning.", template: "%s | Grader AI" },
  description: "Grader AI helps educators assess assignments, automate repetitive grading tasks, deliver meaningful student feedback, and understand academic performance.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><ToastProvider>{children}</ToastProvider></body></html>;
}
