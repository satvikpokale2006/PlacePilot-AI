import React, { useState, useEffect } from "react";
import { PlannerTask } from "../types";
import { 
  Bell, BellRing, BellOff, Settings, Sparkles, Clock, 
  ExternalLink, Check, Volume2, ShieldAlert, MonitorPlay, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PlannerNotificationsProps {
  tasks: PlannerTask[];
}

export const PlannerNotifications: React.FC<PlannerNotificationsProps> = ({ tasks }) => {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem("planner_notification_subscribed") === "true";
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem("planner_notification_time") || "09:00";
  });
  const [isIframe, setIsIframe] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Check Web Notification API support & active permission
  useEffect(() => {
    setIsIframe(window.self !== window.top);

    if (!("Notification" in window)) {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  // Request browser notification permission
  const handleRequestPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        setIsSubscribed(true);
        localStorage.setItem("planner_notification_subscribed", "true");
        
        // Trigger a nice welcoming desktop notification
        new Notification("Notifications Activated!", {
          body: "You will now receive desktop alerts for your Daily Placement Goals.",
          icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          tag: "planner-auth-welcome"
        });
      }
    } catch (err) {
      console.error("Error requesting permission", err);
    }
  };

  // Toggle active subscriptions
  const handleToggleSubscription = () => {
    const nextSub = !isSubscribed;
    setIsSubscribed(nextSub);
    localStorage.setItem("planner_notification_subscribed", String(nextSub));

    if (nextSub && permission === "default") {
      handleRequestPermission();
    }
  };

  // Save the timing configuration
  const handleSaveTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setReminderTime(newTime);
    localStorage.setItem("planner_notification_time", newTime);
  };

  // Trigger manual immediate notification for active goals
  const handleTriggerInstantAlert = () => {
    if (permission !== "granted") {
      handleRequestPermission();
      return;
    }

    const pendingTasks = tasks.filter(t => !t.completed);
    const pendingCount = pendingTasks.length;

    let title = "Placement Goal Checklist";
    let body = "";

    if (pendingCount === 0) {
      if (tasks.length === 0) {
        body = "You have no preparation goals set for today. Add some goals to kickstart your study schedule!";
      } else {
        title = "All Goals Completed! 🎉";
        body = "Fantastic job! You've achieved all your set goals for today. Stay consistent to beat placement benchmarks.";
      }
    } else {
      const sampleGoals = pendingTasks.slice(0, 2).map(t => `• ${t.title}`).join("\n");
      const overflow = pendingCount > 2 ? `\n• ...and ${pendingCount - 2} more goals.` : "";
      body = `You have ${pendingCount} pending goal${pendingCount > 1 ? "s" : ""} remaining for today:\n${sampleGoals}${overflow}`;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        badge: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        tag: "daily-goals-checklist",
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    } catch (err) {
      console.error("Desktop notification failed to render:", err);
    }
  };

  // Background interval logic to check timing triggers
  useEffect(() => {
    if (!isSubscribed || permission !== "granted") return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHrsMins = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      // Check if the current time matches the scheduled reminder time
      if (currentHrsMins === reminderTime && now.getSeconds() < 10) {
        const pendingCount = tasks.filter(t => !t.completed).length;
        
        if (pendingCount > 0) {
          try {
            new Notification("Daily Goal Prep Reminder ⏰", {
              body: `Don't break your streak! You have ${pendingCount} unfinished placement goals for today. Click to resume practicing.`,
              icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              tag: "scheduled-goals-reminder"
            });
          } catch (err) {
            console.error("Scheduled reminder failed:", err);
          }
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isSubscribed, reminderTime, permission, tasks]);

  // Compute pending checklist stats
  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div 
      className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4"
      id="planner-notifications-widget"
    >
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/50 pb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {isSubscribed && permission === "granted" ? (
            <BellRing className="w-4 h-4 text-amber-500 animate-bounce" />
          ) : (
            <Bell className="w-4 h-4 text-gray-400" />
          )}
          Desktop Goal Reminders
        </h3>
        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
          permission === "granted" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
          permission === "denied" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" :
          "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
        }`}>
          {permission === "unsupported" ? "Unsupported" : permission}
        </span>
      </div>

      {/* Iframe Notice & Tip */}
      {isIframe && (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-800 dark:text-amber-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>IFrame Sandbox Mode Active</span>
          </div>
          <p className="leading-relaxed">
            Browsers block desktop notification prompts inside frames. Open the placement portal in a 
            <a 
              href={window.location.href} 
              target="_blank" 
              rel="noreferrer"
              className="font-bold underline text-amber-600 dark:text-amber-400 mx-1 inline-flex items-center gap-0.5 hover:opacity-85"
            >
              New Tab <ExternalLink className="w-2.5 h-2.5 inline" />
            </a> 
            to grant permissions and enable authentic system notifications.
          </p>
        </div>
      )}

      {/* Desktop Web Notification State Controller */}
      {permission === "unsupported" ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Browser Unsupported</strong>
            The Web Notification API is not supported on this browser or private environment. Use a modern desktop browser like Chrome, Firefox, or Safari.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Daily Goal Alerts
              </span>
              <p className="text-[10px] text-gray-400">
                Send a desktop alert with your current remaining checklist
              </p>
            </div>

            <button
              onClick={handleToggleSubscription}
              id="toggle-subscription-btn"
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isSubscribed && permission === "granted" ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  isSubscribed && permission === "granted" ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Alert Configuration */}
          {isSubscribed && permission === "granted" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Daily Trigger Time
                </span>
                <input 
                  type="time" 
                  value={reminderTime}
                  onChange={handleSaveTime}
                  className="px-2 py-1 rounded-lg border border-gray-250 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-[10px] text-gray-400 leading-normal flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  The reminder will fire at <strong>{reminderTime}</strong> if any goals remain pending for today. Make sure this tab stays open!
                </span>
              </div>
            </motion.div>
          )}

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleRequestPermission}
              disabled={permission === "granted"}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-[10px] font-bold text-gray-700 dark:text-gray-300 rounded-xl transition cursor-pointer disabled:opacity-40 whitespace-nowrap"
            >
              Authorize Browser
            </button>

            <button
              onClick={handleTriggerInstantAlert}
              className={`px-3 py-2 text-[10px] font-bold text-white rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                testSuccess ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {testSuccess ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Alert Fired!</span>
                </>
              ) : (
                <>
                  <MonitorPlay className="w-3 h-3" />
                  <span>Send Test Alert</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
