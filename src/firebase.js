import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getInitialTasksArray } from "./checklistData";

// Firebase configuration from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase credentials are provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your_api_key_here" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "your_project_id"
);

// Initialize Firebase App
const app = !getApps().length && isFirebaseConfigured
  ? initializeApp(firebaseConfig)
  : getApps().length
  ? getApps()[0]
  : null;

// Export Auth & Firestore instances
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Shared Firestore document reference for the entire team
export const CHECKLIST_COLLECTION = "checklists";
export const SHARED_DOC_ID = "amar-city-launch";

/**
 * Real-time listener for the shared checklist document.
 * Automatically initializes the document with initial 77 tasks if it doesn't exist yet.
 * @param {Function} onDataCallback - called with updated tasks array
 * @param {Function} onErrorCallback - called on error
 * @returns {Function} unsubscribe function
 */
export const subscribeToSharedChecklist = (onDataCallback, onErrorCallback) => {
  if (!db) {
    return () => {};
  }

  const docRef = doc(db, CHECKLIST_COLLECTION, SHARED_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.tasks)) {
          onDataCallback({
            tasks: data.tasks,
            lastUpdated: data.lastUpdated,
            updatedBy: data.updatedBy,
          });
        } else {
          const initialTasks = getInitialTasksArray();
          await setDoc(docRef, {
            title: "Amar City – Launch Checklist",
            tasks: initialTasks,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            updatedBy: "System (Initialization)",
          });
          onDataCallback({ tasks: initialTasks, updatedBy: "System" });
        }
      } else {
        try {
          const initialTasks = getInitialTasksArray();
          await setDoc(docRef, {
            title: "Amar City – Launch Checklist",
            tasks: initialTasks,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            updatedBy: "System (First-time Setup)",
          });
          onDataCallback({ tasks: initialTasks, updatedBy: "System" });
        } catch (initErr) {
          console.error("Error initializing checklist document:", initErr);
          if (onErrorCallback) onErrorCallback(initErr);
        }
      }
    },
    (error) => {
      console.error("Error in onSnapshot listener:", error);
      if (onErrorCallback) onErrorCallback(error);
    }
  );

  return unsubscribe;
};

/**
 * Toggles a single task completed status in the shared Firestore document.
 * @param {string} taskId - The ID of the task
 * @param {boolean} nextCompleted - The new status
 * @param {string} userEmail - The email of the team member making the change
 * @param {Array} currentTasks - The current tasks array to apply the change to
 */
export const updateTaskStatusInFirestore = async (taskId, nextCompleted, userEmail, currentTasks) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized. Please configure .env file.");
  }

  const docRef = doc(db, CHECKLIST_COLLECTION, SHARED_DOC_ID);

  const updatedTasks = currentTasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        completed: nextCompleted,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail || "Anonymous Team Member",
      };
    }
    return task;
  });

  await updateDoc(docRef, {
    tasks: updatedTasks,
    lastUpdated: serverTimestamp(),
    updatedBy: userEmail || "Team Member",
  });

  return updatedTasks;
};

/**
 * Adds a new task to the shared Firestore document.
 * @param {string} categoryId - The category ID
 * @param {string} title - The title of the task
 * @param {string} userEmail - The email of the team member
 * @param {Array} currentTasks - The current tasks array
 */
export const addTaskToFirestore = async (categoryId, title, userEmail, currentTasks) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized.");
  }

  const docRef = doc(db, CHECKLIST_COLLECTION, SHARED_DOC_ID);
  const newTask = {
    id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    categoryId,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail || "Team Member",
  };

  const updatedTasks = [...currentTasks, newTask];

  await updateDoc(docRef, {
    tasks: updatedTasks,
    lastUpdated: serverTimestamp(),
    updatedBy: `${userEmail || "Team Member"} (Added: ${title.trim().substring(0, 30)})`,
  });

  return updatedTasks;
};

/**
 * Removes a task from the shared Firestore document.
 * @param {string} taskId - The ID of the task to delete
 * @param {string} userEmail - The email of the team member
 * @param {Array} currentTasks - The current tasks array
 */
export const deleteTaskFromFirestore = async (taskId, userEmail, currentTasks) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized.");
  }

  const docRef = doc(db, CHECKLIST_COLLECTION, SHARED_DOC_ID);
  const updatedTasks = currentTasks.filter((t) => t.id !== taskId);

  await updateDoc(docRef, {
    tasks: updatedTasks,
    lastUpdated: serverTimestamp(),
    updatedBy: `${userEmail || "Team Member"} (Deleted task)`,
  });

  return updatedTasks;
};

/**
 * Resets the entire checklist back to initial state (8 completed tasks, 69 pending).
 * @param {string} userEmail - The email of the team member resetting
 */
export const resetChecklistInFirestore = async (userEmail) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized.");
  }

  const docRef = doc(db, CHECKLIST_COLLECTION, SHARED_DOC_ID);
  const initialTasks = getInitialTasksArray();

  await setDoc(docRef, {
    title: "Amar City – Launch Checklist",
    tasks: initialTasks,
    lastUpdated: serverTimestamp(),
    updatedBy: `${userEmail || "Team Member"} (Reset)`,
  });

  return initialTasks;
};
