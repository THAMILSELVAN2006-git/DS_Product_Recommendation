import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import RecommendationCard from "../components/RecommendationCard";
import { LoadingSpinner, SkeletonCard } from "../components/LoadingSpinner";
import Toast from "../components/Toast";

const FALLBACK = "https://placehold.co/400x300?text=No+Image";

function StarRating({ rating, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className={`text-2xl ${s <= rating ? "text-yellow-400" : "text-gray-300"}`}>★</button>
      ))}
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(FALLBACK);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [toast, setToast] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Guard: if id is missing or clearly invalid, don't even fetch
    if (!id || id === "undefined" || id === "null" || id === "#") {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        const p = data.data;
        setProduct(p);
        setImgSrc(p.imageUrl || FALLBACK);
        document.title = `${p.name} — SmartRec`;

        // Log to history (fire-and-forget)
        if (user) api.post("/history", { productId: id }).catch(() => {});

        // Fetch recommendations
        setRecLoading(true);
        api.post("/recommend", { productId: id })
          .then((r) => setRecommendations(r.data.data || []))
          .catch(() => setRecommendations([]))
          .finally(() => setRecLoading(false));

        // Fetch reviews
        api.get(`/reviews/${id}`).then((r) => setReviews(r.data.data)).catch(() => {});
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, user]);

  const toggleWishlist = async () => {
    if (!user) return setToast({ message: "Please login to use wishlist", type: "error" });
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${id}`);
        setWishlisted(false);
        setToast({ message: "Removed from wishlist", type: "success" });
      } else {
        await api.post("/wishlist", { productId: id });
        setWishlisted(true);
        setToast({ message: "Added to wishlist!", type: "success" });
      }
    } catch {
      setToast({ message: "Something went wrong", type: "error" });
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) return setToast({ message: "Please select a rating", type: "error" });
    setSubmitting(true);
    try {
      const { data } = await api.post(`/reviews/${id}`, reviewForm);
      setReviews((r) => [data.data, ...r]);
      setReviewForm({ rating: 0, comment: "" });
      setToast({ message: "Review submitted!", type: "success" });
    } catch (e) {
      setToast({ message: e.response?.data?.message || "Failed to submit review", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">📦</p>
      <p className="text-xl font-semibold text-gray-700 mb-2">Product not found.</p>
      <Link to="/" className="mt-4 inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Back to Home
      </Link>
    </div>
  );

  const stars = Math.round(product.rating || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Product Info */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center">
          <img
            src={imgSrc}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-h-80 object-contain"
            onError={() => setImgSrc(FALLBACK)}
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>
            <button onClick={toggleWishlist} aria-label="Toggle wishlist" className="text-3xl flex-shrink-0">
              {wishlisted ? "❤️" : "🤍"}
            </button>
          </div>
          <p className="text-sm text-blue-600 font-medium">{product.category}</p>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-lg">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>
            <span className="text-gray-500 text-sm">({product.ratingCount?.toLocaleString()} ratings)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-blue-700">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-gray-400 line-through text-lg">₹{product.originalPrice?.toLocaleString()}</span>
                <span className="bg-red-100 text-red-600 text-sm px-2 py-0.5 rounded-full font-medium">
                  -{product.discountPercent}%
                </span>
              </>
            )}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          {product.amazonLink && (
            <a href={product.amazonLink} target="_blank" rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm">
              View on Amazon ↗
            </a>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Similar Products You May Like</h2>
        {recLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-gray-500 text-sm">No similar products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommendations.map((r, i) => <RecommendationCard key={i} product={r} />)}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
        {user && (
          <form onSubmit={submitReview} className="bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
            <p className="font-medium text-gray-700">Write a Review</p>
            <StarRating rating={reviewForm.rating} onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))} />
            <textarea value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience..." rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800 text-sm">{r.userId?.name || "User"}</span>
                  <span className="text-yellow-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                <p className="text-gray-600 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
