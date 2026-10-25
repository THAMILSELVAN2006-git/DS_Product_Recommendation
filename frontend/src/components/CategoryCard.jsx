import { Link } from "react-router-dom";

const CATEGORIES = ["Electronics", "Computers", "Home", "Kitchen", "Fashion", "Books", "Sports"];

export default function CategoryCard({ name }) {
  return (
    <Link
      to={`/category/${name}`}
      className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition text-center"
    >
      <span className="text-2xl mb-1">
        {name === "Electronics" ? "⚡" : name === "Computers" ? "💻" : name === "Home" ? "🏠" : name === "Kitchen" ? "🍳" : name === "Fashion" ? "👗" : name === "Books" ? "📚" : "🏅"}
      </span>
      <span className="text-sm font-medium text-gray-700">{name}</span>
    </Link>
  );
}

export { CATEGORIES };
