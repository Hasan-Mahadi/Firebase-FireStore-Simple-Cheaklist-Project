import React from "react";
import { CheckCircle2, Clock, ListChecks, ChevronDown, ChevronUp } from "lucide-react";

export default function ProgressSummary({
  metrics,
  allExpanded,
  onToggleAllExpanded,
}) {
  const { totalTasks, completedTasks, remainingTasks, percentage } = metrics;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
      
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center space-x-2">
            <span>Launch Preparation Progress</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {percentage}% Complete
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time status of all launch requirements across 10 operational categories
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={onToggleAllExpanded}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
          >
            {allExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                <span>Expand All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-2">
          <span>Overall Launch Readiness</span>
          <span className="text-emerald-700 font-bold">{completedTasks} of {totalTasks} tasks completed ({percentage}%)</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
        
        {/* Total Tasks */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs font-medium mb-1">
            <ListChecks className="w-3.5 h-3.5" />
            <span>Total Tasks</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">
            {totalTasks}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center space-x-1 text-emerald-600 text-xs font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700">
            {completedTasks}
          </div>
        </div>

        {/* Remaining Tasks */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center space-x-1 text-amber-600 text-xs font-medium mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Remaining</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-700">
            {remainingTasks}
          </div>
        </div>

        {/* Completion % */}
        <div className="bg-blue-50 border border-blue-200/80 rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center space-x-1 text-blue-600 text-xs font-medium mb-1">
            <span>Overall %</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-700">
            {percentage}%
          </div>
        </div>

      </div>

    </div>
  );
}
