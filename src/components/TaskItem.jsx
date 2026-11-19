import React, { useState, useEffect } from "react";
import { Check, Trash2, ChevronDown, ChevronUp, Save, MessageSquareText } from "lucide-react";

export default function TaskItem({
  task,
  onToggle,
  onUpdateNote,
  onDelete,
  isUpdating,
}) {
  const isCompleted = Boolean(task.completed);
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState(task.note || "");
  const [isSaved, setIsSaved] = useState(false);

  // Sync internal state if task prop changes from external source (e.g. Firestore sync)
  useEffect(() => {
    setNoteText(task.note || "");
  }, [task.note]);

  const handleSaveNote = async (e) => {
    e?.stopPropagation();
    if (onUpdateNote) {
      await onUpdateNote(task.id, noteText);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div
      className={`group rounded-lg border transition-all duration-150 ${
        isCompleted
          ? "bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70"
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
      }`}
    >
      {/* Top Header Row of Task */}
      <div className="flex items-start space-x-3.5 p-3 sm:px-4 sm:py-3">
        {/* Checkbox */}
        <div className="pt-0.5 flex-shrink-0">
          <button
            type="button"
            aria-checked={isCompleted}
            role="checkbox"
            disabled={isUpdating}
            onClick={() => onToggle(task.id, !isCompleted)}
            className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
              isCompleted
                ? "bg-emerald-600 text-white shadow-xs"
                : "border-2 border-gray-300 hover:border-emerald-500 bg-white"
            }`}
          >
            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>
        </div>

        {/* Task Text & Details (Selectable / Copyable with mouse) */}
        <div className="flex-1 min-w-0 pr-1 select-text">
          <div
            className={`text-sm sm:text-[15px] leading-snug font-medium select-text cursor-text ${
              isCompleted
                ? "text-gray-500 line-through decoration-emerald-500/50"
                : "text-gray-800"
            }`}
          >
            {task.title}
          </div>

          {/* Quick preview or snippet of note if closed */}
          {!isExpanded && task.note && (
            <div
              onClick={() => setIsExpanded(true)}
              className="mt-1.5 flex items-center space-x-1.5 text-xs text-blue-700 hover:text-blue-800 bg-blue-50/80 px-2 py-0.5 rounded cursor-pointer w-fit max-w-full"
            >
              <MessageSquareText className="w-3.5 h-3.5 flex-shrink-0 text-blue-600" />
              <span className="truncate max-w-[280px] sm:max-w-md font-normal">
                {task.note}
              </span>
            </div>
          )}

          {/* Small metadata if completed */}
          {isCompleted && task.updatedBy && (
            <div className="mt-1 flex items-center space-x-2 text-[11px] text-emerald-700/80 select-text">
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

        {/* Right controls: Note toggle button + Status pill + Delete button */}
        <div className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2 self-start pt-0.5">
          {/* Note / Value expand toggle button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse task note" : "Expand task note / data value"}
            className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
              task.note
                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">
              {task.note ? "Data / Note" : "Add Note"}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 ml-0.5 text-gray-500" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-0.5 text-gray-500" />
            )}
          </button>

          {/* Status visual tag */}
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full hidden md:inline-block ${
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
            onClick={() => {
              if (onDelete) onDelete(task);
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-400 opacity-70 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Task Data/Value Note Field */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-1 border-t border-gray-100 bg-gray-50/70 rounded-b-lg">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Task Data / Value (এই টাস্কের ডাটা বা যে ভ্যালুর জন্য সম্পন্ন করা হচ্ছে):
            </label>
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="এখানে এই টাস্ক সম্পর্কিত তথ্য, ডাটা, লিংক বা ভ্যালু লিখে সেভ করুন..."
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 select-text"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-500">
                {isSaved ? (
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Data saved successfully!</span>
                  </span>
                ) : (
                  <span>যেকোনো টিম মেম্বার এই ডাটা দেখতে ও আপডেট করতে পারবে</span>
                )}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200/60 rounded cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleSaveNote}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
