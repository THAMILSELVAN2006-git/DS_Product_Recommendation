import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const FALLBACK = "https://placehold.co/300x200?text=No+Image";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.imageUrl || FALLBACK);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product._id}`);
      } else {
        await api.post("/wishlist", { productId: product._id });
      }
      setWishlisted((w) => !w);
    } catch {
      // silent fail
    }
  };

  const discount = product.discountPercent || 0;
  const stars = Math.round(product.rating || 0);

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-xl border border-gray-200 hover:shadow-md transition overflow-hidden flex flex-col"
    >
      <div className="relative">
        <img
          src={imgSrc}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-44 object-contain p-2 bg-gray-50"
          onError={() => setImgSrc(FALLBACK)}
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {user && (
          <button
            onClick={toggleWishlist}
            aria-label="Toggle wishlist"
            className="absolute top-2 right-2 text-xl"
          >
            {wishlisted ? "❤️" : "🤍"}
          </button>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{product.name}</p>
        <div className="flex items-center gap-1 text-yellow-400 text-xs">
          {"★".repeat(stars)}{"☆".repeat(5 - stars)}
          <span className="text-gray-400 ml-1">({product.ratingCount?.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-blue-700 font-bold text-sm">₹{product.price?.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="text-gray-400 line-through text-xs">₹{product.originalPrice?.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
