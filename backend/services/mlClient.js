// Axios client for calling the Python ML microservice
const axios = require("axios");

const mlClient = axios.create({
  baseURL: process.env.ML_SERVICE_URL || "http://localhost:5001",
  timeout: 8000,
});

module.exports = mlClient;
