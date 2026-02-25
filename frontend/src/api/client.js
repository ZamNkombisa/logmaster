import axios from "axios";

const client = axios.create({
  baseURL: "https://logmaster-backend.onrender.com/api/",
});

export default client;
