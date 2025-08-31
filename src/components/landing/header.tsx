"use client"

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./auth-modal";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#features", label: "Features" },
  { href: "#search", label: "Search" },
  { href: "#feedback", label: "Feedback" },
];

export function LandingHeader() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [initialView, setInitialView] = useState<'login' | 'signup'>('login');

  const openModal = (view: 'login' | 'signup') => {
    setInitialView(view);
    setAuthModalOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Logo />
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => openModal('login')}>Login</Button>
            <Button onClick={() => openModal('signup')}>Sign Up</Button>
          </div>
        </div>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setAuthModalOpen} initialView={initialView} />
    </>
  );
}
