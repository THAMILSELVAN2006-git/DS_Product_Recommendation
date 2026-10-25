"""
Flask ML microservice.
Start: python app.py
Endpoints:
  GET  /health
  POST /recommend  { "product": "<name>" }
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from recommendation import load_artifacts, get_recommendations

app = Flask(__name__)

# Only allow the Node backend — not the public internet
NODE_ORIGIN = os.getenv("NODE_ORIGIN", "http://localhost:5000")
CORS(app, origins=[NODE_ORIGIN])

# Load ML artifacts once at startup
load_artifacts()


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/recommend")
def recommend():
    body = request.get_json(silent=True) or {}
    product_name = body.get("product", "").strip()

    if not product_name:
        return jsonify({"error": "product name is required"}), 400

    results = get_recommendations(product_name)
    if results is None:
        return jsonify({"error": f"Product '{product_name}' not found"}), 404

    return jsonify(results)


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5001))
    app.run(port=port, debug=False)
