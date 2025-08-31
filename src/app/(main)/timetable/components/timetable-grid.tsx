
"use client";

import { useState } from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useSubjects, useTimetable } from "@/hooks/use-firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { TimetableEntry, TimetableType, TimeSlot } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface TimetableGridProps {
    type: TimetableType;
    title: string;
    description: string;
}

const daysOfWeek: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timetableSchema = z.object({
    day: z.enum(daysOfWeek),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    subject: z.string().min(1, "Subject is required"),
    details: z.string().min(1, "Details are required"),
});

const timeSlotSchema = z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
}).refine(data => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
});

export function TimetableGrid({ type, title, description }: TimetableGridProps) {
    const { entries, loading: entriesLoading, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry, timeSlots, loading: settingsLoading, addTimeSlot, deleteTimeSlot } = useTimetable(type);
    const { subjects, loading: subjectsLoading } = useSubjects();
    const { toast } = useToast();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTimeSlotModalOpen, setTimeSlotModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

    const form = useForm<z.infer<typeof timetableSchema>>({
        resolver: zodResolver(timetableSchema),
    });

    const timeSlotForm = useForm<z.infer<typeof timeSlotSchema>>({
        resolver: zodResolver(timeSlotSchema),
        defaultValues: { startTime: '18:00', endTime: '19:00' },
    });

    const handleOpenModal = (entry: TimetableEntry | null = null, day?: TimetableEntry['day'], time?: string) => {
        setEditingEntry(entry);
        if (entry) {
            form.reset({
                day: entry.day,
                startTime: entry.startTime,
                endTime: entry.endTime,
                subject: entry.subject,
                details: entry.details,
            });
        } else {
            form.reset({
                day: day || 'Monday',
                startTime: time || '08:00',
                endTime: time ? `${String(parseInt(time.split(':')[0]) + 1).padStart(2, '0')}:00` : '09:00',
                subject: '',
                details: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (values: z.infer<typeof timetableSchema>) => {
        try {
            if (editingEntry) {
                await updateTimetableEntry(editingEntry.id, { ...values });
                toast({ title: "Success", description: "Timetable entry updated." });
            } else {
                await addTimetableEntry({ ...values, type });
                toast({ title: "Success", description: "Timetable entry added." });
            }
            setIsModalOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save the entry." });
        }
    };
    
    const handleDelete = async (id: string) => {
       try {
            await deleteTimetableEntry(id);
            toast({ title: "Success", description: "Timetable entry deleted." });
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "Could not delete the entry." });
        }
    };

    const findEntry = (day: string, timeSlot: { start: string, end: string }) => {
        return entries.find(e => e.day === day && e.startTime === timeSlot.start);
    };
    
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return format(date, 'hh:mm a');
    }

    const handleDeleteTimeSlot = async (slot: TimeSlot) => {
        try {
            await deleteTimeSlot(slot);
            toast({ title: "Success", description: "Time slot removed." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not remove time slot." });
        }
    };

    const handleAddTimeSlot = async (values: z.infer<typeof timeSlotSchema>) => {
        try {
            await addTimeSlot({ start: values.startTime, end: values.endTime });
            toast({ title: "Success", description: "Time slot added." });
            setTimeSlotModalOpen(false);
            timeSlotForm.reset();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not add time slot." });
        }
    }

    const loading = entriesLoading || settingsLoading;

    if (loading) {
        return <Skeleton className="h-[500px] w-full" />
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
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Entry
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-auto">
                        <Table className="min-w-max">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Time</TableHead>
                                    {daysOfWeek.map(day => <TableHead key={day}>{day}</TableHead>)}
                                    <TableHead className="w-[60px] text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {timeSlots.map((slot, index) => (
                                    <TableRow key={`${slot.start}-${slot.end}`} className="h-20">
                                        <TableCell className="font-medium align-top pt-3">{formatTime(slot.start)} - {formatTime(slot.end)}</TableCell>
                                        {daysOfWeek.map(day => {
                                            const entry = findEntry(day, slot);
                                            return (
                                                <TableCell key={day} className="p-1 align-top group relative">
                                                    {entry ? (
                                                        <Card className="bg-muted/50 h-full p-2 text-xs flex flex-col justify-between">
                                                            <div>
                                                                <p className="font-bold text-primary">{entry.subject}</p>
                                                                <p className="text-muted-foreground">{entry.details}</p>
                                                            </div>
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 justify-end">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenModal(entry)}>
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This will permanently delete the entry for {entry.subject} on {entry.day}.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </Card>
                                                    ) : (
                                                        <Button variant="ghost" className="h-full w-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={() => handleOpenModal(null, day, slot.start)}>
                                                            <PlusCircle className="h-5 w-5 text-muted-foreground" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell className="text-right align-top pt-2 pr-2">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Time Slot?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                           This will remove the {formatTime(slot.start)} - {formatTime(slot.end)} time slot from the schedule. Any entries in this slot will also be removed. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteTimeSlot(slot)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" onClick={() => setTimeSlotModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Time Slot
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? 'Edit' : 'Add'} Timetable Entry</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                            <FormField control={form.control} name="day" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Day</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>{daysOfWeek.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                    </Select>
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
                                    <FormLabel>Subject / Title</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger>
                                            {subjectsLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <SelectValue placeholder="Select a subject" />}
                                        </SelectTrigger></FormControl>
                                        <SelectContent>
                                            {subjects.map(s => <SelectItem key={s.id} value={s.title}>{s.title}</SelectItem>)}
                                            <SelectItem value="Lunch Break">Lunch Break</SelectItem>
                                            <SelectItem value="Self-Study">Self-Study</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="details" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{type === 'lecture' ? 'Instructor' : 'Details'}</FormLabel>
                                    <FormControl><Input placeholder={type === 'lecture' ? 'Enter instructor name' : 'Enter exam details'} {...field} /></FormControl>
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
            
            <Dialog open={isTimeSlotModalOpen} onOpenChange={setTimeSlotModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Time Slot</DialogTitle>
                        <DialogDescription>Add a new row to the timetable.</DialogDescription>
                    </DialogHeader>
                     <Form {...timeSlotForm}>
                        <form onSubmit={timeSlotForm.handleSubmit(handleAddTimeSlot)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={timeSlotForm.control} name="startTime" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                 <FormField control={timeSlotForm.control} name="endTime" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setTimeSlotModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={timeSlotForm.formState.isSubmitting}>
                                     {timeSlotForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                     Add Slot
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
