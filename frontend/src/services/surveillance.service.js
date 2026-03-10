import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

export const createSurveillance = async (payload) => {
  const res = await API.post("/public/surveillance", payload);
  return res.data;
};