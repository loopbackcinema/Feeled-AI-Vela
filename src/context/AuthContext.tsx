import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useSessionStore } from '../stores/sessionStore';
import { useStudentStore } from '../stores/studentStore';
import { initializeStudentMemory } from '../services/memoryService';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const resetSession = useSessionStore(state => state.reset);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        const previousUser = user;
        setUser(firebaseUser);

        if (!firebaseUser && previousUser) {
          resetSession();
          useStudentStore.setState({
            board: 'Tamil Nadu State Board (Samacheer)',
            standard: '10th',
            subject: 'Science',
            language: 'English',
            learningMode: 'Senior',
            goal: 'Exam',
          });
        }

        if (firebaseUser) {
          // Bootstrap memory engine — non-blocking
          initializeStudentMemory(firebaseUser);

          // Check/Create user profile in Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          try {
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              setUserProfile(userSnap.data());
              // Update last login
              await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
            } else {
              // Create new student profile
              const newProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: 'student', // Default role
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
              };
              await setDoc(userRef, newProfile);
              setUserProfile(newProfile);
            }
          } catch (firestoreError) {
            console.error("Firestore profile error:", firestoreError);
            // Even if firestore fails, we have the firebaseUser
            setUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'student' // Fallback
            });
          }
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userProfile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
