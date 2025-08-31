import { Logo } from "@/components/logo";

export function LandingFooter() {
  return (
    <footer id="footer" className="border-t">
      <div className="container py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Logo />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} StudySpark. All rights reserved. Created by Rishabh Tripathi.
        </p>
      </div>
    </footer>
  );
}
