"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ScrollText, Sparkles } from "lucide-react";
import { summarizeText } from "@/ai/flows/text-summarization";

const summarizerSchema = z.object({
  text: z.string().min(100, { message: "Text must be at least 100 characters to summarize." }),
});

export default function AISummarizerPage() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof summarizerSchema>>({
    resolver: zodResolver(summarizerSchema),
    defaultValues: {
      text: "",
    },
  });

  async function onSubmit(values: z.infer<typeof summarizerSchema>) {
    setIsLoading(true);
    setSummary("");
    try {
      const result = await summarizeText({ text: values.text });
      setSummary(result.summary);
    } catch (error) {
      console.error(error);
      setSummary("Sorry, I encountered an error while summarizing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">AI Summarizer</h1>
        <p className="text-muted-foreground">Paste any long text to get a concise summary.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Text to Summarize</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your article, notes, or any long text here..."
                        className="resize-y"
                        rows={15}
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...
                  </>
                ) : (
                  <>
                    <ScrollText className="mr-2 h-4 w-4" /> Generate Summary
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {(isLoading || summary) && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary"/>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                </div>
            ) : (
                <div className="prose dark:prose-invert max-w-none">{summary}</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
