import axios from "axios";

export default axios.create({
  // baseURL: "http://127.0.0.1:8000",
  baseURL: "https://api-andpoint-2.onrender.com/api", //localhost
  headers: {
    "Content-type": "application/json",
  },
  timeout: 300000,
});
