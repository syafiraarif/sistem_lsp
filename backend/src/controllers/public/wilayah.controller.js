const axios = require("axios");

const BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia";

exports.getProvinsi = async (req,res)=>{
  const { data } = await axios.get(`${BASE_URL}/provinsi.json`);
  res.json(data);
};

exports.getKota = async (req,res)=>{
  const { id } = req.params;
  const { data } = await axios.get(`${BASE_URL}/regencies/${id}.json`);
  res.json(data);
};

exports.getKecamatan = async (req,res)=>{
  const { id } = req.params;
  const { data } = await axios.get(`${BASE_URL}/districts/${id}.json`);
  res.json(data);
};

exports.getKelurahan = async (req,res)=>{
  const { id } = req.params;
  const { data } = await axios.get(`${BASE_URL}/villages/${id}.json`);
  res.json(data);
};
