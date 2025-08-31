
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimetableGrid } from "./components/timetable-grid";
import { ExamTimetable } from "./components/exam-timetable";
import type { TimetableType } from "@/lib/types";

export default function TimetablePage() {
  const [activeTab, setActiveTab] = useState<TimetableType>("lecture");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Weekly Timetable</h1>
        <p className="text-muted-foreground">
          Manage your lectures, exams, and practicals.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TimetableType)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lecture">Lectures</TabsTrigger>
          <TabsTrigger value="written_exam">Written Exams</TabsTrigger>
          <TabsTrigger value="practical_exam">Practical Exams</TabsTrigger>
        </TabsList>
        <TabsContent value="lecture">
          <TimetableGrid type="lecture" title="Lecture Schedule" description="Your weekly class lectures." />
        </TabsContent>
        <TabsContent value="written_exam">
            <ExamTimetable type="written_exam" title="Written Exam Schedule" description="Upcoming written examinations." />
        </TabsContent>
        <TabsContent value="practical_exam">
            <ExamTimetable type="practical_exam" title="Practical Exam Schedule" description="Upcoming practical examinations and labs." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
