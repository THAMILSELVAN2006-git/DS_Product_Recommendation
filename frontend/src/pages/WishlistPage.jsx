import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import Toast from "../components/Toast";

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.title = "Wishlist — SmartRec";
    api.get("/wishlist")
      .then((r) => setItems(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (wishlistId) => {
    try {
      await api.delete(`/wishlist/${wishlistId}`);
      setItems((prev) => prev.filter((i) => i._id !== wishlistId));
      setToast({ message: "Removed from wishlist", type: "success" });
    } catch {
      setToast({ message: "Failed to remove", type: "error" });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🤍</p>
          <p className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</p>
          <p className="text-gray-500 mb-6">Start exploring and save products you love!</p>
          <Link to="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => {
            const p = item.productId;
            if (!p) return null;
            return (
              <div key={item._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                <Link to={`/product/${p._id}`}>
                  <img src={p.imageUrl || "https://placehold.co/300x200?text=No+Image"} alt={p.name}
                    className="w-full h-40 object-contain p-2 bg-gray-50"
                    onError={(e) => { e.target.src = "https://placehold.co/300x200?text=No+Image"; }} />
                </Link>
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <Link to={`/product/${p._id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-2">{p.name}</Link>
                  <p className="text-blue-700 font-bold text-sm">₹{p.price?.toLocaleString()}</p>
                  <button onClick={() => remove(item._id)}
                    className="mt-auto text-sm text-red-500 hover:text-red-700 text-left">
                    ✕ Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
