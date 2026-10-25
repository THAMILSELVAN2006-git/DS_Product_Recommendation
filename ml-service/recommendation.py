"""
Core similarity logic — imported by app.py.
"""
import pickle
import numpy as np

_sim = None
_df = None


def load_artifacts(sim_path="similarity.pkl", products_path="products.pkl"):
    global _sim, _df
    with open(sim_path, "rb") as f:
        _sim = pickle.load(f)
    with open(products_path, "rb") as f:
        _df = pickle.load(f)
    print(f"[ML] Loaded {len(_df)} products, similarity matrix {_sim.shape}")


def get_recommendations(product_name: str, top_n: int = 5):
    """
    Return top_n similar products for the given product name.
    Falls back to substring match if exact match fails.
    """
    if _df is None or _sim is None:
        raise RuntimeError("Artifacts not loaded. Call load_artifacts() first.")

    names_lower = _df["name"].str.lower()
    query = product_name.strip().lower()

    # Exact match first
    matches = _df[names_lower == query]
    if matches.empty:
        # Substring fallback
        matches = _df[names_lower.str.contains(query, na=False, regex=False)]

    if matches.empty:
        return None  # caller handles 404

    idx = matches.index[0]
    scores = list(enumerate(_sim[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    results = []
    for i, score in scores:
        if i == idx:
            continue
        row = _df.iloc[i]
        results.append(
            {
                "name": row["name"],
                "price": row["price"],
                "originalPrice": row["original_price"],
                "discountPercent": row["discount_percent"],
                "rating": row["rating"],
                "ratingCount": int(row["rating_count"]),
                "category": row["category"],
                "imageUrl": row["imageUrl"],
                "amazonLink": row["amazonLink"],
                "productId": row["productId"],
                "similarityScore": round(float(score), 4),
            }
        )
        if len(results) == top_n:
            break

    return results
