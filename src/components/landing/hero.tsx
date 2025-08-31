"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./auth-modal";

export function Hero() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
        <div className="text-center lg:text-start space-y-6">
          <main className="text-5xl md:text-6xl font-bold">
            <h1 className="inline">
              <span className="inline bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text">
                StudySpark
              </span>{" "}
              Your Personal
            </h1>{" "}
            AI-Powered{" "}
            <h2 className="inline">
              <span className="inline bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text">
                Student Dashboard
              </span>
            </h2>
          </main>
          <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
            Elevate your academic journey with AI-driven tools for tutoring, summaries, and planning. Stay organized, study smarter, and achieve your goals with StudySpark.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button className="w-full md:w-1/3 text-lg" size="lg" onClick={() => setAuthModalOpen(true)}>
              Get Started for Free
            </Button>
          </div>
        </div>
        <div className="z-10">
          <div
            className="w-full h-full bg-muted/50 rounded-lg"
            style={{
              boxShadow: '0 0 200px 50px hsl(var(--primary))',
            }}
          >
            <img
              src="https://picsum.photos/600/400"
              alt="Study session"
              className="rounded-lg shadow-2xl border"
              width="600"
              height="400"
              data-ai-hint="study desk"
            />
          </div>
        </div>
      </section>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setAuthModalOpen} initialView="signup" />
    </>
  );
}
