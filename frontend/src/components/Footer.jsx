import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-white font-bold text-base mb-2">SmartRec</p>
          <p>AI-powered product recommendations.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-2">Browse</p>
          <ul className="space-y-1">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/category/Electronics" className="hover:text-white">Electronics</Link></li>
            <li><Link to="/category/Fashion" className="hover:text-white">Fashion</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-2">Account</p>
          <ul className="space-y-1">
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/register" className="hover:text-white">Register</Link></li>
            <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-2">Info</p>
          <p>© {new Date().getFullYear()} SmartRec. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
