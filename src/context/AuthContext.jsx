import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Firebase config is missing or incomplete
      // Check if there was a demo user in session
      const savedDemoUser = sessionStorage.getItem("amar_city_demo_user");
      if (savedDemoUser) {
        try {
          setCurrentUser(JSON.parse(savedDemoUser));
        } catch {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setAuthError("");
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setCurrentUser(userCredential.user);
        return userCredential.user;
      } catch (error) {
        let message = "Invalid email or password.";
        if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
          message = "Invalid team credentials. Please verify your email and password.";
        } else if (error.code === "auth/too-many-requests") {
          message = "Access temporarily blocked due to many failed attempts. Try again later.";
        } else if (error.code === "auth/invalid-email") {
          message = "Please enter a valid email address.";
        } else {
          message = error.message;
        }
        setAuthError(message);
        throw new Error(message);
      }
    } else {
      // Offline / Local Demo mode when Firebase credentials are not yet entered in .env
      if (!email || !password) {
        const message = "Please enter both email and password.";
        setAuthError(message);
        throw new Error(message);
      }
      const demoUser = {
        uid: "demo-user-" + Date.now(),
        email: email,
        displayName: email.split("@")[0],
        isDemo: true,
      };
      sessionStorage.setItem("amar_city_demo_user", JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  const logout = async () => {
    setAuthError("");
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
        setCurrentUser(null);
      } catch (error) {
        console.error("Logout error:", error);
      }
    } else {
      sessionStorage.removeItem("amar_city_demo_user");
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    authError,
    setAuthError,
    login,
    logout,
    isFirebaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
