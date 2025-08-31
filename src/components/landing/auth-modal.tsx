
"use client"

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from '@/lib/auth/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signupSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  profession: z.enum(["student", "teacher"], { required_error: "You must select a profession." }),
  className: z.string().optional(),
  collegeName: z.string().optional(),
}).refine(data => {
    if (data.profession === 'student') {
        return !!data.className && data.className.length > 0;
    }
    return true;
}, {
    message: "Class is required for students.",
    path: ["className"],
});

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialView?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onOpenChange, initialView = 'login' }: AuthModalProps) {
  const [isFlipped, setIsFlipped] = useState(initialView === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    setIsFlipped(initialView === 'signup');
  }, [initialView, isOpen]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", profession: "student", className: "", collegeName: "" },
  });

  const profession = signupForm.watch("profession");

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      // The provider now handles redirection
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    } finally {
        setIsLoading(false);
    }
  };
  
  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      await signup(values.firstName, values.lastName, values.email, values.password, values.profession, values.className, values.collegeName);
      // The provider now handles redirection
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign Up Failed", description: error.message });
    } finally {
       setIsLoading(false);
    }
  };

  const handleFlip = (view: 'login' | 'signup') => {
    setIsFlipped(view === 'signup');
    // Reset forms when flipping
    loginForm.reset();
    signupForm.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent w-full max-w-md overflow-hidden">
        <div className="relative h-[650px]" style={{ perspective: '1000px' }}>
          <div
            className={cn("w-full h-full absolute transition-transform duration-700", isFlipped && "rotate-y-180")}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Login Form */}
            <div className="absolute w-full h-full p-6 bg-card rounded-lg shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-2xl font-bold">Welcome Back!</DialogTitle>
                <DialogDescription>Login to continue to StudySpark.</DialogDescription>
              </DialogHeader>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField control={loginForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="Enter your email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={loginForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input type={showLoginPassword ? "text" : "password"} placeholder="Enter your password" {...field} />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowLoginPassword(prev => !prev)}>
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </form>
              </Form>
              <p className="text-sm text-center text-muted-foreground mt-4">
                Don't have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => handleFlip('signup')}>Sign Up</Button>
              </p>
            </div>

            {/* Signup Form */}
            <div className="absolute w-full h-full p-6 bg-card rounded-lg shadow-2xl overflow-y-auto" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-2xl font-bold">Create an Account</DialogTitle>
                <DialogDescription>Get started with StudySpark for free.</DialogDescription>
              </DialogHeader>
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-2">
                  <div className="flex gap-2">
                    <FormField control={signupForm.control} name="firstName" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>First Name</FormLabel><FormControl><Input placeholder="First Name" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={signupForm.control} name="lastName" render={({ field }) => (
                       <FormItem className="flex-1"><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Last Name" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                   <FormField control={signupForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="Enter your email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={signupForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Input type={showSignupPassword ? "text" : "password"} placeholder="Create a password" {...field} />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowSignupPassword(prev => !prev)}>
                            {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signupForm.control} name="profession" render={({ field }) => (
                    <FormItem className="space-y-3 pt-2"><FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="student" /></FormControl>
                            <FormLabel className="font-normal">Student</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="teacher" /></FormControl>
                            <FormLabel className="font-normal">Teacher</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {profession === 'student' && (
                    <FormField control={signupForm.control} name="className" render={({ field }) => (
                      <FormItem><FormLabel>Class</FormLabel><FormControl><Input placeholder="Enter your class or grade" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  )}
                  <FormField control={signupForm.control} name="collegeName" render={({ field }) => (
                    <FormItem><FormLabel>College/University Name</FormLabel><FormControl><Input placeholder="Enter your college or university" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full !mt-4" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </Form>
              <p className="text-sm text-center text-muted-foreground mt-2">
                Already have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => handleFlip('login')}>Login</Button>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
