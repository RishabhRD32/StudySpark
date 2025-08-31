
import type { User } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  photoURL?: string | null;
  profession: 'student' | 'teacher';
  className?: string;
  collegeName?: string;
};

export type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    pass: string,
    profession: 'student' | 'teacher',
    className?: string,
    collegeName?: string
  ) => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: () => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
};


export type Subject = {
  id: string;
  userId: string;
  title: string;
  instructor: string;
};

export type Assignment = {
  id: string;
  subjectId: string;
  userId: string;
  title:string;
  dueDate: string; // ISO string
  status: 'Pending' | 'Completed';
  grade: number | null; 
  subjectTitle?: string;
};

export type StudyMaterial = {
  id: string;
  subjectId: string;
  userId: string;
  type: 'Notes' | 'Practicals' | 'PYQ';
  contentType: 'link' | 'text';
  title: string;
  content: string;
  isPublic: boolean;
  uploaderName: string;
  subjectTitle?: string; // Optional, populated for public search
};

export type Feedback = {
  id: string;
  name: string;
  feedback: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

export type DashboardStats = {
  subjectsCompleted: number;
  averageScore: number;
  studyStreak: number;
  weeklyActivity: { day: string; hours: number }[];
};

export type StudySession = {
    date: Timestamp;
    duration: number; // in hours
}

export type UserStats = {
    userId: string;
    studyStreak: number;
    lastStudiedDate: Timestamp;
    studySessions: StudySession[];
}

export type NewsArticle = {
  id: string;
  title: string;
  category: string;
  description: string;
  source: string;
  url: string;
  imageUrl: string | null;
};

export type TimetableType = 'lecture' | 'written_exam' | 'practical_exam';

export type TimetableEntry = {
    id: string;
    userId: string;
    type: TimetableType;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    subject: string;
    details: string; // Instructor name, exam details, etc.
    date?: string; // ISO String, for exams
}

export type TimeSlot = {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
};

export type UserTimetableSettings = {
  id: string;
  userId: string;
  timeSlots: TimeSlot[];
};
