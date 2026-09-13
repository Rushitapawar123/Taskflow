import { useState, useEffect } from "react";
import api from "../services/api";
import socket from "../socket";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function ActivityPanel({ boardId, isOpen, onClose }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!boardId) return;

    fetchActivities();

    socket.on("newActivity", (activity) => {
      if (activity.board === boardId) {
        setActivities((prev) => [activity, ...prev]);
      }
    });

    return () => {
      socket.off("newActivity");
    };
  }, [boardId]);

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/activities/${boardId}`);
      setActivities(response.data);
    } catch (error) {
      console.log("Error fetching activities:", error.response?.data);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 right-0 h-full w-80 shadow-lg z-40 p-5 overflow-y-auto"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>
          Activity
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-lg">
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {activities.length === 0 && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            No activity yet.
          </p>
        )}
        {activities.map((activity) => (
          <div key={activity._id} className="text-sm border-b pb-2" style={{ borderColor: "var(--color-border)" }}>
            <p style={{ color: "var(--color-text)" }}>
              <span className="font-medium">{activity.user?.name || "Someone"}</span>{" "}
              {activity.message}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {timeAgo(activity.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityPanel;