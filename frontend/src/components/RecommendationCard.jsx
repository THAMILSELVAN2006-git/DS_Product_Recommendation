import { Link } from "react-router-dom";
import { useState } from "react";

const FALLBACK = "https://placehold.co/200x150?text=No+Image";

export default function RecommendationCard({ product }) {
  const [imgSrc, setImgSrc] = useState(product.imageUrl || FALLBACK);

  // Only render a clickable link if we have a valid MongoDB _id
  const hasLink = product._id && product._id !== "null" && product._id !== "#";
  const Wrapper = hasLink ? Link : "div";
  const wrapperProps = hasLink ? { to: `/product/${product._id}` } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="bg-white rounded-xl border border-blue-100 hover:shadow-md transition overflow-hidden flex flex-col cursor-pointer"
    >
      <img
        src={imgSrc}
        alt={product.name}
        referrerPolicy="no-referrer"
        className="w-full h-36 object-contain p-2 bg-gray-50"
        onError={() => setImgSrc(FALLBACK)}
      />
      <div className="p-3 flex flex-col gap-1">
        <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</p>
        <p className="text-xs text-gray-500">{product.category}</p>
        <p className="text-blue-700 font-bold text-sm">₹{product.price?.toLocaleString()}</p>
        <p className="text-xs text-green-600 italic mt-1">
          Recommended because it is similar in category and features.
        </p>
      </div>
    </Wrapper>
  );
}
