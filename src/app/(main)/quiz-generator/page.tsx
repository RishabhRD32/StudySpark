"use client"

import React, { useState } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, FileQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateQuiz, GenerateQuizOutput, GenerateQuizInput } from '@/ai/flows/quiz-generator-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const quizSetupSchema = z.object({
  sourceText: z.string().min(100, {
    message: "Source text must be at least 100 characters.",
  }),
  numQuestions: z.string(),
});

type QuizSetupFormValues = z.infer<typeof quizSetupSchema>;

const quizAnswersSchema = z.object({
  answers: z.array(z.object({
    question: z.string(),
    selectedIndex: z.string().optional(),
  })),
});
type QuizAnswersFormValues = z.infer<typeof quizAnswersSchema>;


export default function QuizGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  const [quizResults, setQuizResults] = useState<{ score: number; total: number; results: boolean[] } | null>(null);
  const { toast } = useToast();

  const setupForm = useForm<QuizSetupFormValues>({
    resolver: zodResolver(quizSetupSchema),
    defaultValues: { sourceText: "", numQuestions: "5" },
  });

  const answersForm = useForm<QuizAnswersFormValues>({
    resolver: zodResolver(quizAnswersSchema),
    defaultValues: { answers: [] }
  });

  const { fields } = useFieldArray({
    control: answersForm.control,
    name: "answers",
  });
  
  const onSetupSubmit = async (values: QuizSetupFormValues) => {
    setIsLoading(true);
    setGeneratedQuiz(null);
    setQuizResults(null);
    answersForm.reset({ answers: [] });
    try {
      const input: GenerateQuizInput = {
        sourceText: values.sourceText,
        numQuestions: parseInt(values.numQuestions, 10)
      }
      const result = await generateQuiz(input);
      setGeneratedQuiz(result);
      answersForm.reset({ 
        answers: result.questions.map(q => ({ question: q.questionText, selectedIndex: undefined })) 
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Quiz",
        description: "The AI model might be overloaded. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onAnswersSubmit = (values: QuizAnswersFormValues) => {
    if (!generatedQuiz) return;
    let score = 0;
    const results = generatedQuiz.questions.map((q, index) => {
      const isCorrect = Number(values.answers[index].selectedIndex) === q.correctAnswerIndex;
      if (isCorrect) {
        score++;
      }
      return isCorrect;
    });
    setQuizResults({ score, total: generatedQuiz.questions.length, results });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };
  
  const getBorderColor = (index: number) => {
    if (!quizResults) return "";
    return quizResults.results[index] ? "border-green-500" : "border-destructive";
  };
  
  const resetQuiz = () => {
    setGeneratedQuiz(null);
    setQuizResults(null);
    setupForm.reset();
    answersForm.reset();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Quiz Generator</h1>
        <p className="text-muted-foreground">Turn any text into a multiple-choice quiz to test your knowledge.</p>
      </div>

    {!generatedQuiz && (
      <Card>
          <CardHeader>
             <CardTitle>Create Your Quiz</CardTitle>
             <CardDescription>Paste your study material below and choose the number of questions.</CardDescription>
          </CardHeader>
        <CardContent>
          <Form {...setupForm}>
            <form onSubmit={setupForm.handleSubmit(onSetupSubmit)} className="space-y-6">
              <FormField
                control={setupForm.control}
                name="sourceText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Material</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your article, notes, or any text here..."
                        rows={12}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={setupForm.control}
                name="numQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of questions" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Quiz...</>
                ) : (
                  <><FileQuestion className="mr-2 h-4 w-4" /> Generate Quiz</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      )}

      {isLoading && (
        <Card>
            <CardHeader><CardTitle>Generating Your Quiz...</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </CardContent>
        </Card>
      )}

      {generatedQuiz && (
        <Card>
           <CardHeader>
             <CardTitle>Test Your Knowledge</CardTitle>
             <CardDescription>Answer the questions below to see how well you know the material.</CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...answersForm}>
                <form onSubmit={answersForm.handleSubmit(onAnswersSubmit)} className="space-y-8">
                  {fields.map((field, index) => (
                    <Card key={field.id} className={cn("p-4", quizResults && getBorderColor(index))}>
                      <FormField
                          control={answersForm.control}
                          name={`answers.${index}.selectedIndex`}
                          render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="font-bold text-base">{index + 1}. {generatedQuiz.questions[index].questionText}</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="space-y-2"
                                    disabled={!!quizResults}
                                  >
                                    {generatedQuiz.questions[index].options.map((option, optIndex) => (
                                      <FormItem key={optIndex} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value={String(optIndex)} />
                                        </FormControl>
                                        <FormLabel className="font-normal">{option}</FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                      />
                      {quizResults && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-md">
                           <p className="text-sm font-semibold">Correct Answer: {generatedQuiz.questions[index].options[generatedQuiz.questions[index].correctAnswerIndex]}</p>
                           <p className="text-xs text-muted-foreground">{generatedQuiz.questions[index].explanation}</p>
                        </div>
                      )}
                    </Card>
                  ))}

                  {!quizResults ? (
                    <Button type="submit" className="w-full">Check Answers</Button>
                  ) : (
                    <Button type="button" onClick={resetQuiz} className="w-full" variant="secondary">Create Another Quiz</Button>
                  )}
                </form>
             </Form>
          </CardContent>
        </Card>
      )}
      
      {quizResults && (
        <Alert>
            <Sparkles className="h-4 w-4"/>
            <AlertTitle>Quiz Complete!</AlertTitle>
            <AlertDescription>
                You scored {quizResults.score} out of {quizResults.total}.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
