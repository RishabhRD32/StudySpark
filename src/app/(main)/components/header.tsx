
"use client";

import Link from "next/link";
import {
  Bell,
  Book,
  BrainCircuit,
  Calendar,
  FileQuestion,
  LayoutDashboard,
  ListChecks,
  Menu,
  Newspaper,
  ScrollText,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "./user-nav";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const mainNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/subjects", label: "Subjects", icon: <Book className="h-5 w-5" /> },
  { href: "/study-planner", label: "Study Planner", icon: <ListChecks className="h-5 w-5" /> },
  { href: "/timetable", label: "Timetable", icon: <Calendar className="h-5 w-5" /> },
];

const externalNavLinks = [
    { href: "https://news.google.com/", label: "Daily News", icon: <Newspaper className="h-5 w-5" /> },
]

const aiToolsLinks = [
  { href: "/ai-tutor", label: "AI Tutor", icon: <BrainCircuit className="h-5 w-5" /> },
  { href: "/ai-summarizer", label: "AI Summarizer", icon: <ScrollText className="h-5 w-5" /> },
  { href: "/quiz-generator", label: "Quiz Generator", icon: <FileQuestion className="h-5 w-5" /> },
];


export function AppHeader() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <Logo />
            </Link>
             {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {externalNavLinks.map((link) => (
                <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                    {link.icon}
                    {link.label}
                </a>
            ))}
             <div className="my-4 border-t"></div>
              {aiToolsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>
       <ThemeToggle />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <div className="flex flex-col">
                        <p className="font-semibold">Welcome to StudySpark!</p>
                        <p className="text-xs text-muted-foreground">Get started by adding subjects or using our AI tools.</p>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      <UserNav />
    </header>
  );
}
