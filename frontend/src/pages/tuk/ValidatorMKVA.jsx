import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SidebarTUK from "../../components/sidebar/SidebarTuk";

const API_BASE = import.meta.env.VITE_API_BASE;

const ValidatorMKVA = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [jadwal, setJadwal] = useState(null);
  const [asesorJadwal, setAsesorJadwal] = useState([]);
  const [allAsesor, setAllAsesor] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== TAMBAHAN SEARCH ===== */
  const [search, setSearch] = useState("");

  /* ================= FETCH DATA ================= */

  const fetchData = async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/tuk/jadwal/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = res.data?.data;

      setJadwal(data);

      /* asesor validator MKVA */
      const asesorExisting = data?.validatorMkvaList || [];

      setAsesorJadwal(asesorExisting);

      const resAsesor = await axios.get(
        `${API_BASE}/tuk/asesor`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAllAsesor(resAsesor.data?.data || []);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchData();

  }, [id]);

  /* ================= TAMBAH ================= */

  const handleAdd = (id_user) => {

    setSelected((prev) => {

      if (prev.includes(id_user)) return prev;

      return [...prev, id_user];

    });

  };

  /* ================= REMOVE ================= */

  const handleRemove = (id_user) => {

    setSelected((prev) => prev.filter((i) => i !== id_user));

  };

  /* ================= SIMPAN ================= */

  const handleSave = async () => {

    try {

      const payload = {
        listAsesor: selected.map((id_user) => ({
          id_user
        }))
      };

      await axios.post(
        `${API_BASE}/tuk/jadwal/${id}/validator_mkva`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSelected([]);

      fetchData();

    } catch (err) {

      alert(err?.response?.data?.message || "Gagal menyimpan");

    }

  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {

    localStorage.clear();
    navigate("/login");

  };

  if (loading) {

    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-slate-50 flex">

      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-20 p-8">

        {/* HEADER */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Validator MKVA
          </h1>
        </div>

        {/* DATA JADWAL */}

        {jadwal && (

          <div className="bg-white rounded-xl shadow p-6 mb-6">

            <h2 className="font-bold mb-4">
              Data Jadwal
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">

              <div>
                <span className="text-gray-500">Skema</span>
                <div className="font-semibold">
                  {jadwal?.skema?.judul_skema || "-"}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Kegiatan</span>
                <div className="font-semibold">
                  {jadwal?.nama_kegiatan || "-"}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Tanggal</span>
                <div className="font-semibold">
                  {jadwal?.tgl_awal} - {jadwal?.tgl_akhir}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Kuota</span>
                <div className="font-semibold">
                  {jadwal?.kuota || "-"}
                </div>
              </div>

            </div>

            {/* ASESOR TERPILIH */}

            <div>

              <span className="text-gray-500 text-sm">
                Asesor Validator MKVA
              </span>

              <div className="font-semibold">

                {asesorJadwal.length === 0
                  ? "Belum ada asesor"
                  : asesorJadwal
                      .map((a) => a?.profileAsesor?.nama_lengkap)
                      .filter(Boolean)
                      .join(", ")
                }

              </div>

            </div>

          </div>

        )}

        {/* PILIH ASESOR */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="font-bold mb-4">
            Pilih Asesor Validator MKVA
          </h2>

          {/* ===== INPUT SEARCH (TAMBAHAN) ===== */}

          <input
            type="text"
            placeholder="Cari nama asesor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-4 border rounded-lg px-3 py-2"
          />

          <div className="space-y-3">

            {allAsesor
              .filter((a) =>
                a.nama_lengkap
                  ?.toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((a) => {

              const sudahAda = asesorJadwal.some(
                (j) => j?.asesor?.id_user === a.id_user
              );

              return (

                <div
                  key={a.id_user}
                  className="border p-4 rounded-lg flex justify-between items-center"
                >

                  <div>

                    <div className="font-semibold">
                      {a.nama_lengkap}
                    </div>

                    <div className="text-sm text-gray-500">
                      No Registrasi : {a.no_reg_asesor}
                    </div>

                    <div className="text-sm text-gray-500">
                      No HP : {a.no_hp}
                    </div>

                  </div>

                  {sudahAda ? (

                    <span className="text-green-600 font-semibold">
                      Sudah Dipilih
                    </span>

                  ) : selected.includes(a.id_user) ? (

                    <button
                      onClick={() => handleRemove(a.id_user)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Batalkan
                    </button>

                  ) : (

                    <button
                      onClick={() => handleAdd(a.id_user)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Tambah
                    </button>

                  )}

                </div>

              );

            })}

          </div>

          {selected.length > 0 && (

            <button
              onClick={handleSave}
              className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-lg"
            >
              Simpan Validator MKVA
            </button>

          )}

        </div>

      </div>

    </div>

  );

};

export default ValidatorMKVA;