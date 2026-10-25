import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import Toast from "../components/Toast";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("history");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.title = "Profile — SmartRec";
    Promise.all([api.get("/history"), api.get("/wishlist")])
      .then(([h, w]) => { setHistory(h.data.data); setWishlist(w.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const clearHistory = async () => {
    await api.delete("/history");
    setHistory([]);
    setToast({ message: "History cleared", type: "success" });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold uppercase">
          {user?.name?.[0]}
        </div>
        <div className="flex-1">
          <p className="text-xl font-bold text-gray-800">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">Role: {user?.role}</p>
        </div>
        <button onClick={logout}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 font-medium">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["history", "wishlist"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t === "history" ? "Recently Viewed" : "Wishlist"}
          </button>
        ))}
      </div>

      {tab === "history" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="font-semibold text-gray-700">Recently Viewed</p>
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-sm text-red-500 hover:underline">Clear History</button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No browsing history yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((h) => {
                const p = h.productId;
                if (!p) return null;
                return (
                  <Link key={h._id} to={`/product/${p._id}`}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-3 hover:shadow-sm transition">
                    <img src={p.imageUrl || "https://placehold.co/60x60?text=?"} alt={p.name}
                      className="w-14 h-14 object-contain rounded-lg bg-gray-50"
                      onError={(e) => { e.target.src = "https://placehold.co/60x60?text=?"; }} />
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</p>
                      <p className="text-blue-700 text-sm font-bold">₹{p.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "wishlist" && (
        <div>
          <p className="font-semibold text-gray-700 mb-4">Saved Items ({wishlist.length})</p>
          {wishlist.length === 0 ? (
            <p className="text-gray-500 text-sm">Your wishlist is empty.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {wishlist.map((item) => {
                const p = item.productId;
                if (!p) return null;
                return (
                  <Link key={item._id} to={`/product/${p._id}`}
                    className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-sm transition">
                    <img src={p.imageUrl || "https://placehold.co/200x150?text=?"} alt={p.name}
                      className="w-full h-28 object-contain bg-gray-50 rounded-lg mb-2"
                      onError={(e) => { e.target.src = "https://placehold.co/200x150?text=?"; }} />
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">{p.name}</p>
                    <p className="text-blue-700 text-sm font-bold mt-1">₹{p.price?.toLocaleString()}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
