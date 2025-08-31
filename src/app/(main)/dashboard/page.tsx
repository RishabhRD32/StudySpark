
"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Flame, Target, CalendarClock } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react"
import { useDashboardStats, useAssignments } from "@/hooks/use-firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays, parseISO, format as formatDate } from 'date-fns';
import { DashboardTimetable } from "./components/dashboard-timetable";
import { DashboardCalendar } from "./components/dashboard-calendar";

function formatDueDate(dueDate: string) {
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
}

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const [dateState, setDateState] = useState(new Date());

  const upcomingAssignments = assignments
      .filter(a => a.status === 'Pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
      
  useEffect(() => {
    const interval = setInterval(() => setDateState(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userProfile?.firstName || 'Student'}!</h1>
          <p className="text-muted-foreground">Here's a summary of your academic progress.</p>
        </div>
        <div className="text-right mt-4 sm:mt-0">
           <p className="text-2xl font-bold text-muted-foreground tabular-nums tracking-wider">
             {dateState.toLocaleTimeString()}
          </p>
          <p className="text-sm text-muted-foreground">
            {dateState.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects In Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {statsLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.subjectsCompleted}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.averageScore}%</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {statsLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.studyStreak} days</div>}
          </CardContent>
        </Card>
      </div>

      <DashboardTimetable />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Don't miss these deadlines!</CardDescription>
          </CardHeader>
          <CardContent>
            {assignmentsLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {upcomingAssignments.length > 0 ? (
                        upcomingAssignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                                <TableCell className="font-medium">{assignment.title}</TableCell>
                                <TableCell className="text-muted-foreground">{assignment.subjectTitle}</TableCell>
                                <TableCell className="text-right">
                                <Badge variant="outline">{formatDueDate(assignment.dueDate)}</Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">No upcoming assignments.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            )}
             <Button asChild size="sm" className="mt-4 w-full">
              <Link href="/subjects">
                View All Assignments <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <DashboardCalendar />
      </div>

       <Card>
           <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Your study hours over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
           {statsLoading ? <Skeleton className="h-[300px] w-full"/> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyActivity}>
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
           )}
          </CardContent>
        </Card>
    </div>
  );
}
