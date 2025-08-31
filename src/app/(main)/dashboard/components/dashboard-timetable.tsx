
"use client";

import { useTimetable } from "@/hooks/use-firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TimetableEntry } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { format } from "date-fns";


const daysOfWeek: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


export function DashboardTimetable() {
    const { entries, timeSlots, loading } = useTimetable('lecture');

    const findEntry = (day: string, timeSlot: { start: string, end: string }) => {
        return entries.find(e => e.day === day && e.startTime === timeSlot.start);
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return format(date, 'hh:mm a');
    }


    return (
        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div>
                    <CardTitle>Lecture Schedule</CardTitle>
                    <CardDescription>Your weekly classes at a glance.</CardDescription>
                </div>
                <Button asChild variant="secondary">
                    <Link href="/timetable">
                        View Full Timetable <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-[200px] w-full"/> : (
                <div className="border rounded-lg overflow-auto">
                    <Table className="min-w-max">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Time</TableHead>
                                {daysOfWeek.map(day => <TableHead key={day}>{day}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {timeSlots.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No time slots configured. Go to the Timetable page to add them.
                                    </TableCell>
                                </TableRow>
                            ) : timeSlots.map(slot => (
                                <TableRow key={`${slot.start}-${slot.end}`} className="h-16">
                                    <TableCell className="font-medium align-middle text-xs">{formatTime(slot.start)} - {formatTime(slot.end)}</TableCell>
                                    {daysOfWeek.map(day => {
                                        const entry = findEntry(day, slot);
                                        return (
                                            <TableCell key={day} className="p-1 align-middle">
                                                {entry ? (
                                                    <div className="bg-muted/70 rounded-md p-2 text-xs text-center">
                                                        <p className="font-bold text-primary truncate">{entry.subject}</p>
                                                        <p className="text-muted-foreground truncate">{entry.details}</p>
                                                    </div>
                                                ) : (
                                                   <div className="h-full w-full"></div>
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                )}
            </CardContent>
        </Card>
    );
}
