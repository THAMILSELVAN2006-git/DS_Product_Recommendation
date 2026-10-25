import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { SkeletonCard } from "../components/LoadingSpinner";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState("");

  const fetchResults = useCallback(async () => {
    if (!query) return;
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { search: query, page, limit: 20, sort } });
      setProducts(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [query, page, sort]);

  useEffect(() => {
    document.title = `Search: ${query} — SmartRec`;
    setPage(1);
  }, [query]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Results for "{query}"</h1>
          {!loading && <p className="text-sm text-gray-500">{total} products found</p>}
        </div>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl font-semibold text-gray-700 mb-2">No results found for "{query}"</p>
          <p className="text-gray-500 mb-6">Try a different keyword or browse our categories.</p>
          <Link to="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Browse Categories</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
