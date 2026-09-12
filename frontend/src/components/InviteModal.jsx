import { useState } from "react";

function InviteModal({ isOpen, onClose, onInvite, members, currentUserIsOwner, onRemoveMember }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      await onInvite(email.trim());
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Board Members</h2>
        <p className="text-sm text-gray-500 mb-4">
          Invite a registered TaskFlow user by email, or manage current members.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "..." : "Invite"}
          </button>
        </form>

        <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
          {(members || []).map((member) => (
            <div key={member._id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">{member.name}</p>
                <p className="text-xs text-gray-400">{member.email}</p>
              </div>
              {currentUserIsOwner && (
                <button
                  onClick={() => onRemoveMember(member._id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InviteModal;