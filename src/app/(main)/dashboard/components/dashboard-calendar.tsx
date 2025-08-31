
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useTimetable } from "@/hooks/use-firestore";
import type { TimetableEntry } from "@/lib/types";
import { parseISO, isSameDay, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarCheck2 } from 'lucide-react';

export function DashboardCalendar() {
    const { entries: writtenExams, loading: writtenLoading } = useTimetable('written_exam');
    const { entries: practicalExams, loading: practicalLoading } = useTimetable('practical_exam');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const allExams = useMemo(() => [...writtenExams, ...practicalExams], [writtenExams, practicalExams]);

    const examDates = useMemo(() => {
        return allExams.map(exam => exam.date ? parseISO(exam.date) : new Date());
    }, [allExams]);

    const examsOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return allExams
            .filter(exam => exam.date && isSameDay(parseISO(exam.date), selectedDate))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [allExams, selectedDate]);
    
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return format(date, 'hh:mm a');
    }

    const loading = writtenLoading || practicalLoading;

    if (loading) {
        return (
             <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Exam Calendar</CardTitle>
                    <CardDescription>Your exam dates at a glance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Exam Calendar</CardTitle>
                <CardDescription>Your exam dates at a glance. Click on a date to see details.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="flex justify-center">
                     <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        modifiers={{ exams: examDates }}
                        modifiersClassNames={{
                            exams: 'bg-primary/20 text-primary-foreground rounded-full',
                        }}
                    />
                </div>
                <div className="flex flex-col h-[300px]">
                     <h4 className="font-semibold text-lg flex-shrink-0">
                        Exams on {selectedDate ? format(selectedDate, 'PPP') : '...'}
                    </h4>
                    <div className="flex-grow overflow-y-auto mt-2 pr-2">
                        {examsOnSelectedDate.length > 0 ? (
                            <div className="space-y-2">
                                {examsOnSelectedDate.map(exam => (
                                    <div key={exam.id} className="p-3 rounded-md border bg-muted/50">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-primary">{exam.subject}</p>
                                            <Badge variant={exam.type === 'written_exam' ? 'secondary' : 'outline'}>
                                                {exam.type === 'written_exam' ? 'Written' : 'Practical'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{formatTime(exam.startTime)} - {formatTime(exam.endTime)}</p>
                                         {exam.details && <p className="text-xs text-muted-foreground mt-1">Details: {exam.details}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                                <CalendarCheck2 className="h-10 w-10 mb-2"/>
                                <p>No exams scheduled for this day.</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
