import React, { useState, useEffect } from "react";
import { FaMapMarkedAlt, FaChartBar, FaUsers, FaCity } from "react-icons/fa";
// Sesuaikan import axios/api config Anda
// import api from "../../config/api"; 

const StatistikWilayah = () => {
  const [dataAsesor, setDataAsesor] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk data yang sudah dikelompokkan
  const [statsProvinsi, setStatsProvinsi] = useState([]);
  const [statsKota, setStatsKota] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // UNCOMMENT & SESUAIKAN KODE DI BAWAH INI UNTUK MENGGUNAKAN API ASLI
      // const response = await api.get("/asesor");
      // const data = response.data.data;
      
      // MOCK DATA SEMENTARA
      const mockData = [
        { nama_lengkap: "Asesor 1", provinsi: "Jawa Tengah", kota: "Semarang" },
        { nama_lengkap: "Asesor 2", provinsi: "Jawa Tengah", kota: "Surakarta" },
        { nama_lengkap: "Asesor 3", provinsi: "Jawa Timur", kota: "Surabaya" },
        { nama_lengkap: "Asesor 4", provinsi: "Jawa Barat", kota: "Bandung" },
        { nama_lengkap: "Asesor 5", provinsi: "Jawa Tengah", kota: "Semarang" },
        { nama_lengkap: "Asesor 6", provinsi: "DKI Jakarta", kota: "Jakarta Selatan" },
      ];
      const data = mockData; // Ganti dengan data dari API asli Anda

      setDataAsesor(data);
      processStats(data);
    } catch (error) {
      console.error("Gagal mengambil data asesor:", error);
    } finally {
      setLoading(false);
    }
  };

  const processStats = (data) => {
    // 1. Daftar 38 Provinsi di Indonesia (Untuk memastikan semua wilayah tampil walau datanya 0)
    const daftarProvinsi = [
      "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "Sumatera Selatan", 
      "Bengkulu", "Lampung", "Kepulauan Bangka Belitung", "Kepulauan Riau", "DKI Jakarta", 
      "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten", "Bali", 
      "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah", 
      "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara", 
      "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat", 
      "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", 
      "Papua Pegunungan", "Papua Barat Daya"
    ];

    // Buat objek default dimana semua provinsi bernilai 0
    const provCount = {};
    daftarProvinsi.forEach(prov => provCount[prov] = 0);

    // 2. Hitung jumlah asesor per Provinsi dari data asli
    data.forEach(curr => {
      const prov = curr.provinsi;
      if (prov) {
        provCount[prov] = (provCount[prov] || 0) + 1;
      }
    });

    // Petakan jadi array dan urutkan berdasarkan jumlah TERBANYAK ke terkecil
    const arrProv = Object.keys(provCount).map((key) => ({
      name: key,
      count: provCount[key],
    })).sort((a, b) => b.count - a.count);

    // 3. Hitung jumlah berdasarkan Kota/Kabupaten (Otomatis berdasarkan data)
    const kotaCount = data.reduce((acc, curr) => {
      const kota = curr.kota || "Belum Ditentukan";
      acc[kota] = (acc[kota] || 0) + 1;
      return acc;
    }, {});

    // Urutkan Kota berdasarkan jumlah TERBANYAK ke terkecil
    const arrKota = Object.keys(kotaCount).map((key) => ({
      name: key,
      count: kotaCount[key],
    })).sort((a, b) => b.count - a.count);

    setStatsProvinsi(arrProv);
    setStatsKota(arrKota);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CC6B27]"></div>
      </div>
    );
  }

  // Gunakan filter untuk total provinsi/kota yang benar-benar ada data asesornya
  const provinsiAktif = statsProvinsi.filter(p => p.count > 0).length;
  const totalAsesor = dataAsesor.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#071E3D] flex items-center gap-2">
            <FaMapMarkedAlt className="text-[#CC6B27]" /> Statistik Wilayah Asesor
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sebaran data asesor berdasarkan Provinsi dan Kota/Kabupaten
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-[#071E3D]/10 rounded-lg text-[#071E3D]">
            <FaUsers className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Asesor</p>
            <p className="text-2xl font-bold text-[#071E3D]">{totalAsesor}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-[#CC6B27]/10 rounded-lg text-[#CC6B27]">
            <FaChartBar className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Provinsi</p>
            <p className="text-2xl font-bold text-[#071E3D]">{provinsiAktif}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <FaCity className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Kota/Kab</p>
            <p className="text-2xl font-bold text-[#071E3D]">{statsKota.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STATISTIK PROVINSI */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#071E3D] px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#FAFAFA] flex items-center gap-2">
              Sebaran Provinsi (Semua Wilayah)
            </h2>
          </div>
          <div className="p-5 max-h-[400px] overflow-y-auto custom-scrollbar">
            {statsProvinsi.length > 0 ? statsProvinsi.map((item, index) => {
              // Jika datanya 0, maka persentase juga 0 (hindari NaN error)
              const percentage = totalAsesor === 0 ? 0 : (item.count / totalAsesor * 100).toFixed(1);
              
              return (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{index + 1}. {item.name}</span>
                    <span className="text-gray-500">{item.count} Asesor ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#CC6B27] h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-gray-500 py-4">Tidak ada data provinsi</p>
            )}
          </div>
        </div>

        {/* STATISTIK KOTA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#071E3D] px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#FAFAFA] flex items-center gap-2">
              Sebaran Kota/Kabupaten Terbanyak
            </h2>
          </div>
          <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 sticky top-0">
                <tr>
                  <th className="px-5 py-3 border-b">No</th>
                  <th className="px-5 py-3 border-b">Kota / Kabupaten</th>
                  <th className="px-5 py-3 border-b text-center">Jumlah Asesor</th>
                </tr>
              </thead>
              <tbody>
                {statsKota.length > 0 ? statsKota.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-3">{index + 1}</td>
                    <td className="px-5 py-3 font-medium">{item.name}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="bg-[#182D4A]/10 text-[#071E3D] py-1 px-3 rounded-full font-semibold">
                        {item.count}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-5 py-4 text-center text-gray-500">Tidak ada data kota</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatistikWilayah;