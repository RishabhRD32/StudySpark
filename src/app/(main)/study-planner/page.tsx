
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubjects } from '@/hooks/use-firestore';
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateStudyPlan, GenerateStudyPlanOutput } from '@/ai/flows/study-plan-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const studyPlanFormSchema = z.object({
  subjectIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one subject.",
  }),
  weeklyHours: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Weekly hours must be a positive number.",
  }),
  deadlines: z.string().optional(),
});

type StudyPlanFormValues = z.infer<typeof studyPlanFormSchema>;

export default function StudyPlannerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GenerateStudyPlanOutput | null>(null);

  const { subjects, loading: subjectsLoading } = useSubjects();
  const { toast } = useToast();

  const form = useForm<StudyPlanFormValues>({
    resolver: zodResolver(studyPlanFormSchema),
    defaultValues: {
      subjectIds: [],
      weeklyHours: "",
      deadlines: "",
    },
  });

  const onSubmit = async (values: StudyPlanFormValues) => {
    setIsLoading(true);
    setGeneratedPlan(null);
    try {
      const selectedSubjects = subjects.filter(s => values.subjectIds.includes(s.id));
      const subjectTitles = selectedSubjects.map(s => s.title);

      const result = await generateStudyPlan({
        subjectTitles,
        weeklyHours: Number(values.weeklyHours),
        deadlines: values.deadlines,
      });

      setGeneratedPlan(result);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Plan",
        description: "The AI model might be overloaded. Please try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
            Study Planner
        </h1>
        <p className="text-muted-foreground">
            Generate a personalized study plan to ace your subjects.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="subjectIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base font-semibold">Select Subjects</FormLabel>
                    </div>
                    {subjectsLoading ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {subjects.map((subject) => (
                            <FormField
                            key={subject.id}
                            control={form.control}
                            name="subjectIds"
                            render={({ field }) => (
                                <FormItem
                                key={subject.id}
                                className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"
                                >
                                <FormControl>
                                    <Checkbox
                                    checked={field.value?.includes(subject.id)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...field.value, subject.id])
                                        : field.onChange(field.value?.filter((value) => value !== subject.id));
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">{subject.title}</FormLabel>
                                </FormItem>
                            )}
                            />
                        ))}
                        </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weeklyHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Weekly Study Hours</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total hours you can study per week" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadlines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Upcoming Exams/Deadlines (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any upcoming tests, exams, or assignment deadlines"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full text-lg" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" /> Generate Study Plan
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {(isLoading || generatedPlan) && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Study Plan</CardTitle>
            <CardDescription>Here is a balanced schedule to help you stay on track.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Day</TableHead>
                            <TableHead className="w-[200px]">Time</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Topic / Task</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {generatedPlan?.plan.map((session, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{session.day}</TableCell>
                                <TableCell>{session.time}</TableCell>
                                <TableCell>{session.subjectTitle}</TableCell>
                                <TableCell>
                                    <p className="font-semibold">{session.topic}</p>
                                    <p className="text-xs text-muted-foreground">{session.description}</p>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
