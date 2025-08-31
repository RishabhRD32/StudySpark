
"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "../firebase";
import { AuthContext } from "./auth-context";
import type { UserProfile } from "../types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile);
          } else {
             setUserProfile(null); 
          }
           setLoading(false);
        }, (error) => {
             console.error("Firestore error fetching user profile:", error);
            toast({
                variant: "destructive",
                title: "Firestore Error",
                description: "Could not fetch user profile.",
            });
            setUserProfile(null);
            setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [toast]);

  const login = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    router.push('/dashboard');
    return userCredential;
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    pass: string,
    profession: 'student' | 'teacher',
    className?: string,
    collegeName?: string,
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUserProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      firstName,
      lastName,
      profession,
      className,
      collegeName,
      photoURL: null,
    };
    await setDoc(doc(db, "users", userCredential.user.uid), newUserProfile);
    setUserProfile(newUserProfile); 
    router.push('/dashboard');
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("Not authenticated");
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, updates);
    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
  };
  
  const changePassword = async () => {
    if (!user?.email) throw new Error("No user email found.");
    await sendPasswordResetEmail(auth, user.email);
  }

  const uploadProfilePicture = async (file: File) => {
    if (!user) throw new Error("Not authenticated");
    const storage = getStorage();
    const storageRef = ref(storage, `profile-pictures/${user.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);
    return photoURL;
  }

  const value = { user, userProfile, loading, login, signup, logout, updateUserProfile, changePassword, uploadProfilePicture };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
