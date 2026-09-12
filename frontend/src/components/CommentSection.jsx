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

function CommentSection({ cardId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!cardId) return;

    fetchComments();
    socket.emit("joinCard", cardId);

    socket.on("newComment", (comment) => {
      if (comment.card === cardId) {
        setComments((prev) => [...prev, comment]);
      }
    });

    return () => {
      socket.emit("leaveCard", cardId);
      socket.off("newComment");
    };
  }, [cardId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/${cardId}`);
      setComments(response.data);
    } catch (error) {
      console.log("Error fetching comments:", error.response?.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post(`/comments/${cardId}`, { text: text.trim() });
      setText("");
      // Apna comment turant list mein add karne ki zaroorat nahi -
      // socket "newComment" event khud hi wapas aakar add kar dega
    } catch (error) {
      console.log("Error adding comment:", error.response?.data);
    }
  };

  return (
    <div className="mt-2">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Comments</h3>

      <div className="space-y-3 max-h-40 overflow-y-auto mb-3 pr-1">
        {comments.length === 0 && (
          <p className="text-xs text-gray-400">No comments yet. Start the discussion.</p>
        )}
        {comments.map((comment) => (
          <div key={comment._id} className="bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="text-xs font-semibold text-gray-700">
                {comment.author?.name || "Unknown"}
              </span>
              <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-600">{comment.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Post
        </button>
      </form>
    </div>
  );
}

export default CommentSection;