import { AppSidebar } from "./components/sidebar";
import { AppHeader } from "./components/header";
import { AuthGuard } from "./components/auth-guard";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
