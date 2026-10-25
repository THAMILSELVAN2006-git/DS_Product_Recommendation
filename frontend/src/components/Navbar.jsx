import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-blue-600 whitespace-nowrap">
          SmartRec
        </Link>

        <div className="flex-1">
          <SearchBar />
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/category/Electronics" className="hover:text-blue-600">Categories</Link>
          {user && <Link to="/wishlist" className="hover:text-blue-600">Wishlist</Link>}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold uppercase">
                  {user.name?.[0]}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg text-sm z-50">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Profile</Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Admin</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
