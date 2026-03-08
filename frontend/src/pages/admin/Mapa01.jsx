import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { ArrowLeft, Save, CheckCircle, Loader2, List } from 'lucide-react';

const Mapa01 = () => {
  const { id } = useParams(); // Ambil ID MAPA dari URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masterData, setMasterData] = useState(null);

  // State Form sesuai dengan kolom di database
  const [formData, setFormData] = useState({
    profil_asesi: '',
    tujuan_asesmen: 'sertifikasi',
    lingkungan: 'tempat_kerja_nyata',
    peluang_bukti: 'tersedia',
    pelaksana: 'lsp'
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // 1. Ambil data Master MAPA (untuk menampilkan nama Skema di header)
        const masterRes = await api.get(`/admin/mapa/${id}`);
        const master = masterRes.data?.data || masterRes.data;
        setMasterData(master);

        // 2. Coba ambil isi form MAPA-01 jika sebelumnya sudah pernah di-save
        const res = await api.get(`/admin/mapa01/${id}`);
        const m01Data = res.data?.data || res.data;
        
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
        // Jika error (biasanya karena belum ada data / 404), biarkan form kosong
        console.log("Data MAPA-01 belum ada, menggunakan form kosong.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Mengirim data ke backend, pastikan id_mapa ikut terkirim
      await api.post('/admin/mapa01', { ...formData, id_mapa: id });
      Swal.fire({title: 'Berhasil', text: 'Dokumen rincian MAPA-01 berhasil disimpan', icon: 'success', confirmButtonColor: '#CC6B27'});
      navigate('/admin/asesi/mapa'); // Setelah sukses, kembali ke tabel MAPA
    } catch (error) {
      Swal.fire({title: 'Gagal', text: error.response?.data?.message || 'Terjadi kesalahan', icon: 'error', confirmButtonColor: '#CC6B27'});
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-[#FAFAFA]"><Loader2 className="animate-spin text-[#CC6B27]" size={50} /></div>;
  }

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* Header Halaman */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/asesi/mapa')} className="p-2 bg-white border border-[#071E3D]/10 rounded-lg hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] text-[#182D4A] transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
            <List size={24} className="text-[#CC6B27]"/> Pengisian MAPA-01
          </h1>
          <p className="text-[14px] text-[#182D4A] m-0">
            Skema: <span className="font-bold text-[#071E3D]">{masterData?.skema?.judul_skema || '-'}</span> (Versi: {masterData?.versi || '-'})
          </p>
        </div>
      </div>

      {/* Area Form */}
      <div className="bg-white rounded-xl shadow-sm border border-[#071E3D]/10 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 space-y-6">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#071E3D]">Konteks / Profil Asesi <span className="text-red-500">*</span></label>
              <p className="text-[12px] text-[#182D4A]/70 mb-1 font-medium">Jelaskan latar belakang peserta, contoh: Mahasiswa semester akhir, karyawan perusahaan X, dll.</p>
              <textarea 
                name="profil_asesi" value={formData.profil_asesi} onChange={handleChange} 
                rows="4" placeholder="Masukkan rincian profil asesi..." required
                className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-[#071E3D]/10">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#071E3D]">Tujuan Asesmen</label>
                <select name="tujuan_asesmen" value={formData.tujuan_asesmen} onChange={handleChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none">
                  <option value="sertifikasi">Sertifikasi Baru</option>
                  <option value="sertifikasi_ulang">Sertifikasi Ulang (RCC)</option>
                  <option value="pkt">Pengakuan Kompetensi Terkini (PKT)</option>
                  <option value="rpl">Rekognisi Pembelajaran Lampau (RPL)</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#071E3D]">Lingkungan Asesmen</label>
                <select name="lingkungan" value={formData.lingkungan} onChange={handleChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none">
                  <option value="tempat_kerja_nyata">Tempat Kerja Nyata (TUK Tempat Kerja)</option>
                  <option value="tempat_kerja_simulasi">Tempat Kerja Simulasi (TUK Sewaktu/Mandiri)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#071E3D]">Peluang Bukti</label>
                <select name="peluang_bukti" value={formData.peluang_bukti} onChange={handleChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none">
                  <option value="tersedia">Tersedia (Mudah dikumpulkan)</option>
                  <option value="terbatas">Terbatas (Butuh simulasi khusus)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#071E3D]">Pihak Pelaksana / Penanggung Jawab</label>
                <select name="pelaksana" value={formData.pelaksana} onChange={handleChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none">
                  <option value="lsp">Lembaga Sertifikasi Profesi (LSP)</option>
                  <option value="organisasi_pelatihan">Organisasi Pelatihan</option>
                  <option value="asesor_perusahaan">Asesor Perusahaan Internal</option>
                </select>
              </div>
            </div>

          </div>

          <div className="bg-[#FAFAFA] p-6 border-t border-[#071E3D]/10 flex justify-end gap-3 mt-auto rounded-b-xl">
            <button type="button" onClick={() => navigate('/admin/asesi/mapa')} className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">
              Batal
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px] disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Simpan MAPA-01
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Mapa01;