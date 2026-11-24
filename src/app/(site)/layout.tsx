import Nav, { Footer } from "@/components/Nav";
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <><a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-2">Skip to content</a><Nav /><main id="main">{children}</main><Footer /></>;
}
