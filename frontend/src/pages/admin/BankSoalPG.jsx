import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bankSoalPGService } from "../../services/bankSoalPGService";
import { bankSoalService } from "../../services/bankSoalService";
import Swal from "sweetalert2";
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, Loader2, Settings, FileText, CheckCircle2, XCircle } from 'lucide-react';

const BankSoalPG = () => {
  const { id_soal } = useParams();
  const navigate = useNavigate();
  const [soalInfo, setSoalInfo] = useState(null);
  const [opsiList, setOpsiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    opsi_label: "",
    isi_opsi: "",
    is_benar: false,
  });

  // Jika tidak ada id_soal, tampilkan daftar soal PG
  const [soalPGList, setSoalPGList] = useState([]);

  useEffect(() => {
    if (id_soal) {
      fetchSoalInfo();
      fetchOpsi();
    } else {
      fetchSoalPG();
    }
  }, [id_soal]);

  const fetchSoalInfo = async () => {
    try {
      const res = await bankSoalService.getAll();
      const soal = res.data?.data?.find((s) => s.id_soal == id_soal);
      setSoalInfo(soal);
    } catch (error) {
      Swal.fire({ title: "Error", text: "Gagal memuat informasi soal", icon: "error", confirmButtonColor: '#CC6B27' });
    }
  };

  const fetchOpsi = async () => {
    setLoading(true);
    try {
      const res = await bankSoalPGService.getBySoal(id_soal);
      setOpsiList(res.data?.data || res.data || []);
    } catch (error) {
      Swal.fire({ title: "Error", text: "Gagal memuat opsi", icon: "error", confirmButtonColor: '#CC6B27' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSoalPG = async () => {
    setLoading(true);
    try {
      const res = await bankSoalService.getAll();
      const items = res.data?.data || res.data || [];
      // filter hanya yang jenis IA05_pg
      const filtered = items.filter((s) => s.jenis === "IA05_pg");
      setSoalPGList(filtered);
    } catch (error) {
      Swal.fire({ title: "Error", text: "Gagal memuat daftar soal PG", icon: "error", confirmButtonColor: '#CC6B27' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openModal = (opsi = null) => {
    if (opsi) {
      setEditingId(opsi.id_opsi);
      setFormData({
        opsi_label: opsi.opsi_label,
        isi_opsi: opsi.isi_opsi,
        is_benar: opsi.is_benar,
      });
    } else {
      setEditingId(null);
      setFormData({
        opsi_label: "",
        isi_opsi: "",
        is_benar: false,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id_soal: parseInt(id_soal),
      };
      if (editingId) {
        await bankSoalPGService.update(editingId, payload);
        Swal.fire({ title: "Berhasil", text: "Opsi berhasil diperbarui", icon: "success", confirmButtonColor: '#CC6B27' });
      } else {
        await bankSoalPGService.create(payload);
        Swal.fire({ title: "Berhasil", text: "Opsi berhasil ditambahkan", icon: "success", confirmButtonColor: '#CC6B27' });
      }
      closeModal();
      fetchOpsi();
    } catch (error) {
      Swal.fire({ title: "Error", text: "Gagal menyimpan opsi", icon: "error", confirmButtonColor: '#CC6B27' });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Opsi yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await bankSoalPGService.delete(id);
        Swal.fire({ title: "Terhapus", text: "Opsi berhasil dihapus", icon: "success", confirmButtonColor: '#CC6B27' });
        fetchOpsi();
      } catch (error) {
        Swal.fire({ title: "Error", text: "Gagal menghapus opsi", icon: "error", confirmButtonColor: '#CC6B27' });
      }
    }
  };

  // --- VIEW 1: DAFTAR SOAL PG (Jika id_soal tidak ada) ---
  if (!id_soal) {
    return (
      <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
              <Settings size={24} className="text-[#CC6B27]"/> Kelola Opsi Pilihan Ganda
            </h1>
            <p className="text-[14px] text-[#182D4A] m-0">Pilih salah satu soal untuk mengatur pilihan jawabannya (A, B, C, D, dst).</p>
          </div>
          <button onClick={() => navigate('/admin/bank-soal')} className="px-4 py-2 bg-white border border-[#071E3D]/20 text-[#182D4A] rounded-lg hover:bg-[#E2E8F0] shadow-sm transition-all font-bold flex items-center gap-2 text-[13px]">
             Kembali ke Bank Soal
          </button>
        </div>

        <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full text-left border-collapse min-w-max bg-white">
              <thead className="bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">
                <tr>
                  <th className="px-4 py-3.5 text-center w-16">ID Soal</th>
                  <th className="px-4 py-3.5">Unit Kompetensi</th>
                  <th className="px-4 py-3.5 w-1/2">Pertanyaan</th>
                  <th className="px-4 py-3.5 text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#071E3D]/5">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-16">
                      <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36}/>
                      <p className="text-[#182D4A] font-medium text-[14px]">Memuat data...</p>
                    </td>
                  </tr>
                ) : soalPGList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-16 text-[#182D4A]/50 font-medium text-[14px]">
                      Tidak ada soal dengan tipe Pilihan Ganda (PG) ditemukan.
                    </td>
                  </tr>
                ) : (
                  soalPGList.map((soal) => (
                    <tr key={soal.id_soal} className="hover:bg-[#CC6B27]/5 transition-colors">
                      <td className="px-4 py-4 text-center font-mono font-bold text-[#071E3D] text-[13px]">#{soal.id_soal}</td>
                      <td className="px-4 py-4 text-[#182D4A] text-[13px] font-medium">{soal.UnitKompetensi?.nama_unit || soal.UnitKompetensi?.judul_unit || "-"}</td>
                      <td className="px-4 py-4">
                          <div className="text-[13.5px] text-[#071E3D] font-bold leading-relaxed max-w-md truncate" title={soal.pertanyaan}>
                            {soal.pertanyaan}
                          </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => navigate(`/admin/bank-soal-pg/${soal.id_soal}`)}
                          className="px-3 py-2 bg-[#FAFAFA] text-[#071E3D] rounded-lg border border-[#071E3D]/20 hover:bg-[#071E3D]/10 hover:border-[#071E3D]/30 text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm mx-auto"
                        >
                          <Settings size={14} className="text-[#CC6B27]"/> Atur Opsi
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: KELOLA OPSI SPESIFIK UNTUK SOAL TERTENTU ---
  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/admin/bank-soal-pg')} className="p-2.5 mt-1 bg-white border border-[#071E3D]/10 rounded-lg hover:bg-[#CC6B27]/10 hover:border-[#CC6B27]/30 text-[#182D4A] transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
              <Settings size={24} className="text-[#CC6B27]"/> Manajemen Opsi Jawaban
            </h1>
            {soalInfo ? (
              <p className="text-[13px] text-[#182D4A] font-medium m-0 leading-relaxed bg-white border border-[#071E3D]/10 p-2 rounded-lg mt-2 inline-block shadow-sm">
                 <strong className="text-[#071E3D]">Soal:</strong> {soalInfo.pertanyaan}
              </p>
            ) : (
                <p className="text-[13px] text-[#182D4A] m-0">Menyiapkan data soal...</p>
            )}
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 bg-[#CC6B27] text-white rounded-lg hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all font-bold flex items-center gap-2 text-[13px] self-end md:self-auto"
        >
          <Plus size={18} /> Tambah Opsi
        </button>
      </div>

      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead className="bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">
              <tr>
                <th className="px-4 py-3.5 text-center w-16">Label</th>
                <th className="px-4 py-3.5">Isi Pilihan Jawaban</th>
                <th className="px-4 py-3.5 text-center w-40">Kunci Jawaban</th>
                <th className="px-4 py-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071E3D]/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-16">
                     <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36}/>
                  </td>
                </tr>
              ) : opsiList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-[#182D4A]/50 font-medium text-[14px]">
                    Belum ada opsi jawaban yang ditambahkan.
                  </td>
                </tr>
              ) : (
                opsiList.map((opsi) => (
                  <tr key={opsi.id_opsi} className="hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="px-4 py-4 text-center font-mono font-bold text-[#071E3D] text-[16px] uppercase">{opsi.opsi_label}</td>
                    <td className="px-4 py-4 text-[#182D4A] text-[13.5px] font-medium leading-relaxed">{opsi.isi_opsi}</td>
                    <td className="px-4 py-4 text-center">
                      {opsi.is_benar ? (
                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 size={14}/> Benar
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border bg-red-50 text-red-700 border-red-200">
                           <XCircle size={14}/> Salah
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openModal(opsi)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#071E3D] hover:bg-[#071E3D]/10 transition-colors" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(opsi.id_opsi)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM OPSI */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col zoom-in-95">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2 m-0">
                {editingId ? <><Edit2 size={20} className="text-[#CC6B27]"/> Edit Opsi Jawaban</> : <><Plus size={20} className="text-[#CC6B27]"/> Tambah Opsi Jawaban</>}
              </h3>
              <button onClick={closeModal} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            <form id="opsiForm" onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#071E3D]">Label Opsi <span className="text-red-500">*</span></label>
                <p className="text-[11px] text-[#182D4A]/70 font-medium m-0">Gunakan satu huruf, misal: A, B, C, atau D.</p>
                <input
                  type="text"
                  name="opsi_label"
                  value={formData.opsi_label}
                  onChange={handleInputChange}
                  maxLength="1"
                  required
                  className="w-full mt-1 p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-bold text-[14px] uppercase placeholder:font-normal placeholder:lowercase w-24 text-center"
                  placeholder="A"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#071E3D]">Isi Pilihan Jawaban <span className="text-red-500">*</span></label>
                <textarea
                  name="isi_opsi"
                  value={formData.isi_opsi}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] resize-none"
                  placeholder="Ketik teks jawaban disini..."
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <input
                  type="checkbox"
                  id="is_benar"
                  name="is_benar"
                  checked={formData.is_benar}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-[#CC6B27] bg-white border-gray-300 rounded focus:ring-[#CC6B27] cursor-pointer"
                />
                <label htmlFor="is_benar" className="text-[13px] font-bold text-blue-900 cursor-pointer select-none">
                  Tandai ini sebagai kunci jawaban yang Benar
                </label>
              </div>
            </form>

            <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">Batal</button>
              <button type="submit" form="opsiForm" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]">
                <Save size={16}/> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSoalPG;