
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc, writeBatch, Timestamp, getDocs, orderBy, limit, arrayRemove, arrayUnion } from 'firebase/firestore';
import { useAuth } from '@/lib/auth/use-auth';
import type { Subject, Assignment, DashboardStats, UserStats, StudyMaterial, TimetableEntry, TimetableType, UserTimetableSettings, TimeSlot } from '@/lib/types';
import { useToast } from './use-toast';
import { subDays, format, startOfDay, isSameDay } from 'date-fns';

const defaultTimeSlots: TimeSlot[] = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
    { start: '17:00', end: '18:00' },
];


// --- Subjects ---

export function useSubjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userSubjects: Subject[] = [];
      querySnapshot.forEach((doc) => {
        userSubjects.push({ id: doc.id, ...doc.data() } as Subject);
      });
      setSubjects(userSubjects);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subjects: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch subjects.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const addSubject = async (subject: Omit<Subject, 'id' | 'userId'>) => {
    if (!user) throw new Error("User not authenticated");
    await addDoc(collection(db, 'subjects'), {
      ...subject,
      userId: user.uid,
    });
  };
  
  const updateSubject = async (subjectId: string, updates: Partial<Subject>) => {
    const docRef = doc(db, 'subjects', subjectId);
    await updateDoc(docRef, updates);
  };
  
  const deleteSubject = async (subjectId: string) => {
      if (!user) throw new Error("User not authenticated");
      const batch = writeBatch(db);

      // 1. Delete the subject itself
      const subjectRef = doc(db, 'subjects', subjectId);
      batch.delete(subjectRef);

      // 2. Delete associated assignments
      const assignmentsQuery = query(collection(db, 'assignments'), where('subjectId', '==', subjectId), where('userId', '==', user.uid));
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      assignmentsSnapshot.forEach(doc => batch.delete(doc.ref));

      // 3. Delete associated study materials
      const materialsQuery = query(collection(db, 'studyMaterials'), where('subjectId', '==', subjectId), where('userId', '==', user.uid));
      const materialsSnapshot = await getDocs(materialsQuery);
      materialsSnapshot.forEach(doc => batch.delete(doc.ref));
      
      // 4. Delete associated calendar events
      const eventsQuery = query(collection(db, 'studyPlanEvents'), where('subjectId', '==', subjectId), where('userId', '==', user.uid));
      const eventsSnapshot = await getDocs(eventsQuery);
      eventsSnapshot.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
  };

  return { subjects, loading, addSubject, updateSubject, deleteSubject };
}


export function useSubject(subjectId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !subjectId) {
      setSubject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, "subjects", subjectId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().userId === user.uid) {
            setSubject({ id: docSnap.id, ...docSnap.data() } as Subject);
        } else {
            console.log("No such document or unauthorized!");
            setSubject(null);
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching subject: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch subject details.' });
        setLoading(false);
    });

    return () => unsubscribe();
}, [user, subjectId, toast]);


  return { subject, loading };
}


// --- Assignments ---
export function useAssignments(subjectId?: string) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setAssignments([]);
            setLoading(false);
            return;
        }

        let isMounted = true;
        setLoading(true);
        
        let q;
        if (subjectId) {
            q = query(collection(db, 'assignments'), where('userId', '==', user.uid), where('subjectId', '==', subjectId));
        } else {
            q = query(collection(db, 'assignments'), where('userId', '==', user.uid));
        }
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userAssignments: Assignment[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                userAssignments.push({ 
                    id: doc.id, 
                    ...data,
                    dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate().toISOString() : data.dueDate,
                } as Assignment);
            });
            
            if (isMounted) {
                userAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                setAssignments(userAssignments);
                setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching assignments: ", error);
            if (isMounted) {
              toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch assignments.' });
              setLoading(false);
            }
        });

        return () => { 
            isMounted = false;
            unsubscribe();
        };
    }, [user, subjectId, toast]);

    const addAssignment = async (assignment: Omit<Assignment, 'id' | 'userId' | 'subjectTitle'>) => {
        if (!user || !assignment.subjectId) throw new Error("User or Subject ID not available");
        
        const subjectDoc = await getDoc(doc(db, "subjects", assignment.subjectId));
        if (!subjectDoc.exists()) throw new Error("Subject not found");

        const docToAdd = { 
            ...assignment, 
            userId: user.uid, 
            dueDate: new Date(assignment.dueDate),
            subjectTitle: subjectDoc.data().title,
            grade: assignment.grade || null,
        };
        await addDoc(collection(db, 'assignments'), docToAdd);
    };

    const updateAssignment = async (id: string, updates: Partial<Omit<Assignment, 'id' | 'userId'>>) => {
        const docRef = doc(db, 'assignments', id);
        const dataToUpdate: { [key: string]: any } = { ...updates };

        if (updates.dueDate) {
            dataToUpdate.dueDate = new Date(updates.dueDate);
        }

        await updateDoc(docRef, dataToUpdate);
    };

    const deleteAssignment = async (id: string) => {
        const docRef = doc(db, 'assignments', id);
        await deleteDoc(docRef);
    };

    return { assignments, loading, addAssignment, updateAssignment, deleteAssignment };
}

