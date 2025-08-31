
"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { aiTutorAssistance } from "@/ai/flows/ai-tutor-assistance";

const tutorSchema = z.object({
  question: z.string().min(10, { message: "Question must be at least 10 characters." }),
  courseMaterial: z.string().optional(),
});

export default function AITutorPage() {
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof tutorSchema>>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      question: "",
      courseMaterial: "",
    },
  });

  async function onSubmit(values: z.infer<typeof tutorSchema>) {
    setIsLoading(true);
    setAnswer("");
    try {
      const result = await aiTutorAssistance({ 
        question: values.question,
        courseMaterial: values.courseMaterial 
      });
      setAnswer(result.answer);
    } catch (error) {
      console.error(error);
      setAnswer("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">AI Tutor</h1>
        <p className="text-muted-foreground">Ask questions about your course material and get instant, intelligent answers.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ask a question about your course..."
                        className="resize-y"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="courseMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Material (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste relevant course material here for a more accurate answer..."
                        className="resize-y"
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Get Answer
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {(isLoading || answer) && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary"/>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                </div>
            ) : (
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: answer.replace(/\n/g, '<br />') }} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
