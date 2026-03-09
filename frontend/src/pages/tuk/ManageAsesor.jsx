import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarTUK from '../../components/sidebar/SidebarTuk';

export default function ManageAsesor() {

  const { id } = useParams(); // id jadwal
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [asesorList, setAsesorList] = useState([]);
  const [selectedAsesor, setSelectedAsesor] = useState([]);
  const [jenisTugas, setJenisTugas] = useState("asesor_penguji");
  const [loading, setLoading] = useState(false);

  /* ============================= */
  /* FETCH LIST ASESO R DARI BACKEND */
  /* ============================= */
  useEffect(() => {

    const fetchAsesor = async () => {

      try {
        const res = await axios.get(
          "http://localhost:3000/api/admin/asesor",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setAsesorList(res.data.data || []);

      } catch (err) {
        console.error(err);
      }
    };

    fetchAsesor();

  }, []);

  /* ============================= */
  /* HANDLE CHECKBOX */
  /* ============================= */
  const toggleSelect = (id_user) => {

    if (selectedAsesor.includes(id_user)) {
      setSelectedAsesor(
        selectedAsesor.filter(id => id !== id_user)
      );
    } else {
      setSelectedAsesor([...selectedAsesor, id_user]);
    }
  };

  /* ============================= */
  /* SUBMIT TAMBAH ASESO R */
  /* ============================= */
  const handleSubmit = async () => {

    if (selectedAsesor.length === 0) {
      alert("Pilih minimal 1 asesor");
      return;
    }

    setLoading(true);

    try {

      await axios.post(
        `http://localhost:3000/api/tuk/jadwal/${id}/asesor`,
        {
          jenisTugas,
          listAsesor: selectedAsesor.map(id_user => ({
            id_user
          }))
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Asesor berhasil ditambahkan ✅");

      // 🔥 refresh halaman
      navigate(`/tuk/jadwal/${id}/detail`);

    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambah asesor");
    }

    setLoading(false);
  };

  /* ============================= */

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Tambah Asesor ke Jadwal
      </h1>

      {/* ===== PILIH JENIS TUGAS ===== */}
      <div className="mb-4">
        <label className="font-semibold">
          Jenis Tugas
        </label>

        <select
          value={jenisTugas}
          onChange={(e)=>setJenisTugas(e.target.value)}
          className="border p-2 ml-2 rounded"
        >
          <option value="asesor_penguji">Asesor Penguji</option>
          <option value="verifikator_tuk">Verifikator TUK</option>
          <option value="validator_mkva">Validator MKVA</option>
          <option value="komite_teknis">Komite Teknis</option>
        </select>
      </div>

      {/* ===== LIST ASESO R ===== */}
      <div className="border rounded p-4 max-h-[400px] overflow-auto">

        {asesorList.map((item) => (
          <div
            key={item.id_user}
            className="flex items-center gap-3 border-b py-2"
          >

            <input
              type="checkbox"
              checked={selectedAsesor.includes(item.id_user)}
              onChange={() => toggleSelect(item.id_user)}
            />

            <div>
              <p className="font-bold">
                {item.profile?.nama_lengkap || item.username}
              </p>

              <p className="text-sm text-gray-500">
                No HP: {item.no_hp}
              </p>
            </div>

          </div>
        ))}

      </div>

      {/* ===== BUTTON SUBMIT ===== */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Menyimpan..." : "Tambah Asesor"}
      </button>

    </div>
  );
}