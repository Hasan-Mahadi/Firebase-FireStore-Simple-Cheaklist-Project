import React, { useState } from "react";
import { ChevronDown, CheckCircle2, Plus, X } from "lucide-react";
import TaskItem from "./TaskItem";

export default function CategorySection({
  category,
  tasks,
  isExpanded,
  onToggleExpand,
  onToggleTask,
  onUpdateTaskNote,
  onAddTask,
  onDeleteTask,
  isUpdating,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addError, setAddError] = useState("");

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const isAllCompleted = totalTasks > 0 && completedTasks === totalTasks;
  const categoryPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setAddError("Task title cannot be empty");
      return;
    }
    setAddError("");
    try {
      await onAddTask(category.id, newTaskTitle.trim());
      setNewTaskTitle("");
      setIsAdding(false);
    } catch (err) {
      setAddError(err.message || "Failed to add task");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden transition-all mb-4">
      
      {/* Category Accordion Header */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={`w-full text-left px-4 sm:px-6 py-4 flex items-center justify-between transition-colors focus:outline-none focus:bg-gray-50/80 ${
          isExpanded ? "bg-gray-50/70 border-b border-gray-200" : "hover:bg-gray-50/50"
        }`}
      >
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 pr-2">
          {/* Number Badge */}
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 transition-colors ${
              isAllCompleted
                ? "bg-emerald-600 text-white"
                : completedTasks > 0
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {isAllCompleted ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              category.number
            )}
          </div>

          {/* Title and stats */}
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {category.title}
              </h3>
            </div>

            {/* Sub progress line */}
            <div className="flex items-center space-x-2.5 mt-1 text-xs text-gray-500 font-medium">
              <span className={completedTasks > 0 ? "text-emerald-700 font-semibold" : ""}>
                {completedTasks}/{totalTasks} completed
              </span>
              <span>•</span>
              <span>{categoryPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Right side: Mini progress bar + Expand toggle */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          
          {/* Mini progress bar on medium+ screens */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-20 sm:w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isAllCompleted ? "bg-emerald-500" : "bg-blue-600"
                }`}
                style={{ width: `${categoryPercentage}%` }}
              />
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full ${
              isAllCompleted
                ? "bg-emerald-100 text-emerald-800"
                : completedTasks > 0
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {completedTasks}/{totalTasks}
          </span>

          {/* Chevron */}
          <div
            className={`p-1 rounded-md text-gray-400 hover:text-gray-600 transition-transform duration-200 ${
              isExpanded ? "transform rotate-180" : ""
            }`}
          >
            <ChevronDown className="w-5 h-5" />
          </div>

        </div>
      </button>

      {/* Task List (when expanded) */}
      {isExpanded && (
        <div className="p-3 sm:p-5 bg-white space-y-2">
          {tasks.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-400 italic">
              No tasks in this category yet. Click below to add one.
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onUpdateNote={onUpdateTaskNote}
                onDelete={onDeleteTask}
                isUpdating={isUpdating}
              />
            ))
          )}

          {/* Add New Task Section */}
          <div className="pt-2">
            {!isAdding ? (
              <button
                type="button"
                onClick={() => {
                  setIsAdding(true);
                  setAddError("");
                }}
                className="w-full py-2 px-3 border border-dashed border-gray-300 hover:border-emerald-500 rounded-lg text-xs font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/40 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Add new task to {category.title}</span>
              </button>
            ) : (
              <form onSubmit={handleCreateTask} className="bg-slate-50 border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">
                    New Task for {category.title}:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewTaskTitle("");
                      setAddError("");
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. নতুন টাস্কের বিবরণ লিখুন..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />

                {addError && (
                  <p className="text-xs text-red-600">{addError}</p>
                )}

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewTaskTitle("");
                      setAddError("");
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim() || isUpdating}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-md transition-colors"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
