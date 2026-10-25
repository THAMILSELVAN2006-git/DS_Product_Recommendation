import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import CategoryCard, { CATEGORIES } from "../components/CategoryCard";
import { SkeletonCard } from "../components/LoadingSpinner";

export default function HomePage() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "SmartRec — Home";
    const fetchAll = async () => {
      try {
        const [t, r] = await Promise.all([
          api.get("/products/trending"),
          api.get("/products/top-rated"),
        ]);
        setTrending(t.data.data);
        setTopRated(r.data.data);
        setRecommended(r.data.data.slice(0, 6)); // generic top-rated for guests
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-10 text-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Discover Products You'll Love</h1>
        <p className="text-blue-100 mb-6">AI-powered recommendations based on what you browse.</p>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Browse Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {CATEGORIES.map((c) => <CategoryCard key={c} name={c} />)}
        </div>
      </section>

      {/* Trending */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Trending Products</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {loading
            ? Array(5).fill(0).map((_, i) => <div key={i} className="min-w-[200px]"><SkeletonCard /></div>)
            : trending.map((p) => (
                <div key={p._id} className="min-w-[200px]">
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      </section>

      {/* Top Rated */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Top Rated</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading
            ? Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : topRated.slice(0, 10).map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {user ? "Recommended For You" : "Popular Picks"}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {user ? "Based on your browsing history." : "Sign in for personalized recommendations."}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommended.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
