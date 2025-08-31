
"use client";

import { useState } from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from "date-fns";
import { useSubjects, useTimetable } from "@/hooks/use-firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, PlusCircle, Edit, Trash2, CalendarIcon } from 'lucide-react';
import type { TimetableEntry } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

interface ExamTimetableProps {
    type: 'written_exam' | 'practical_exam';
    title: string;
    description: string;
}

const examSchema = z.object({
    date: z.date({ required_error: "A date is required." }),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    subject: z.string().min(1, "Subject is required"),
    details: z.string().optional(),
});

export function ExamTimetable({ type, title, description }: ExamTimetableProps) {
    const { entries, loading, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } = useTimetable(type);
    const { subjects, loading: subjectsLoading } = useSubjects();
    const { toast } = useToast();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

    const form = useForm<z.infer<typeof examSchema>>({
        resolver: zodResolver(examSchema),
    });

    const handleOpenModal = (entry: TimetableEntry | null = null) => {
        setEditingEntry(entry);
        if (entry) {
            form.reset({
                date: entry.date ? new Date(entry.date) : new Date(),
                startTime: entry.startTime,
                endTime: entry.endTime,
                subject: entry.subject,
                details: entry.details,
            });
        } else {
            form.reset({
                date: new Date(),
                startTime: '09:00',
                endTime: '12:00',
                subject: '',
                details: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (values: z.infer<typeof examSchema>) => {
        try {
            const newEntry = {
                type,
                date: values.date.toISOString(),
                day: format(values.date, 'EEEE') as TimetableEntry['day'],
                startTime: values.startTime,
                endTime: values.endTime,
                subject: values.subject,
                details: values.details || values.subject, // Using subject as details for simplicity if details are not provided
            };

            if (editingEntry) {
                await updateTimetableEntry(editingEntry.id, newEntry);
                toast({ title: "Success", description: "Exam entry updated." });
            } else {
                await addTimetableEntry(newEntry as Omit<TimetableEntry, 'id' | 'userId'>);
                toast({ title: "Success", description: "Exam entry added." });
            }
            setIsModalOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save the entry." });
        }
    };
    
    const handleDelete = async (id: string) => {
       try {
            await deleteTimetableEntry(id);
            toast({ title: "Success", description: "Exam entry deleted." });
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "Could not delete the entry." });
        }
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return format(date, 'hh:mm a');
    }

    if (loading) {
        return <Skeleton className="h-[300px] w-full" />
    }

    return (
        <>
            <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Exam
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.length > 0 ? entries.map(entry => (
                                <TableRow key={entry.id}>
                                    <TableCell>{entry.date ? format(new Date(entry.date), "PPP") : 'N/A'}</TableCell>
                                    <TableCell>{entry.day}</TableCell>
                                    <TableCell>{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</TableCell>
                                    <TableCell>{entry.subject}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(entry)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the entry for {entry.subject}.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">No exams scheduled.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? 'Edit' : 'Add'} Exam Entry</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                            <FormField control={form.control} name="date" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                            )} />
                             <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="startTime" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                 <FormField control={form.control} name="endTime" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             <FormField control={form.control} name="subject" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger>
                                            {subjectsLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <SelectValue placeholder="Select a subject" />}
                                        </SelectTrigger></FormControl>
                                        <SelectContent>
                                            {subjects.map(s => <SelectItem key={s.id} value={s.title}>{s.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="details" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Details (e.g. Room Number)</FormLabel>
                                    <FormControl><Input placeholder="Enter extra details" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                     {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                     Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
