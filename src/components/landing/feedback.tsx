"use client"

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Feedback } from "@/lib/types";

const feedbackSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  feedback: z.string().min(10, { message: "Feedback must be at least 10 characters." }),
});


export function FeedbackSection() {
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      feedback: "",
    },
  });

  async function fetchFeedback() {
    try {
      const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(3));
      const querySnapshot = await getDocs(q);
      const feedbacks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback));
      setRecentFeedback(feedbacks);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  }

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function onSubmit(values: z.infer<typeof feedbackSchema>) {
    try {
      await addDoc(collection(db, "feedback"), {
        ...values,
        createdAt: new Date(),
      });
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your valuable feedback!",
      });
      form.reset();
      fetchFeedback(); // Refresh feedback list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <section id="feedback" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold text-center">
        What{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          People Are Saying
        </span>
      </h2>
      <p className="mt-4 mb-8 text-xl text-muted-foreground text-center">
        We value your feedback to make StudySpark even better.
      </p>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-2xl font-bold mb-4">Recent Feedback</h3>
          <div className="space-y-4">
            {recentFeedback.length > 0 ? (
              recentFeedback.map((fb) => (
                <Card key={fb.id}>
                  <CardHeader>
                    <CardTitle>{fb.name}</CardTitle>
                    <CardDescription>
                      {new Date(fb.createdAt.seconds * 1000).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>"{fb.feedback}"</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No feedback yet. Be the first!</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-4">Leave a Comment</h3>
          <Card>
            <CardHeader>
              <CardTitle>Share Your Thoughts</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback</FormLabel>
                        <FormControl>
                          <Textarea placeholder="What do you think about StudySpark?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Submit Feedback</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
