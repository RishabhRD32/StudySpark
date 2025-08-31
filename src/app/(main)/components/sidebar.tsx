
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Book,
  ListChecks,
  Newspaper,
  BrainCircuit,
  FileQuestion,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

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

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative hidden lg:flex flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("flex items-center h-16 border-b px-6", isCollapsed && "px-0 justify-center")}>
          <Link href="/dashboard">
            {isCollapsed ? <Book className="h-6 w-6 text-primary" /> : <Logo />}
          </Link>
        </div>
        <nav className="flex flex-col gap-4 p-4 flex-1">
          <ul className="space-y-1">
            {mainNavLinks.map((link) => (
              <li key={link.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isCollapsed && "justify-center w-12 h-12 p-0"
                      )}
                    >
                      <Link href={link.href}>
                        {link.icon}
                        {!isCollapsed && <span className="ml-4">{link.label}</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
                </Tooltip>
              </li>
            ))}
             {externalNavLinks.map((link) => (
                <li key={link.href}>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                        asChild
                        variant='ghost'
                        className={cn("w-full justify-start", isCollapsed && "justify-center w-12 h-12 p-0")}
                        >
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                            {link.icon}
                            {!isCollapsed && <span className="ml-4">{link.label}</span>}
                        </a>
                        </Button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
                    </Tooltip>
                </li>
            ))}
          </ul>
          <div>
            {!isCollapsed && <h3 className="text-xs font-semibold text-muted-foreground uppercase px-4 mt-4 mb-2">AI Tools</h3>}
            <ul className="space-y-1">
              {aiToolsLinks.map((link) => (
                <li key={link.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isCollapsed && "justify-center w-12 h-12 p-0"
                        )}
                      >
                        <Link href={link.href}>
                          {link.icon}
                          {!isCollapsed && <span className="ml-4">{link.label}</span>}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="absolute top-1/2 -right-[13px]">
          <Button size="icon" variant="outline" className="rounded-full h-7 w-7" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
