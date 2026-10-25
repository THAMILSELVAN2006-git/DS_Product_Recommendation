import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { SkeletonCard } from "../components/LoadingSpinner";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("rating");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/category/${categoryName}`, { params: { page, limit: 20, sort } });
      setProducts(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [categoryName, page, sort]);

  useEffect(() => {
    document.title = `${categoryName} — SmartRec`;
    setPage(1);
  }, [categoryName]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{categoryName}</h1>
          {!loading && <p className="text-sm text-gray-500">{total} products</p>}
        </div>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="rating">Top Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
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
