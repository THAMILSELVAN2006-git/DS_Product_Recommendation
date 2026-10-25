import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ initialValue = "" }) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const q = query.trim();
      if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    },
    [query, navigate]
  );

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 text-sm font-medium"
      >
        Search
      </button>
    </form>
  );
}
