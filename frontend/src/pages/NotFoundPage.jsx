import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl mb-4">🔦</p>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404 — Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
        Back to Home
      </Link>
    </div>
  );
}
