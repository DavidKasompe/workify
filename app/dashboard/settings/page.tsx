"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  User,
  Palette,
  Sun,
  Moon,
  Monitor,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/Button";

const settingsSections = [
  {
    id: "profile",
    name: "Profile",
    icon: User,
  },
  {
    id: "appearance",
    name: "Appearance",
    icon: Palette,
  },
];

const themes = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Use light theme",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Use dark theme",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Match system theme",
  },
] as const;

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update session with new user data
      await updateSession({
        user: {
          ...session?.user,
          name: data.user.name,
          email: data.user.email,
        },
      });

      setStatusMessage({
        type: "success",
        message: data.message || "Profile updated successfully!",
      });

      // Update local state
      setName(data.user.name);
      setEmail(data.user.email);

      // Wait for session to update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      setStatusMessage({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        {}
        <nav className="w-64 space-y-1">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                activeSection === section.id
                  ? "bg-gray-50/80 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span className="text-sm">{section.name}</span>
            </button>
          ))}
        </nav>

        {}
        <div className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          {activeSection === "profile" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Profile Settings
              </h3>

              {}
              {statusMessage && (
                <div
                  className={`p-3 rounded-lg flex items-center space-x-2 ${
                    statusMessage.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span>{statusMessage.message}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-sm transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-sm transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={isSaving}
                  onClick={handleSaveProfile}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Appearance Settings
              </h3>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {themes.map(({ value, label, icon: Icon, description }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`p-4 rounded-lg border ${
                        theme === value
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      } transition-all`}
                    >
                      <div className="flex items-center justify-center mb-3">
                        <Icon className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {label}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
