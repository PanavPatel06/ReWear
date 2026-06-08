'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, type User } from 'firebase/auth';
import { auth, isMockMode } from '@/lib/firebase/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { createUserProfile } from '@/lib/firebase/firestore';
import { mockGetUserByEmail, mockSaveUser } from '@/lib/firebase/mock-actions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, fullName: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      const stored = localStorage.getItem('mock_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, fullName: string) => {
    if (isMockMode) {
      const existing = await mockGetUserByEmail(email);
      if (existing) {
        throw new Error("This email is already in use.");
      }
      const uid = `mock_user_${Date.now()}`;
      const mockUserObj = {
        uid,
        email,
        displayName: fullName,
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => '',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({})
      } as any;

      await mockSaveUser(uid, {
        uid,
        email,
        name: fullName,
        points: 1000,
        address: '',
        password
      });

      localStorage.setItem('mock_user', JSON.stringify(mockUserObj));
      setUser(mockUserObj);
      return { user: mockUserObj };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
      // Create a user profile document in Firestore
      await createUserProfile(userCredential.user.uid, {
        email: userCredential.user.email!,
        name: fullName,
        points: 1000, // Starting points
        address: '',
      });
      setUser(auth.currentUser);
    }
    return userCredential;
  };

  const login = async (email: string, password: string) => {
    if (isMockMode) {
      const existing = await mockGetUserByEmail(email);
      if (!existing || existing.password !== password) {
        throw new Error("Invalid email or password.");
      }
      const mockUserObj = {
        uid: existing.uid,
        email: existing.email,
        displayName: existing.name,
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => '',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({})
      } as any;

      localStorage.setItem('mock_user', JSON.stringify(mockUserObj));
      setUser(mockUserObj);
      return { user: mockUserObj };
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (isMockMode) {
      localStorage.removeItem('mock_user');
      setUser(null);
      return;
    }
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div className="w-full h-screen flex justify-center items-center"><Skeleton className="h-20 w-1/3" /></div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