// --- Study Materials ---
export function useStudyMaterials(subjectId?: string) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setMaterials([]);
            setLoading(false);
            return;
        }
        
        if (!subjectId) {
          setLoading(false);
          return;
        }

        let isMounted = true;
        setLoading(true);
        const q = query(collection(db, 'studyMaterials'), where('userId', '==', user.uid), where('subjectId', '==', subjectId));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const subjectMaterials: StudyMaterial[] = [];
            querySnapshot.forEach((doc) => {
                subjectMaterials.push({ id: doc.id, ...doc.data() } as StudyMaterial);
            });
            if(isMounted) {
                subjectMaterials.sort((a, b) => a.title.localeCompare(b.title));
                setMaterials(subjectMaterials);
                setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching study materials: ", error);
             if (isMounted) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch study materials.' });
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe()
        };
    }, [user, subjectId, toast]);

    const addMaterial = async (material: Omit<StudyMaterial, 'id' | 'userId'>) => {
        if (!user || !material.subjectId) throw new Error("User or Subject ID not available");
         await addDoc(collection(db, 'studyMaterials'), { ...material, userId: user.uid });
    };

    const deleteMaterial = async (id: string) => {
        const docRef = doc(db, 'studyMaterials', id);
        await deleteDoc(docRef);
    };

    return { materials, loading, addMaterial, deleteMaterial };
}

export function usePublicMaterials(searchTerm: string) {
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!searchTerm || searchTerm.length < 3) {
            setMaterials([]);
            setLoading(false);
            return;
        }

        const fetchMaterials = async () => {
            setLoading(true);
            try {
                const materialsRef = collection(db, "studyMaterials");
                const q = query(materialsRef, where("isPublic", "==", true), limit(20));
                
                const querySnapshot = await getDocs(q);
                let fetchedMaterials: StudyMaterial[] = [];

                for (const materialDoc of querySnapshot.docs) {
                    const materialData = materialDoc.data() as StudyMaterial;
                    if (!materialData.subjectId) continue;
                    
                    const subjectDocRef = doc(db, "subjects", materialData.subjectId);
                    const subjectSnap = await getDoc(subjectDocRef);

                    if (subjectSnap.exists()) {
                        const subjectData = subjectSnap.data() as Subject;
                        materialData.subjectTitle = subjectData.title;

                        const searchTermLower = searchTerm.toLowerCase();
                        if (materialData.title.toLowerCase().includes(searchTermLower) || subjectData.title.toLowerCase().includes(searchTermLower)) {
                           fetchedMaterials.push({ ...materialData, id: materialDoc.id });
                        }
                    }
                }
                
                setMaterials(fetchedMaterials);
            } catch (error) {
                console.error("Error fetching public materials: ", error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchMaterials();
        }, 500); // Debounce to avoid querying on every keystroke

        return () => clearTimeout(debounceTimer);

    }, [searchTerm]);

    return { materials, loading };
}


// --- Dashboard ---
export function useDashboardStats() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({ subjectsCompleted: 0, averageScore: 0, studyStreak: 0, weeklyActivity: [] });
    const [loading, setLoading] = useState(true);
    const { assignments, loading: assignmentsLoading } = useAssignments();

    const calculateStats = useCallback((subjects: Subject[], userStats: UserStats | null) => {
        const subjectsCompleted = subjects.length; 
        
        const gradedAssignments = assignments.filter(a => a.status === 'Completed' && a.grade !== null && a.grade !== undefined);
        const averageScore = gradedAssignments.length > 0 
            ? gradedAssignments.reduce((acc, a) => acc + (a.grade || 0), 0) / gradedAssignments.length
            : 0;

        // Calculate Weekly Activity
        const weeklyActivity = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), i);
            return {
                day: format(date, 'EEE'),
                hours: 0,
            };
        }).reverse();

        if (userStats?.studySessions) {
            const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
            userStats.studySessions
                .filter(session => session.date.toDate() >= sevenDaysAgo)
                .forEach(session => {
                    const sessionDate = session.date.toDate();
                    weeklyActivity.forEach((dayData, index) => {
                        const dayDate = subDays(new Date(), 6 - index);
                        if(isSameDay(dayDate, sessionDate)) {
                            dayData.hours += session.duration;
                        }
                    });
                });
        }
        
        setStats({
            subjectsCompleted,
            averageScore: Math.round(averageScore),
            studyStreak: userStats?.studyStreak || 0,
            weeklyActivity,
        });
        setLoading(false);
    }, [assignments]);

    useEffect(() => {
        if (!user || assignmentsLoading) {
            if (!user) setLoading(false);
            return;
        }

        const subjectsQuery = query(collection(db, 'subjects'), where('userId', '==', user.uid));
        const userStatsDocRef = doc(db, 'userStats', user.uid);

        const unsubSubjects = onSnapshot(subjectsQuery, (subjectsSnapshot) => {
            const subjects = subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
            
            const unsubUserStats = onSnapshot(userStatsDocRef, (statsSnap) => {
                const userStats = statsSnap.exists() ? statsSnap.data() as UserStats : null;
                calculateStats(subjects, userStats);
            }, (err) => {
                console.error("Error fetching user stats", err);
                setLoading(false)
            });

            return () => unsubUserStats();
        }, (err) => {
             console.error("Error fetching subjects", err);
             setLoading(false);
        });

        // Update Study Streak and log a session on load
        (async () => {
            if (!user) return;
            const userStatsDocRef = doc(db, 'userStats', user.uid);
            try {
                 const statsSnap = await getDoc(userStatsDocRef);
                const batch = writeBatch(db);

                let newStreak = 1;
                if (statsSnap.exists()) {
                    const data = statsSnap.data() as UserStats;
                    const lastStudied = data.lastStudiedDate.toDate();
                    const today = new Date();
                    
                    if (!isSameDay(lastStudied, today)) {
                        if (isSameDay(lastStudied, subDays(today, 1))) {
                            newStreak = (data.studyStreak || 0) + 1; // Continue streak
                        }
                        // else, streak resets to 1 (already default)

                        // Update stats
                        batch.update(userStatsDocRef, {
                            studyStreak: newStreak,
                            lastStudiedDate: Timestamp.now(),
                        });
                        // Log a "study session" of 1 hour for today
                        const newSession = { date: Timestamp.now(), duration: 1 };
                        batch.update(userStatsDocRef, { studySessions: arrayUnion(newSession) });

                    }
                } else {
                    // Create new stats doc
                    batch.set(userStatsDocRef, {
                        userId: user.uid,
                        studyStreak: 1,
                        lastStudiedDate: Timestamp.now(),
                        studySessions: [{ date: Timestamp.now(), duration: 1 }],
                    });
                }
                
                await batch.commit();
            } catch (err) {
                 console.error("Error updating study streak", err);
            }
           
        })();


        return () => unsubSubjects();
    }, [user, assignmentsLoading, calculateStats]);
    
    return { stats, loading, assignments };
}

