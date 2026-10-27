import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

// Truncates long titles safely for Y-axis rendering
function truncateText(str, maxLength = 24) {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength).trim() + "…" : str;
}

// Custom Tooltip for Most Viewed Products
function ProductCustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 max-w-xs text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
        {data.imageUrl && (
          <img
            src={data.imageUrl}
            alt={data.name}
            className="w-12 h-12 object-contain rounded-lg border border-gray-100 mb-2 bg-gray-50 p-1"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <p className="font-semibold text-gray-800 text-sm mb-1 leading-snug line-clamp-3">
          {data.name}
        </p>
        {data.category && (
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-2 line-clamp-1">
            {data.category.split("|").pop() || data.category}
          </p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-gray-500">Total Views:</span>
          <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-xs">
            {data.views} {data.views === 1 ? "view" : "views"}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

// Custom Tooltip for Keywords
function KeywordCustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg border border-gray-100 text-xs">
        <p className="text-gray-500 font-medium">Keyword:</p>
        <p className="text-sm font-bold text-gray-800 mb-1">"{data.keyword}"</p>
        <p className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded inline-block">
          {data.count} {data.count === 1 ? "search" : "searches"}
        </p>
      </div>
    );
  }
  return null;
}

function StatCard({ label, value, icon, badge, gradient }) {
  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${gradient} opacity-10 rounded-bl-full pointer-events-none`} />
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </span>
          <p className="text-3xl font-extrabold text-gray-800 mt-2 tracking-tight">
            {value !== undefined && value !== null ? value.toLocaleString() : "—"}
          </p>
          {badge && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {badge}
            </span>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searches, setSearches] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productViewMode, setProductViewMode] = useState("chart"); // 'chart' | 'list'
  const [userSearchTerm, setUserSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Admin Intelligence — SmartRec";
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/admin/searches"),
      api.get("/admin/popular-products"),
    ])
      .then(([s, u, sh, pp]) => {
        setStats(s.data.data);
        setUsers(u.data.data || []);
        setSearches(sh.data.data || []);
        setPopular(pp.data.data || []);
      })
      .catch((err) => {
        console.error("Admin dashboard fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    if (!userSearchTerm.trim()) return users;
    const q = userSearchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, userSearchTerm]);

  if (loading) return <LoadingSpinner />;

  // Take top 8 popular products for the chart/list
  const topPopular = popular.slice(0, 8);
  const maxViews = Math.max(...topPopular.map((p) => p.views || 0), 1);

  // Take top 8 search queries
  const topSearches = searches.slice(0, 8);

  const barColors = [
    "#6366f1",
    "#4f46e5",
    "#4338ca",
    "#3730a3",
    "#6b21a8",
    "#7c3aed",
    "#8b5cf6",
    "#a855f7",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Admin Analytics
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
              Live
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time catalog metrics, user interactions, and ML recommendation insights.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>System Healthy</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          label="Registered Users"
          value={stats?.totalUsers}
          icon="👥"
          badge="Active Accounts"
          gradient="from-blue-500 to-indigo-500"
        />
        <StatCard
          label="Catalog Products"
          value={stats?.totalProducts}
          icon="📦"
          badge="Dataset Synchronized"
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          label="Searches Today"
          value={stats?.searchesToday}
          icon="⚡"
          badge="Query Traffic"
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Viewed Products Chart / List */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>🔥</span> Most Viewed Products
                </h2>
                <p className="text-xs text-gray-400">
                  Products with the highest engagement
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-medium text-gray-600">
                <button
                  type="button"
                  onClick={() => setProductViewMode("chart")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    productViewMode === "chart"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "hover:text-gray-900"
                  }`}
                  title="Chart View"
                >
                  📊 Chart
                </button>
                <button
                  type="button"
                  onClick={() => setProductViewMode("list")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    productViewMode === "list"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "hover:text-gray-900"
                  }`}
                  title="List View"
                >
                  📋 Ranked
                </button>
              </div>
            </div>

            {topPopular.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
                <span className="text-3xl mb-2">🛍️</span>
                No product view activity recorded yet.
              </div>
            ) : productViewMode === "chart" ? (
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topPopular}
                    layout="vertical"
                    margin={{ top: 8, right: 25, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={160}
                      tickFormatter={(val) => truncateText(val, 22)}
                      tick={{ fill: "#334155", fontSize: 11, fontWeight: 500 }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<ProductCustomTooltip />}
                      cursor={{ fill: "rgba(99, 102, 241, 0.06)" }}
                    />
                    <Bar dataKey="views" radius={[0, 6, 6, 0]} barSize={18}>
                      {topPopular.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={barColors[index % barColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="space-y-3.5 pt-2 max-h-[320px] overflow-y-auto pr-1">
                {topPopular.map((item, idx) => {
                  const percent = Math.round((item.views / maxViews) * 100);
                  return (
                    <div
                      key={idx}
                      className="group p-2.5 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex items-center gap-3"
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0
                            ? "bg-amber-100 text-amber-700"
                            : idx === 1
                            ? "bg-slate-200 text-slate-700"
                            : idx === 2
                            ? "bg-amber-50 text-amber-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-10 h-10 object-contain rounded-lg border border-gray-100 p-0.5 bg-white shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p
                            className="text-xs font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors"
                            title={item.name}
                          >
                            {item.name}
                          </p>
                          <span className="text-xs font-bold text-indigo-600 shrink-0 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {item.views} {item.views === 1 ? "view" : "views"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
            💡 Tip: Hover over any bar or item to view the full product specifications and image.
          </p>
        </div>

        {/* Top Search Keywords Chart */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>🔍</span> Top Search Keywords
                </h2>
                <p className="text-xs text-gray-400">
                  Popular user queries and search trends
                </p>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Top {topSearches.length} Terms
              </span>
            </div>

            {topSearches.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
                <span className="text-3xl mb-2">🔎</span>
                No search history recorded yet.
              </div>
            ) : (
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSearches}
                    layout="vertical"
                    margin={{ top: 8, right: 25, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="keyword"
                      width={140}
                      tickFormatter={(val) => truncateText(val, 20)}
                      tick={{ fill: "#334155", fontSize: 11, fontWeight: 500 }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<KeywordCustomTooltip />}
                      cursor={{ fill: "rgba(59, 130, 246, 0.06)" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[0, 6, 6, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
            📊 Displays exact search query volume submitted by website visitors.
          </p>
        </div>
      </div>

      {/* Registered Users Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>👥</span> User Directory
            </h2>
            <p className="text-xs text-gray-400">
              Manage accounts, roles, and authentication details ({users.length} total users)
            </p>
          </div>

          {/* User Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full text-xs px-3 py-2 pl-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">
              🔍
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/70 text-gray-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-semibold">User</th>
                <th className="px-6 py-3.5 font-semibold">Email</th>
                <th className="px-6 py-3.5 font-semibold">Role</th>
                <th className="px-6 py-3.5 font-semibold">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No users matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  const initial = (u.name || u.email || "?")[0].toUpperCase();
                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAdmin
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {initial}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800">{u.name}</p>
                          {isAdmin && (
                            <span className="text-[10px] text-purple-600 font-medium">
                              Administrator
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isAdmin
                              ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isAdmin && <span>🛡️</span>}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
