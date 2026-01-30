// src/services/api.ts
import axios from "axios";
import https from "https";

const os = require("os");
let localIP = process.env.NEXT_PUBLIC_BACKEND_IP || "127.0.0.1";

console.log("Using local IP:", localIP);
export const urlServer = "https://" + localIP + ":3000/cse.api.v1";


const api = axios.create({
  baseURL: "https://" + localIP + ":3000/cse.api.v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiServer = axios.create({
  baseURL: "https://" + localIP + ":3000/cse.api.v1",
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

export default api;
