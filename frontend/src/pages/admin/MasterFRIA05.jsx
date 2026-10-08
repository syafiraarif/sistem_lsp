import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Edit, Image, Loader2, Plus, Save, Trash2, X, Download } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";

const defaultOpsi = [
  { kode_opsi: "A", jawaban: "", is_benar: false },
  { kode_opsi: "B", jawaban: "", is_benar: false },
  { kode_opsi: "C", jawaban: "", is_benar: false },
  { kode_opsi: "D", jawaban: "", is_benar: false },
  { kode_opsi: "E", jawaban: "", is_benar: false },
];

export default function MasterFRIA05() {                                                          
  const { id_skema } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [skema, setSkema] = useState(null);
  const [paket, setPaket] = useState(null);
  
  const [formPaket, setFormPaket] = useState({
    kode_paket: "",
    judul_paket: "Master Paket Soal FR.IA.05",
    passing_grade: 70,
    waktu: 90,
  });
  const [showSoalModal, setShowSoalModal] = useState(false);
  const [editingSoal, setEditingSoal] = useState(null);
  const [formSoal, setFormSoal] = useState({
    pertanyaan: "",
    gambar_file: null,
    gambar_preview: "",
    gambar_lama: "",
    hapus_gambar: false,
    urutan: "",
    opsi: defaultOpsi.map((item) => ({ ...item })),
  });

  useEffect(() => {
    fetchData();
  }, [id_skema]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/fr-ia05/skema/${id_skema}`);
      const data = res.data?.data || {};
      
      setSkema(data.skema);
      setPaket(data.paket);
      if (data.paket) {
        setFormPaket({
          kode_paket: data.paket.kode_paket || `MASTER-FRIA05-${id_skema}`,
          judul_paket: data.paket.judul_paket || "Master Paket Soal FR.IA.05",
          passing_grade: data.paket.passing_grade || 70,
          waktu: data.paket.waktu || 90,
        });
      } else {
        setFormPaket((prev) => ({ ...prev, kode_paket: `MASTER-FRIA05-${id_skema}` }));
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.message || "Gagal memuat master soal", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePaketChange = (e) => {
    setFormPaket((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const savePaket = async () => {
    try {
      setSaving(true);
      const res = await api.post("/admin/fr-ia05/paket", {
        id_skema,
        ...formPaket
      });
      setPaket(res.data?.data || null);
      Swal.fire({ title: "Berhasil", text: "Header Master Paket berhasil disimpan", icon: "success", timer: 1300, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menyimpan paket", "error");
    } finally {
      setSaving(false);
    }
  };

  const ensurePaket = async () => {
    if (paket?.id_fr_ia_05) return paket;
    const res = await api.post("/admin/fr-ia05/paket", { id_skema, ...formPaket });
    setPaket(res.data?.data);
    return res.data?.data;
  };

  const openAddSoal = async () => {
    try {
      setSaving(true);
      await ensurePaket();
      setEditingSoal(null);
      setFormSoal({
        pertanyaan: "", gambar_file: null, gambar_preview: "", gambar_lama: "", hapus_gambar: false,
        urutan: (paket?.soal?.length || 0) + 1,
        opsi: defaultOpsi.map((item) => ({ ...item })),
      });
      setShowSoalModal(true);
    } catch (err) {
      Swal.fire("Gagal", "Gagal membuat paket soal", "error");
    } finally {
      setSaving(false);
    }
  };

  const openEditSoal = (soal) => {
    const opsi = Array.isArray(soal.opsi) && soal.opsi.length
      ? soal.opsi.map((item) => ({ kode_opsi: item.kode_opsi, jawaban: item.jawaban || "", is_benar: Boolean(item.is_benar) }))
      : defaultOpsi.map((item) => ({ ...item }));
    setEditingSoal(soal);
    setFormSoal({
      pertanyaan: soal.pertanyaan || "",
      gambar_file: null,
      gambar_preview: soal.gambar ? normalizeImageUrl(soal.gambar) : "",
      gambar_lama: soal.gambar || "",
      hapus_gambar: false,
      urutan: soal.urutan || "",
      opsi,
    });
    setShowSoalModal(true);
  };

  const closeSoalModal = () => {
    if (formSoal.gambar_preview && formSoal.gambar_file) URL.revokeObjectURL(formSoal.gambar_preview);
    setShowSoalModal(false);
    setEditingSoal(null);
  };

  const handleGambarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return Swal.fire("Ukuran Besar", "Maksimal gambar 2 MB", "warning");
    setFormSoal((prev) => ({ ...prev, gambar_file: file, gambar_preview: URL.createObjectURL(file), hapus_gambar: false }));
  };

  const saveSoal = async (e) => {
    e.preventDefault();
    if (!formSoal.pertanyaan.trim()) return Swal.fire("Validasi", "Pertanyaan wajib diisi", "warning");
    if (formSoal.opsi.some((item) => !item.jawaban.trim())) return Swal.fire("Validasi", "Semua opsi wajib diisi", "warning");
    if (!formSoal.opsi.some((item) => item.is_benar)) return Swal.fire("Validasi", "Pilih satu jawaban benar", "warning");
    try {
      setSaving(true);
      const currentPaket = await ensurePaket();
      const formData = new FormData();
      
      formData.append("id_fr_ia_05", currentPaket.id_fr_ia_05);
      formData.append("pertanyaan", formSoal.pertanyaan);
      formData.append("urutan", formSoal.urutan || (paket?.soal?.length || 0) + 1);
      formData.append("opsi", JSON.stringify(formSoal.opsi));
      formData.append("gambar_lama", formSoal.gambar_lama || "");
      formData.append("hapus_gambar", formSoal.hapus_gambar ? "true" : "false");
      if (formSoal.gambar_file) formData.append("gambar_file", formSoal.gambar_file);
      let res = editingSoal 
        ? await api.put(`/admin/fr-ia05/soal/${editingSoal.id_soal}`, formData, { headers: { "Content-Type": "multipart/form-data" }})
        : await api.post("/admin/fr-ia05/soal", formData, { headers: { "Content-Type": "multipart/form-data" }});
      setPaket(res.data?.data || null);
      closeSoalModal();
      Swal.fire({ title: "Berhasil", text: "Pertanyaan berhasil disimpan", icon: "success", timer: 1300, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menyimpan pertanyaan", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteSoal = async (soal) => {
    const confirm = await Swal.fire({ title: "Hapus Pertanyaan?", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Hapus" });
    if (!confirm.isConfirmed) return;
    try {
      setSaving(true);
      const res = await api.delete(`/admin/fr-ia05/soal/${soal.id_soal}`);
      setPaket(res.data?.data || null);
      Swal.fire({ title: "Terhapus", text: "Pertanyaan berhasil dihapus", icon: "success", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menghapus", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#CC6B27]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-5 flex w-[900px] justify-end print:hidden">
        <div className="flex gap-3">
          <button type="button" onClick={savePaket} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#CC6B27] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#a8561f]">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Simpan Info Master
          </button>
          <button type="button" onClick={openAddSoal} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#182D4A]">
            <Plus size={18} /> Tambah Pertanyaan
          </button>
        </div>
      </div>
      <main className="mx-auto w-[794px] bg-white px-8 py-8 text-[11px] text-black shadow-lg print:w-full print:shadow-none print:px-4 print:py-4">
        <div className="mb-6 text-center">
          <h1 className="text-[18px] font-bold">MASTER FR.IA.05A. DPT</h1>
          <p className="text-[15px] font-semibold">PERTANYAAN TERTULIS PILIHAN GANDA (MASTER SOAL)</p>
        </div>
        <table className="w-full border-collapse border border-black text-[12px]">
          <tbody>
            <tr>
              <td rowSpan="2" className="w-[240px] border border-black px-2 py-1 font-bold leading-tight">
                Skema Sertifikasi
              </td>
              <td className="w-[90px] border border-black px-2 py-1 font-bold">Judul</td>
              <td className="w-[20px] border border-black px-2 py-1 text-center">:</td>
              <td className="border border-black px-2 py-1 font-bold text-[#CC6B27]">{skema?.judul_skema || "-"}</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1 font-bold">Nomor</td>
              <td className="border border-black px-2 py-1 text-center">:</td>
              <td className="border border-black px-2 py-1 font-bold text-[#CC6B27]">{skema?.kode_skema || "-"}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">Kode Paket Master</td>
              <td className="border border-black px-2 py-1 text-center">:</td>
              <td className="border border-black px-2 py-1">
                <input type="text" name="kode_paket" value={formPaket.kode_paket} onChange={handlePaketChange} className="w-full font-bold outline-none text-[#071E3D] border-b border-dashed border-slate-300 print:border-none" />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">Alokasi Waktu (Menit)</td>
              <td className="border border-black px-2 py-1 text-center">:</td>
              <td className="border border-black px-2 py-1">
                <input type="number" name="waktu" value={formPaket.waktu} onChange={handlePaketChange} className="w-20 font-bold outline-none text-[#071E3D] border-b border-dashed border-slate-300 print:border-none" /> Menit
              </td>
            </tr>
          </tbody>
        </table>
        <table className="mt-6 w-full border-collapse border border-black text-[13px]">
          <tbody>
            {!paket?.soal?.length ? (
              <tr><td className="border border-black px-3 py-10 text-center text-slate-500 font-bold">Belum ada pertanyaan di Master Bank Soal ini.</td></tr>
            ) : (
              paket.soal.map((soal, soalIndex) => (
                <tr key={soal.id_soal}>
                  <td className="w-[45px] border border-black px-2 py-3 align-top text-center font-bold">{soalIndex + 1}</td>
                  <td className="border border-black px-4 py-3 align-top">
                    <div className="flex justify-between gap-3">
                      <p className="font-semibold leading-6 text-justify">{soal.pertanyaan}</p>
                      <div className="flex gap-2 print:hidden shrink-0">
                        <button type="button" onClick={() => openEditSoal(soal)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1.5 rounded"><Edit size={16} /></button>
                        <button type="button" onClick={() => deleteSoal(soal)} className="text-red-600 hover:text-red-800 bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    {soal.gambar && (
                      <div className="my-3"><img src={normalizeImageUrl(soal.gambar)} alt="Gambar soal" className="max-h-[150px] border rounded object-contain" /></div>
                    )}
                    <div className="mt-3 space-y-2 pl-2">
                      {(soal.opsi || []).map((opsi) => (
                        <div key={opsi.kode_opsi} className={`flex items-start gap-2 p-1.5 rounded ${opsi.is_benar ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200" : ""}`}>
                          <span className="w-5">{opsi.kode_opsi}.</span>
                          <span className="flex-1">{opsi.jawaban}</span>
                          {opsi.is_benar && <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full print:hidden">Kunci Jawaban</span>}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
      
      {/* Modal Soal (Sama dengan Asesor) */}
      {showSoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/50 p-4 backdrop-blur-sm print:hidden">
          <form onSubmit={saveSoal} className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4 bg-[#FAFAFA]">
              <h3 className="text-lg font-black text-[#071E3D]">{editingSoal ? "Edit Master Pertanyaan" : "Tambah Master Pertanyaan"}</h3>
              <button type="button" onClick={closeSoalModal} className="rounded-xl border p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><X size={18} /></button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div>
                <label className="mb-2 block text-xs font-black uppercase text-slate-500">Pertanyaan</label>
                <textarea name="pertanyaan" value={formSoal.pertanyaan} onChange={(e) => setFormSoal(p=>({...p, pertanyaan: e.target.value}))} rows="3" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#CC6B27]" placeholder="Tuliskan pertanyaan..." required />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase text-slate-500">Gambar Pendukung (Opsional)</label>
                <input type="file" accept="image/*" onChange={handleGambarChange} className="w-full rounded-xl border px-4 py-2 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#CC6B27]/10 file:text-[#CC6B27]" />
                {formSoal.gambar_preview && (
                  <div className="mt-3 relative inline-block border p-2 rounded-xl bg-slate-50">
                    <button type="button" onClick={() => setFormSoal(p=>({...p, gambar_file: null, gambar_preview: "", hapus_gambar: true}))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14}/></button>
                    <img src={formSoal.gambar_preview} alt="Preview" className="max-h-32 rounded-lg" />
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-black uppercase text-slate-500">Pilihan Ganda & Kunci Jawaban</p>
                <div className="space-y-3">
                  {formSoal.opsi.map((opsi, index) => (
                    <div key={opsi.kode_opsi} className={`flex items-center gap-3 p-2 rounded-lg border ${opsi.is_benar ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
                      <div className="font-black text-[#071E3D] w-6">{opsi.kode_opsi}.</div>
                      <input value={opsi.jawaban} onChange={(e) => setFormSoal(p=>({...p, opsi: p.opsi.map((o, i) => i === index ? {...o, jawaban: e.target.value} : o)}))} className="flex-1 bg-transparent border-none outline-none text-sm font-semibold" placeholder={`Jawaban ${opsi.kode_opsi}`} required />
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input type="radio" name="jawaban_benar" className="w-4 h-4 accent-emerald-600" checked={Boolean(opsi.is_benar)} onChange={() => setFormSoal(p=>({...p, opsi: p.opsi.map((o, i) => ({...o, is_benar: i === index}))}))} />
                        Kunci
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t bg-[#FAFAFA] px-6 py-4">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#CC6B27] px-6 py-2.5 text-[13px] font-bold text-white hover:bg-[#a8561f] disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Pertanyaan
              </button>
            </div>
          </form>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
      `}} />
    </div>
  );
}

function normalizeImageUrl(value) {
  if (!value) return "";
  if (String(value).startsWith("http") || String(value).startsWith("blob:")) return value;
  const base = api.defaults.baseURL || "http://localhost:3000/api";
  const rootBase = base.replace(/\/api\/?$/, "");
  return String(value).startsWith("/") ? `${rootBase}${value}` : `${rootBase}/${value}`;
}