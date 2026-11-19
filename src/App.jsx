import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import ProgressSummary from "./components/ProgressSummary";
import CategorySection from "./components/CategorySection";
import LoginModal from "./components/LoginModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import {
  INITIAL_CATEGORIES,
  getInitialTasksArray,
  calculateChecklistMetrics,
} from "./checklistData";
import {
  subscribeToSharedChecklist,
  updateTaskStatusInFirestore,
  updateTaskNoteInFirestore,
  addTaskToFirestore,
  deleteTaskFromFirestore,
  isFirebaseConfigured,
} from "./firebase";
import { AlertCircle } from "lucide-react";

export default function App() {
  const { currentUser, loading } = useAuth();

  // Tasks state
  const [tasks, setTasks] = useState(() => getInitialTasksArray());
  const [syncStatus, setSyncStatus] = useState("connected"); // 'connected' | 'syncing' | 'error' | 'local'
  const [isUpdating, setIsUpdating] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Collapsible categories state: map of categoryId -> boolean (true: open, false: closed)
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const initialState = {};
    INITIAL_CATEGORIES.forEach((cat, idx) => {
      initialState[cat.id] = idx < 2;
    });
    return initialState;
  });

  const allExpanded = useMemo(() => {
    return INITIAL_CATEGORIES.every((cat) => expandedCategories[cat.id]);
  }, [expandedCategories]);

  const handleToggleAllExpanded = () => {
    const nextState = !allExpanded;
    const updated = {};
    INITIAL_CATEGORIES.forEach((cat) => {
      updated[cat.id] = nextState;
    });
    setExpandedCategories(updated);
  };

  const handleToggleCategory = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Firestore Real-time Subscription (onSnapshot)
  useEffect(() => {
    if (!currentUser) return;

    if (isFirebaseConfigured) {
      setSyncStatus("syncing");
      const unsubscribe = subscribeToSharedChecklist(
        (data) => {
          if (data && Array.isArray(data.tasks)) {
            setTasks(data.tasks);
            setSyncStatus("connected");
            setSyncError("");
          }
        },
        (error) => {
          console.error("Firestore sync error:", error);
          setSyncStatus("error");
          setSyncError("Failed to sync with Firestore: " + (error.message || "Network issue"));
        }
      );

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else {
      // Local/Demo Mode synchronization across tabs
      setSyncStatus("local");
      const channel = typeof window !== "undefined" && "BroadcastChannel" in window
        ? new BroadcastChannel("amar_city_checklist_channel")
        : null;

      if (channel) {
        channel.onmessage = (event) => {
          if (event.data && event.data.type === "CHECKLIST_UPDATE") {
            setTasks(event.data.tasks);
          }
        };
      }

      const savedTasks = localStorage.getItem("amar_city_demo_tasks");
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch {
          // fallback
        }
      }

      return () => {
        if (channel) channel.close();
      };
    }
  }, [currentUser]);

  // Toggle task completed state
  const handleToggleTask = useCallback(
    async (taskId, nextCompleted) => {
      if (!currentUser) return;

      setIsUpdating(true);
      setSyncStatus("syncing");

      try {
        if (isFirebaseConfigured) {
          await updateTaskStatusInFirestore(
            taskId,
            nextCompleted,
            currentUser.email,
            tasks
          );
          setSyncStatus("connected");
        } else {
          const updated = tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  completed: nextCompleted,
                  updatedAt: new Date().toISOString(),
                  updatedBy: currentUser.email || "Demo User",
                }
              : t
          );
          setTasks(updated);
          localStorage.setItem("amar_city_demo_tasks", JSON.stringify(updated));

          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            const channel = new BroadcastChannel("amar_city_checklist_channel");
            channel.postMessage({ type: "CHECKLIST_UPDATE", tasks: updated });
            channel.close();
          }
          setSyncStatus("local");
        }
      } catch (err) {
        console.error("Failed to update task:", err);
        setSyncStatus("error");
        setSyncError(err.message || "Failed to update task.");
      } finally {
        setIsUpdating(false);
      }
    },
    [currentUser, tasks]
  );

  // Update task note/data value
  const handleUpdateTaskNote = useCallback(
    async (taskId, note) => {
      if (!currentUser) return;

      setIsUpdating(true);
      setSyncStatus("syncing");

      try {
        if (isFirebaseConfigured) {
          await updateTaskNoteInFirestore(
            taskId,
            note,
            currentUser.email,
            tasks
          );
          setSyncStatus("connected");
        } else {
          const updated = tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  note: note,
                  updatedAt: new Date().toISOString(),
                  updatedBy: currentUser.email || "Demo User",
                }
              : t
          );
          setTasks(updated);
          localStorage.setItem("amar_city_demo_tasks", JSON.stringify(updated));

          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            const channel = new BroadcastChannel("amar_city_checklist_channel");
            channel.postMessage({ type: "CHECKLIST_UPDATE", tasks: updated });
            channel.close();
          }
          setSyncStatus("local");
        }
      } catch (err) {
        console.error("Failed to update task note:", err);
        setSyncStatus("error");
        setSyncError(err.message || "Failed to save note.");
      } finally {
        setIsUpdating(false);
      }
    },
    [currentUser, tasks]
  );

  // Add a new task to a category
  const handleAddTask = useCallback(
    async (categoryId, title) => {
      if (!currentUser || !title.trim()) return;

      setIsUpdating(true);
      setSyncStatus("syncing");

      try {
        if (isFirebaseConfigured) {
          await addTaskToFirestore(categoryId, title.trim(), currentUser.email, tasks);
          setSyncStatus("connected");
        } else {
          const newTask = {
            id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
            categoryId,
            title: title.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.email || "Demo User",
          };
          const updated = [...tasks, newTask];
          setTasks(updated);
          localStorage.setItem("amar_city_demo_tasks", JSON.stringify(updated));

          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            const channel = new BroadcastChannel("amar_city_checklist_channel");
            channel.postMessage({ type: "CHECKLIST_UPDATE", tasks: updated });
            channel.close();
          }
          setSyncStatus("local");
        }
      } catch (err) {
        console.error("Failed to add task:", err);
        setSyncStatus("error");
        setSyncError("Failed to add task: " + err.message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [currentUser, tasks]
  );

  // Remove a task
  const handleConfirmDeleteTask = useCallback(
    async (taskId) => {
      if (!currentUser) return;

      setIsUpdating(true);
      setSyncStatus("syncing");

      try {
        if (isFirebaseConfigured) {
          await deleteTaskFromFirestore(taskId, currentUser.email, tasks);
          setSyncStatus("connected");
        } else {
          const updated = tasks.filter((t) => t.id !== taskId);
          setTasks(updated);
          localStorage.setItem("amar_city_demo_tasks", JSON.stringify(updated));

          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            const channel = new BroadcastChannel("amar_city_checklist_channel");
            channel.postMessage({ type: "CHECKLIST_UPDATE", tasks: updated });
            channel.close();
          }
          setSyncStatus("local");
        }
        setTaskToDelete(null);
      } catch (err) {
        console.error("Failed to delete task:", err);
        setSyncStatus("error");
        setSyncError("Failed to delete task: " + err.message);
      } finally {
        setIsUpdating(false);
      }
    },
    [currentUser, tasks]
  );

  // Group tasks by category
  const tasksByCategory = useMemo(() => {
    const map = {};
    INITIAL_CATEGORIES.forEach((cat) => {
      map[cat.id] = [];
    });

    tasks.forEach((task) => {
      if (map[task.categoryId]) {
        map[task.categoryId].push(task);
      } else {
        const matchedCat = INITIAL_CATEGORIES.find((cat) =>
          cat.tasks.some((t) => t.id === task.id)
        );
        if (matchedCat && map[matchedCat.id]) {
          map[matchedCat.id].push(task);
        }
      }
    });

    return map;
  }, [tasks]);

  // Overall metrics calculation
  const metrics = useMemo(() => {
    return calculateChecklistMetrics(tasks);
  }, [tasks]);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-600">
          Loading Amar City Launch Checklist...
        </p>
      </div>
    );
  }

  // Not logged in: Show Login Screen
  if (!currentUser) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main Top Header */}
      <Header syncStatus={syncStatus} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Sync error banner if any */}
        {syncError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start space-x-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Synchronization Alert</p>
              <p className="mt-0.5 text-red-700">{syncError}</p>
            </div>
            <button
              onClick={() => setSyncError("")}
              className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Progress Summary Component */}
        <ProgressSummary
          metrics={metrics}
          allExpanded={allExpanded}
          onToggleAllExpanded={handleToggleAllExpanded}
        />

        {/* 10 Collapsible Checklist Categories */}
        <div className="space-y-4">
          {INITIAL_CATEGORIES.map((category) => {
            const categoryTasks = tasksByCategory[category.id] || [];
            return (
              <CategorySection
                key={category.id}
                category={category}
                tasks={categoryTasks}
                isExpanded={Boolean(expandedCategories[category.id])}
                onToggleExpand={() => handleToggleCategory(category.id)}
                onToggleTask={handleToggleTask}
                onUpdateTaskNote={handleUpdateTaskNote}
                onAddTask={handleAddTask}
                onDeleteTask={(task) => setTaskToDelete(task)}
                isUpdating={isUpdating}
              />
            );
          })}
        </div>

        {/* Quick Bottom Summary Bar */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-600 shadow-2xs">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-gray-800">
              Total Tasks: {metrics.totalTasks} (Completed: {metrics.completedTasks}, Remaining: {metrics.remainingTasks})
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-emerald-700 font-bold">{metrics.percentage}% Completed</span>
          </div>
        </div>

      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-gray-200 py-5 text-center text-xs text-gray-500">
        <div className="max-w-5xl mx-auto px-4">
          <p className="font-medium text-gray-600">
            Amar City – Launch Checklist Application
          </p>
          <p className="mt-1 text-gray-400">
            Real-time multi-user team synchronization powered by Firebase Firestore
          </p>
        </div>
      </footer>

      {/* Confirmation Modal for Deleting a Task */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDeleteTask}
        isDeleting={isUpdating}
      />
    </div>
  );
}
