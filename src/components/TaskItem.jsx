import React from "react";
import { Check, Trash2 } from "lucide-react";

export default function TaskItem({ task, onToggle, onDelete, isUpdating }) {
  const isCompleted = Boolean(task.completed);

  return (
    <div
      onClick={() => onToggle(task.id, !isCompleted)}
      className={`group flex items-start space-x-3.5 p-3 sm:px-4 sm:py-3 rounded-lg border transition-all duration-150 cursor-pointer select-none ${
        isCompleted
          ? "bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50"
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/70"
      }`}
    >
      {/* Checkbox */}
      <div className="pt-0.5 flex-shrink-0">
        <button
          type="button"
          aria-checked={isCompleted}
          role="checkbox"
          disabled={isUpdating}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id, !isCompleted);
          }}
          className={`w-5 h-5 rounded flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
            isCompleted
              ? "bg-emerald-600 text-white shadow-xs"
              : "border-2 border-gray-300 group-hover:border-emerald-500 bg-white"
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>
      </div>

      {/* Task Text & Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div
          className={`text-sm sm:text-[15px] leading-snug font-medium transition-colors ${
            isCompleted
              ? "text-gray-500 line-through decoration-emerald-500/50"
              : "text-gray-800"
          }`}
        >
          {task.title}
        </div>

        {/* Small metadata if completed or updated */}
        {isCompleted && task.updatedBy && (
          <div className="mt-1 flex items-center space-x-2 text-[11px] text-emerald-700/80">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Completed</span>
            {task.updatedBy !== "System" && task.updatedBy !== "Initial Setup" && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">by {task.updatedBy}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right controls: Status pill + Delete button */}
      <div className="flex-shrink-0 flex items-center space-x-1.5 sm:space-x-2 self-center">
        {/* Status visual tag */}
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline-block ${
            isCompleted
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {isCompleted ? "Done" : "Pending"}
        </span>

        {/* Delete Task Button */}
        <button
          type="button"
          title="Delete this task"
          disabled={isUpdating}
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(task);
          }}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-red-400 opacity-70 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
