import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Radio, User, ShieldCheck } from "lucide-react";

export default function Header({ syncStatus, lastUpdated, updatedBy }) {
  const { currentUser, logout, isFirebaseConfigured } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3.5">
            {/* Amar City Official Brand Logo */}
            <img
              src="/logo.png"
              alt="Amar City Logo"
              className="w-11 h-11 rounded-xl shadow-xs object-contain flex-shrink-0 border border-emerald-900/10"
            />

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                  Amar City <span className="text-gray-400 font-normal">|</span>{" "}
                  <span className="text-blue-700">Launch Checklist</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                Track our launch preparation progress
              </p>
            </div>
          </div>

          {/* Right Header Controls: Sync status, User profile, Logout */}
          <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            {/* Sync Status Badge */}
            <div className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {syncStatus === "syncing" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <span className="text-amber-700">Syncing...</span>
                </>
              ) : syncStatus === "connected" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-emerald-700">Live Sync</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-blue-700">Local Mode</span>
                </>
              )}
            </div>

            {/* Authenticated Team Member Profile */}
            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 text-xs text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden md:inline-block max-w-[140px] truncate font-medium text-gray-700" title={currentUser.email}>
                    {currentUser.email}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Sign out of checklist"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-200 rounded-lg transition-colors shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
