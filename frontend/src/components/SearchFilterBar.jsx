import { useState } from "react";

function SearchFilterBar({ members, onFilterChange }) {
  const [search, setSearch] = useState("");
  const [priorities, setPriorities] = useState([]);
  const [assignee, setAssignee] = useState("");

  const applyFilters = (newSearch, newPriorities, newAssignee) => {
    onFilterChange({
      search: newSearch,
      priorities: newPriorities,
      assignee: newAssignee,
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    applyFilters(e.target.value, priorities, assignee);
  };

  const togglePriority = (priority) => {
    const updated = priorities.includes(priority)
      ? priorities.filter((p) => p !== priority)
      : [...priorities, priority];
    setPriorities(updated);
    applyFilters(search, updated, assignee);
  };

  const handleAssigneeChange = (e) => {
    setAssignee(e.target.value);
    applyFilters(search, priorities, e.target.value);
  };

  const clearAll = () => {
    setSearch("");
    setPriorities([]);
    setAssignee("");
    applyFilters("", [], "");
  };

  const hasActiveFilters = search || priorities.length > 0 || assignee;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          placeholder="🔍 Search cards..."
          value={search}
          onChange={handleSearchChange}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-1">
          {["High", "Medium", "Low"].map((p) => (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                priorities.includes(p)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <select
          value={assignee}
          onChange={handleAssigneeChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All members</option>
          {(members || []).map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-red-500 whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchFilterBar;