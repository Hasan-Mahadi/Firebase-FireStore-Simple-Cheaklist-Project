import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, ShieldAlert, ArrowRight, Info, CheckCircle2 } from "lucide-react";

export default function LoginModal() {
  const { login, authError, setAuthError, isFirebaseConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (setAuthError) setAuthError("");

    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setLocalError(err.message || "Failed to sign in. Check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (demoRole) => {
    const demoEmail = demoRole === "lead" ? "lead@amarcity.app" : "member@amarcity.app";
    setEmail(demoEmail);
    setPassword("launch2026");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img
          src="/logo.png"
          alt="Amar City Logo"
          className="mx-auto w-16 h-16 rounded-2xl shadow-md object-contain mb-3 border border-emerald-900/10"
        />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Amar City
        </h2>
        <p className="mt-1.5 text-sm text-gray-600 font-medium">
          Launch Preparation Checklist • Team Sign In
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-gray-200 rounded-2xl">
          
          {/* Error Banner */}
          {(localError || authError) && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Notice</p>
                <p className="mt-0.5">{localError || authError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Team Email
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="team.member@amarcity.com"
                  className="block w-full pl-9 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Checklist</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Admin / Access Information Box */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-800 mb-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Team Members Notice</span>
              </div>
              <p className="leading-relaxed">
                Public self-registration is disabled for security. Accounts are created manually by the administrator in the{" "}
                <span className="font-semibold text-slate-700">Firebase Console &gt; Authentication</span>.
              </p>
            </div>

            {/* Quick Demo Assist if Firebase environment credentials are not yet configured */}
            {!isFirebaseConfigured && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <p className="font-semibold text-amber-900">Developer / Preview Note:</p>
                <p className="mt-0.5 text-amber-800">
                  Firebase credentials are not configured in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code>. You can click below to test with demo credentials:
                </p>
                <div className="mt-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("lead")}
                    className="px-2 py-1 bg-amber-200 hover:bg-amber-300 rounded font-medium text-amber-900"
                  >
                    Fill Demo Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("member")}
                    className="px-2 py-1 bg-amber-200 hover:bg-amber-300 rounded font-medium text-amber-900"
                  >
                    Fill Demo Member
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer Note */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Amar City Launch Operations • Confidential Internal Tool
        </p>
      </div>

    </div>
  );
}
