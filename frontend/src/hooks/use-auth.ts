import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  User, 
  onAuthStateChanged, 
  signInAnonymously as firebaseSignInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  updateProfile,
} from 'firebase/auth';

import { syncLocalHistory } from '@/lib/scan-history';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<User>;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser ? `${currentUser.email} (Anon: ${currentUser.isAnonymous})` : 'No user');
      setUser(currentUser);
      setLoading(false);
      
      // Auto-sync local history to firestore upon authenticating
      if (currentUser && !currentUser.isAnonymous) {
        syncLocalHistory(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    const result = await firebaseSignInAnonymously(auth);
    return result.user;
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && result.user) {
      await updateProfile(result.user, { displayName: name });
    }
    return result.user;
  };

  const sendMagicLink = async (email: string) => {
    const actionCodeSettings = {
      url: window.location.origin + '/verify-email',
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return React.createElement(AuthContext.Provider, { 
    value: { 
      user, 
      loading, 
      signInAnonymously, 
      signInWithGoogle, 
      loginWithEmail, 
      registerWithEmail, 
      sendMagicLink,
      signOut 
    } 
  }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
