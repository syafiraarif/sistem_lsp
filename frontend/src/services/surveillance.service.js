import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

/**
 * PUBLIC - CREATE SURVEILLANCE
 */
export const createSurveillance = async (payload) => {
  const res = await API.post("/surveillance", payload);
  return res.data;
};