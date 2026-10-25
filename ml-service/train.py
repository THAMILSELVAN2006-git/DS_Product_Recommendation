"""
Offline training pipeline.
Run once: python train.py
Generates similarity.pkl and products.pkl used by app.py at runtime.
"""
import re
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

CSV_PATH = "../dataset/amazon.csv"
SIMILARITY_OUT = "similarity.pkl"
PRODUCTS_OUT = "products.pkl"


def clean_price(val):
    """Strip currency symbols/commas and return float, or 0.0 on failure."""
    if pd.isna(val):
        return 0.0
    return float(re.sub(r"[^\d.]", "", str(val)) or 0)


def clean_percent(val):
    if pd.isna(val):
        return 0.0
    return float(re.sub(r"[^\d.]", "", str(val)) or 0)


def load_and_clean(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)

    # Keep only the columns we need
    cols = [
        "product_id", "product_name", "category",
        "discounted_price", "actual_price", "discount_percentage",
        "rating", "rating_count", "about_product",
        "img_link", "product_link",
    ]
    df = df[cols].copy()

    # Drop rows missing critical fields
    df.dropna(subset=["product_name", "category"], inplace=True)
    df.drop_duplicates(subset=["product_id"], inplace=True)

    # Normalise numeric fields
    df["price"] = df["discounted_price"].apply(clean_price)
    df["original_price"] = df["actual_price"].apply(clean_price)
    df["discount_percent"] = df["discount_percentage"].apply(clean_percent)
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce").fillna(0.0)
    df["rating_count"] = (
        df["rating_count"]
        .apply(lambda x: re.sub(r"[^\d]", "", str(x)) if pd.notna(x) else "0")
        .astype(int)
    )
    df["about_product"] = df["about_product"].fillna("")
    df["img_link"] = df["img_link"].fillna("")
    df["product_link"] = df["product_link"].fillna("")

    # Rename for clarity
    df.rename(
        columns={
            "product_id": "productId",
            "product_name": "name",
            "about_product": "description",
            "img_link": "imageUrl",
            "product_link": "amazonLink",
        },
        inplace=True,
    )

    # Feature column for TF-IDF
    df["combined_features"] = (
        df["name"].str.lower()
        + " "
        + df["category"].str.lower()
        + " "
        + df["description"].str.lower()
    )

    df.reset_index(drop=True, inplace=True)
    return df


def build_similarity(df: pd.DataFrame):
    tfidf = TfidfVectorizer(stop_words="english", max_features=10_000)
    tfidf_matrix = tfidf.fit_transform(df["combined_features"])
    sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    return sim_matrix


def main():
    print("Loading and cleaning dataset...")
    df = load_and_clean(CSV_PATH)
    print(f"  {len(df)} products after cleaning.")

    print("Building TF-IDF similarity matrix...")
    sim = build_similarity(df)
    print(f"  Matrix shape: {sim.shape}")

    print("Saving artifacts...")
    with open(SIMILARITY_OUT, "wb") as f:
        pickle.dump(sim, f)
    with open(PRODUCTS_OUT, "wb") as f:
        pickle.dump(df, f)

    print("Done. Artifacts saved:")
    print(f"  {SIMILARITY_OUT}")
    print(f"  {PRODUCTS_OUT}")


if __name__ == "__main__":
    main()