// --- Timetable ---
export function useTimetable(type?: TimetableType) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(defaultTimeSlots);
  const [settingsDocId, setSettingsDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect for fetching timetable entries
  useEffect(() => {
    if (!user || !type) {
      setEntries([]);
      if (!type) setLoading(false);
      return;
    }

    setLoading(true);
    let q;
    if (type === 'lecture') {
        q = query(
          collection(db, 'timetableEntries'),
          where('userId', '==', user.uid),
          where('type', '==', type)
        );
    } else {
         q = query(
          collection(db, 'timetableEntries'),
          where('userId', '==', user.uid),
          where('type', '==', type),
          orderBy('date')
        );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const timetableEntries: TimetableEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        timetableEntries.push({ 
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
        } as TimetableEntry);
      });
      setEntries(timetableEntries);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${type} timetable: `, error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch timetable.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, type, toast]);
  
    // Effect for fetching timetable settings (time slots)
  useEffect(() => {
    if (!user) {
        setTimeSlots(defaultTimeSlots);
        return;
    }

    const q = query(collection(db, 'userTimetableSettings'), where('userId', '==', user.uid), limit(1));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            // No settings doc, create one with defaults
            addDoc(collection(db, 'userTimetableSettings'), {
                userId: user.uid,
                timeSlots: defaultTimeSlots
            });
            setTimeSlots(defaultTimeSlots);
            setLoading(false);
        } else {
            const doc = snapshot.docs[0];
            setSettingsDocId(doc.id);
            const data = doc.data() as UserTimetableSettings;
            const sortedSlots = data.timeSlots.sort((a,b) => a.start.localeCompare(b.start));
            setTimeSlots(sortedSlots);
        }
         // This loading state might be contended by the other useEffect
        if(type === undefined) setLoading(false);
    }, (error) => {
        console.error("Error fetching timetable settings: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch timetable settings.' });
        setLoading(false);
    });
    
    return () => unsubscribe();

  }, [user, toast, type]);


  const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id' | 'userId'>) => {
    if (!user) throw new Error("User not authenticated");
    const dataToAdd: { [key: string]: any } = {
      ...entry,
      userId: user.uid,
    };
    if (entry.date) {
        dataToAdd.date = new Date(entry.date);
    }
    await addDoc(collection(db, 'timetableEntries'), dataToAdd);
  };

  const updateTimetableEntry = async (id: string, updates: Partial<TimetableEntry>) => {
    const docRef = doc(db, 'timetableEntries', id);
    const dataToUpdate: { [key: string]: any } = { ...updates };
     if (updates.date) {
        dataToUpdate.date = new Date(updates.date);
    }
    await updateDoc(docRef, dataToUpdate);
  };

  const deleteTimetableEntry = async (id: string) => {
    const docRef = doc(db, 'timetableEntries', id);
    await deleteDoc(docRef);
  };
  
  const addTimeSlot = async (newSlot: TimeSlot) => {
    if (!user || !settingsDocId) return;
    const docRef = doc(db, 'userTimetableSettings', settingsDocId);
    await updateDoc(docRef, {
      timeSlots: arrayUnion(newSlot)
    });
  };

  const deleteTimeSlot = async (slotToDelete: TimeSlot) => {
    if (!user || !settingsDocId) throw new Error("User or settings not found");

    const batch = writeBatch(db);

    // 1. Delete associated timetable entries
    const entriesQuery = query(
        collection(db, 'timetableEntries'),
        where('userId', '==', user.uid),
        where('type', '==', 'lecture'),
        where('startTime', '==', slotToDelete.start)
    );
    const entriesSnapshot = await getDocs(entriesQuery);
    entriesSnapshot.forEach(doc => {
      // Additional check to be safe, though query should handle it
      if (doc.data().endTime === slotToDelete.end) {
        batch.delete(doc.ref);
      }
    });

    // 2. Remove the time slot from the settings document
    const settingsRef = doc(db, 'userTimetableSettings', settingsDocId);
    batch.update(settingsRef, {
      timeSlots: arrayRemove(slotToDelete)
    });

    // 3. Commit the batch
    await batch.commit();
  };


  return { entries, loading, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry, timeSlots, addTimeSlot, deleteTimeSlot };
}



    
