
"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User as UserIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  className: z.string().optional(),
  collegeName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, userProfile, changePassword, updateUserProfile, uploadProfilePicture, loading } = useAuth();
  const [isSendingReset, setIsSendingReset] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      className: "",
      collegeName: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        className: userProfile.className || "",
        collegeName: userProfile.collegeName || "",
      });
    }
  }, [userProfile, form]);
  
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  async function handlePasswordChange() {
    if (!user?.email) {
      toast({ variant: "destructive", title: "Error", description: "No email address found for your account." });
      return;
    }
    setIsSendingReset(true);
    try {
      await changePassword();
      toast({ title: "Check your email", description: "A password reset link has been sent to your email address." });
    } catch (error: any) {
       toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSendingReset(false);
    }
  }

  const handleProfileUpdate = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      let photoURL = userProfile?.photoURL;
      if (selectedFile) {
         photoURL = await uploadProfilePicture(selectedFile);
      }
      await updateUserProfile({ ...values, photoURL });
      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName ? firstName.charAt(0) : "";
    const last = lastName ? lastName.charAt(0) : "";
    return `${first}${last}`.toUpperCase();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and profile picture.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={preview || userProfile?.photoURL || undefined} alt="Profile Picture" />
                        <AvatarFallback className="text-3xl">
                            {userProfile ? getInitials(userProfile.firstName, userProfile.lastName) : <UserIcon size={40}/>}
                        </AvatarFallback>
                    </Avatar>
                     <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">Profile Picture</Label>
                        <Input id="picture" type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                        <p className="text-sm text-muted-foreground">Upload a new photo.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                 <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="className"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Class</FormLabel>
                            <FormControl><Input {...field} placeholder="Enter your class or grade" /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="collegeName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>College/University</FormLabel>
                            <FormControl><Input {...field} placeholder="Enter your college or university" /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
           </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
            <p className="text-muted-foreground">Change your password by requesting a reset link.</p>
            <Button variant="outline" onClick={handlePasswordChange} disabled={isSendingReset}>
                 {isSendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
