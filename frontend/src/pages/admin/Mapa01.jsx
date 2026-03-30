import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { ArrowLeft, Save, Loader2, FileText } from 'lucide-react';

const Mapa01 = () => {
  const { id } = useParams(); // Ambil ID MAPA dari URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masterData, setMasterData] = useState(null);

  // State Form sesuai dengan ENUM di database mapa01.model.js
  const [formData, setFormData] = useState({
    profil_asesi: '',
    tujuan_asesmen: 'sertifikasi',
    lingkungan: 'tempat_kerja_nyata',
    peluang_bukti: 'tersedia',
    pelaksana: 'lsp'
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. Ambil data Master MAPA (untuk header nama Skema)
      const masterRes = await api.get(`/admin/mapa/${id}`);
      setMasterData(masterRes.data?.data || masterRes.data);

      // 2. Ambil isi form MAPA-01 jika sebelumnya sudah pernah di-save
      const res = await api.get(`/admin/mapa01/${id}`);
      const m01Data = res.data?.data || res.data;
      
      // Jika data ditemukan, masukkan ke form
      if (m01Data && Object.keys(m01Data).length > 0) {
        setFormData({
          profil_asesi: m01Data.profil_asesi || '',
          tujuan_asesmen: m01Data.tujuan_asesmen || 'sertifikasi',
          lingkungan: m01Data.lingkungan || 'tempat_kerja_nyata',
          peluang_bukti: m01Data.peluang_bukti || 'tersedia',
          pelaksana: m01Data.pelaksana || 'lsp'
        });
      }
    } catch (error) {
      console.error("Gagal memuat MAPA 01", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Pastikan id_mapa dikirim sebagai Integer
      const payload = {
        ...formData,
        id_mapa: parseInt(id) 
      };
      
      // Endpoint sesuai di admin.routes.js (POST /mapa01)
      await api.post(`/admin/mapa01`, payload);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Dokumen MAPA-01 berhasil disimpan.',
        icon: 'success',
        confirmButtonColor: '#CC6B27',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        // PERBAIKAN: Kembali ke halaman sebelumnya dengan aman
        navigate(-1);
      });
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Gagal menyimpan MAPA-01', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-[#CC6B27]" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-[#071E3D] rounded-2xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          
          {/* PERBAIKAN: Tombol Kembali menggunakan navigate(-1) */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#FAFAFA]/70 hover:text-white mb-4 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/10 p-3 rounded-xl border border-white/20">
              <FileText className="text-[#CC6B27]" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">Perencanaan Aktivitas & Proses (MAPA-01)</h1>
              <p className="text-[#FAFAFA]/70 text-sm">
                Skema: {masterData?.skema?.nama_skema || masterData?.skema?.judul_skema || "Memuat..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM MAPA-01 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-6 space-y-6 flex-1">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#071E3D]">1. Profil Asesi (Opsional)</label>
            <textarea
              name="profil_asesi"
              value={formData.profil_asesi}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-sm focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none"
              placeholder="Deskripsikan profil asesi (misal: Siswa SMK, Pekerja, dll)..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#071E3D]">2. Tujuan Asesmen</label>
              <select name="tujuan_asesmen" value={formData.tujuan_asesmen} onChange={handleChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-sm focus:border-[#CC6B27] outline-none font-medium">
                <option value="sertifikasi">Sertifikasi</option>
                <option value="sertifikasi_ulang">Sertifikasi Ulang</option>
                <option value="pkt">Pengakuan Kompetensi Terkini (PKT)</option>
                <option value="rpl">Rekognisi Pembelajaran Lampau (RPL)</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#071E3D]">3. Lingkungan Asesmen</label>
              <select name="lingkungan" value={formData.lingkungan} onChange={handleChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-sm focus:border-[#CC6B27] outline-none font-medium">
                <option value="tempat_kerja_nyata">Tempat Kerja Nyata</option>
                <option value="tempat_kerja_simulasi">Tempat Kerja Simulasi</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#071E3D]">4. Peluang Pengumpulan Bukti</label>
              <select name="peluang_bukti" value={formData.peluang_bukti} onChange={handleChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-sm focus:border-[#CC6B27] outline-none font-medium">
                <option value="tersedia">Tersedia (Sangat Baik)</option>
                <option value="terbatas">Terbatas</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#071E3D]">5. Pelaksana Asesmen</label>
              <select name="pelaksana" value={formData.pelaksana} onChange={handleChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-sm focus:border-[#CC6B27] outline-none font-medium">
                <option value="lsp">Lembaga Sertifikasi Profesi (LSP)</option>
                <option value="organisasi_pelatihan">Organisasi Pelatihan</option>
                <option value="asesor_perusahaan">Asesor Perusahaan Internal</option>
              </select>
            </div>
          </div>

        </div>

        <div className="bg-[#FAFAFA] p-5 border-t border-slate-100 flex justify-end gap-3 mt-auto rounded-b-xl">
          
          {/* PERBAIKAN: Tombol Batal menggunakan navigate(-1) */}
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-lg font-bold border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 transition-colors text-sm">
            Batal
          </button>
          
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-md flex items-center gap-2 text-sm disabled:opacity-70">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan Dokumen MAPA-01
          </button>
        </div>
      </form>
    </div>
  );
};

export default Mapa01;