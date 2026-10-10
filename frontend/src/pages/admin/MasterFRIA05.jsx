// frontend/src/pages/admin/MasterFRIA05.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Loader2, Plus, Save, Trash2, X, Download, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";

const defaultOpsi = [
  { kode_opsi: "A", jawaban: "", is_benar: false }, { kode_opsi: "B", jawaban: "", is_benar: false },
  { kode_opsi: "C", jawaban: "", is_benar: false }, { kode_opsi: "D", jawaban: "", is_benar: false },
  { kode_opsi: "E", jawaban: "", is_benar: false },
];

export default function MasterFRIA05() {
  const { id_skema } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skema, setSkema] = useState(null);
  const [paket, setPaket] = useState(null);
  const [listAsesor, setListAsesor] = useState([]);

  const [formPaket, setFormPaket] = useState({ kode_paket: "", judul_paket: "Master Paket Soal FR.IA.05", passing_grade: 70, waktu: 90 });
  
  const [formPerson, setFormPerson] = useState({
    penyusun: [{ id_user: "", nama: "", nomor_met: "", ttd: "", tanggal: "" }],
    validator: [{ id_user: "", nama: "", nomor_met: "", ttd: "", tanggal: "" }],
  });

  const [showSoalModal, setShowSoalModal] = useState(false);
  const [editingSoal, setEditingSoal] = useState(null);
  const [formSoal, setFormSoal] = useState({ pertanyaan: "", gambar_file: null, gambar_preview: "", gambar_lama: "", hapus_gambar: false, urutan: "", opsi: defaultOpsi.map(i => ({...i})) });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fria05Res, asesorRes] = await Promise.allSettled([
        api.get(`/admin/fr-ia05/skema/${id_skema}`),
        api.get("/admin/asesor")
      ]);

      if (asesorRes.status === "fulfilled") setListAsesor(Array.isArray(asesorRes.value.data?.data) ? asesorRes.value.data.data : []);

      if (fria05Res.status === "fulfilled") {
        const data = fria05Res.value.data?.data || {};
        setSkema(data.skema); setPaket(data.paket);
        if (data.paket) {
          setFormPaket({ kode_paket: data.paket.kode_paket, judul_paket: data.paket.judul_paket, passing_grade: data.paket.passing_grade, waktu: data.paket.waktu });
          
          if (data.paket.validator) {
             const penyusun = []; const validator = [];
             data.paket.validator.forEach((item) => {
                const vData = { id_user: item?.id_asesor || "", nama: item?.asesor?.nama_lengkap || "", nomor_met: item?.asesor?.no_lisensi || item?.asesor?.no_reg_asesor || "", ttd: item?.asesor?.ttd_path || "", tanggal: item?.tanggal || "" };
                if (item?.peran === "penyusun") penyusun.push(vData);
                if (item?.peran === "validator") validator.push(vData);
             });
             setFormPerson({ penyusun: penyusun.length ? penyusun : formPerson.penyusun, validator: validator.length ? validator : formPerson.validator });
          }
        } else {
          setFormPaket(p => ({ ...p, kode_paket: `MASTER-FRIA05-${id_skema}` }));
        }
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, [id_skema]);

  const savePaket = async () => {
    try {
      setSaving(true);
      const validators = [
        ...formPerson.penyusun.filter(i => i.id_user).map((i, idx) => ({ id_asesor: Number(i.id_user), peran: "penyusun", urutan: idx + 1 })),
        ...formPerson.validator.filter(i => i.id_user).map((i, idx) => ({ id_asesor: Number(i.id_user), peran: "validator", urutan: idx + 1 })),
      ];
      const res = await api.post("/admin/fr-ia05/paket", { id_skema, ...formPaket, validators });
      setPaket(res.data?.data || null);
      Swal.fire({ title: "Berhasil", icon: "success", timer: 1300, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Gagal", "Gagal menyimpan paket", "error");
    } finally {
      setSaving(false);
    }
  };

  const ensurePaket = async () => {
    if (paket?.id_fr_ia_05) return paket;
    const res = await api.post("/admin/fr-ia05/paket", { id_skema, ...formPaket });
    setPaket(res.data?.data); return res.data?.data;
  };

  const openAddSoal = async () => {
    await ensurePaket();
    setEditingSoal(null);
    setFormSoal({ pertanyaan: "", gambar_file: null, gambar_preview: "", gambar_lama: "", hapus_gambar: false, urutan: (paket?.soal?.length || 0) + 1, opsi: defaultOpsi.map(i => ({...i})) });
    setShowSoalModal(true);
  };

  const saveSoal = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const currentPaket = await ensurePaket();
      const formData = new FormData();
      formData.append("id_fr_ia_05", currentPaket.id_fr_ia_05);
      formData.append("pertanyaan", formSoal.pertanyaan);
      formData.append("urutan", formSoal.urutan || (paket?.soal?.length || 0) + 1);
      formData.append("opsi", JSON.stringify(formSoal.opsi));
      formData.append("hapus_gambar", formSoal.hapus_gambar ? "true" : "false");
      if (formSoal.gambar_file) formData.append("gambar_file", formSoal.gambar_file);
      
      let res = editingSoal ? await api.put(`/admin/fr-ia05/soal/${editingSoal.id_soal}`, formData) : await api.post("/admin/fr-ia05/soal", formData);
      setPaket(res.data?.data || null);
      setShowSoalModal(false);
      Swal.fire({ title: "Berhasil", icon: "success", timer: 1300, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Gagal", "Gagal menyimpan pertanyaan", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteSoal = async (soal) => {
    const confirm = await Swal.fire({ title: "Hapus?", icon: "warning", showCancelButton: true });
    if (!confirm.isConfirmed) return;
    const res = await api.delete(`/admin/fr-ia05/soal/${soal.id_soal}`);
    setPaket(res.data?.data || null);
  };

  const updatePerson = (type, index, field, value) => setFormPerson(p => ({ ...p, [type]: p[type].map((item, i) => i === index ? { ...item, [field]: value } : item) }));
  const addPerson = (type) => setFormPerson(p => ({ ...p, [type]: [...p[type], { id_user: "", nama: "", nomor_met: "", ttd: "", tanggal: "" }] }));
  const removePerson = (type, index) => setFormPerson(p => ({ ...p, [type]: p[type].filter((_, i) => i !== index) }));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#CC6B27]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-6 print:bg-white print:py-0">
      <style>{`@media print { @page { size: A4; margin: 10mm; } input, select { border: none !important; appearance: none; background: transparent; } .print-hidden { display: none !important; } }`}</style>
      
      <div className="mx-auto mb-5 flex w-[900px] justify-between print-hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl font-bold shadow-sm"><ArrowLeft size={18}/> Kembali</button>
        <div className="flex gap-3">
          <button onClick={savePaket} disabled={saving} className="flex gap-2 bg-orange-100 text-orange-600 px-5 py-3 rounded-xl font-bold"><Save size={18}/> Simpan Header</button>
          <button onClick={openAddSoal} className="flex gap-2 bg-[#071E3D] text-white px-5 py-3 rounded-xl font-bold"><Plus size={18}/> Tambah Pertanyaan</button>
          <button onClick={() => window.print()} className="flex gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold"><Download size={18}/> Cetak</button>
        </div>
      </div>

      <main className="mx-auto w-[900px] bg-white px-10 py-8 text-[12px] text-black shadow-lg print:w-full print:shadow-none print:px-4">
        <div className="mb-6 text-center">
          <h1 className="text-[18px] font-bold">FR.IA.05A. DPT</h1>
          <p className="text-[14px] font-semibold">PERTANYAAN TERTULIS PILIHAN GANDA</p>
        </div>
        
        <table className="w-full border-collapse border border-black text-[13px] mb-5">
          <tbody>
            <tr><td rowSpan="2" className="w-[240px] border border-black px-2 py-1 font-bold">Skema Sertifikasi</td><td className="w-[90px] border border-black px-2 py-1 font-bold">Judul</td><td className="w-[20px] border border-black px-2 py-1 text-center">:</td><td className="border border-black px-2 py-1 font-bold">{skema?.judul_skema || "-"}</td></tr>
            <tr><td className="border border-black px-2 py-1 font-bold">Nomor</td><td className="border border-black px-2 py-1 text-center">:</td><td className="border border-black px-2 py-1 font-bold">{skema?.kode_skema || "-"}</td></tr>
            <tr><td colSpan="2" className="border border-black px-2 py-1 font-bold">Kode Paket</td><td className="border border-black px-2 py-1 text-center">:</td><td className="border border-black px-2 py-1"><input value={formPaket.kode_paket} onChange={e => setFormPaket({...formPaket, kode_paket: e.target.value})} className="w-full font-bold outline-none border-b border-dashed border-slate-300 print:border-none bg-transparent" /></td></tr>
            <tr><td colSpan="2" className="border border-black px-2 py-1 font-bold">Waktu</td><td className="border border-black px-2 py-1 text-center">:</td><td className="border border-black px-2 py-1"><input value={formPaket.waktu} onChange={e => setFormPaket({...formPaket, waktu: e.target.value})} className="w-16 font-bold outline-none border-b border-dashed border-slate-300 print:border-none bg-transparent" /> Menit</td></tr>
          </tbody>
        </table>

        <p className="italic mb-2 text-[12px]">*Coret yang tidak perlu <br/> Jawab semua pertanyaan berikut:</p>

        {/* Tabel Pertanyaan */}
        <table className="w-full border-collapse border border-black text-[13px]">
          <tbody>
            {!paket?.soal?.length ? (
              <tr><td className="border border-black px-3 py-10 text-center text-slate-500 font-bold">Belum ada pertanyaan. Klik tombol Tambah Pertanyaan.</td></tr>
            ) : (
              paket.soal.map((soal, i) => (
                <tr key={soal.id_soal}>
                  <td className="w-[40px] border border-black px-2 py-3 align-top text-center font-bold">{i + 1}.</td>
                  <td className="border border-black px-4 py-3 align-top">
                    <div className="flex justify-between">
                      <p className="font-semibold">{soal.pertanyaan}</p>
                      <div className="flex gap-2 print-hidden">
                        <button onClick={() => {setEditingSoal(soal); setFormSoal({...soal, opsi: soal.opsi}); setShowSoalModal(true);}} className="text-blue-600 bg-blue-50 p-1 rounded"><Edit size={14}/></button>
                        <button onClick={() => deleteSoal(soal)} className="text-red-600 bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      {soal.opsi.map(o => (
                        <div key={o.kode_opsi} className="flex gap-2"><span className="w-5">{o.kode_opsi}.</span><span>{o.jawaban}</span> {o.is_benar && <span className="print-hidden text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full ml-2">Kunci</span>}</div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Tabel Penyusun Validator FR.IA.05 */}
        <section className="mt-10">
          <table className="w-full border-collapse border border-black text-[13px] text-center">
            <thead>
              <tr className="bg-slate-50 print:bg-white"><th colSpan={6} className="border border-black p-2 text-left">PENYUSUNAN DAN VALIDASI INSTRUMEN</th></tr>
              <tr className="bg-slate-50 print:bg-white"><th className="border border-black p-2">STATUS</th><th className="border border-black p-2">NO</th><th className="border border-black p-2">NAMA</th><th className="border border-black p-2">NOMOR MET</th><th className="border border-black p-2">TANDA TANGAN & TANGGAL</th><th className="border border-black print-hidden"></th></tr>
            </thead>
            <tbody>
              {["penyusun", "validator"].map(type => formPerson[type].map((item, index) => (
                <tr key={`${type}-${index}`}>
                  {index === 0 && <td rowSpan={formPerson[type].length} className="border border-black p-2 font-bold capitalize align-middle">{type}</td>}
                  <td className="border border-black p-2">{index + 1}</td>
                  <td className="border border-black p-2 text-left">
                    <select value={item.id_user} onChange={e => { const a = listAsesor.find(x => String(x.id_user) === e.target.value); updatePerson(type, index, "id_user", e.target.value); updatePerson(type, index, "nama", a?.nama_lengkap||""); updatePerson(type, index, "nomor_met", a?.no_lisensi||a?.nomor_met||""); updatePerson(type, index, "tanggal", new Date().toISOString().slice(0, 10)); }} className="w-full bg-transparent outline-none appearance-none font-semibold">
                      <option value="">Pilih Asesor</option>
                      {listAsesor.map(a => <option key={a.id_user} value={a.id_user}>{a.nama_lengkap}</option>)}
                    </select>
                  </td>
                  <td className="border border-black p-2">{item.nomor_met || "-"}</td>
                  <td className="border border-black p-2">
                    <div className="flex flex-col items-center justify-center py-3">
                      <div className="w-[150px] mt-6 border-b border-black"></div>
                      <p className="mt-1 text-[11px]">{item.tanggal || "-"}</p>
                    </div>
                  </td>
                  <td className="border border-black print-hidden"><button onClick={() => removePerson(type, index)} className="text-red-500"><Trash2 size={14}/></button></td>
                </tr>
              )))}
            </tbody>
          </table>
          <div className="mt-3 flex gap-3 print-hidden">
            <button onClick={() => addPerson("penyusun")} className="flex gap-2 bg-slate-800 text-white px-3 py-2 text-xs font-bold rounded-lg"><Plus size={14}/> Tambah Penyusun</button>
            <button onClick={() => addPerson("validator")} className="flex gap-2 bg-slate-800 text-white px-3 py-2 text-xs font-bold rounded-lg"><Plus size={14}/> Tambah Validator</button>
          </div>
        </section>
      </main>

      {/* Modal Tambah Pertanyaan sama seperti sebelumnya */}
      {showSoalModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 print-hidden">
          <form onSubmit={saveSoal} className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-xl">
             <h3 className="text-lg font-black mb-4">{editingSoal ? "Edit Pertanyaan" : "Tambah Pertanyaan"}</h3>
             <textarea value={formSoal.pertanyaan} onChange={e => setFormSoal({...formSoal, pertanyaan: e.target.value})} className="w-full border p-3 rounded-lg outline-none mb-4" rows={3} placeholder="Pertanyaan..." required />
             <div className="space-y-2">
               {formSoal.opsi.map((o, i) => (
                 <div key={i} className="flex gap-3 items-center border p-2 rounded">
                   <span className="font-bold w-6">{o.kode_opsi}.</span>
                   <input value={o.jawaban} onChange={e => setFormSoal(p=>({...p, opsi: p.opsi.map((opt, idx) => idx===i ? {...opt, jawaban: e.target.value} : opt)}))} className="flex-1 outline-none" placeholder={`Opsi ${o.kode_opsi}`} required />
                   <label className="flex items-center gap-1 text-xs font-bold"><input type="radio" checked={o.is_benar} onChange={() => setFormSoal(p=>({...p, opsi: p.opsi.map((opt, idx) => ({...opt, is_benar: idx===i}))}))} name="kunci_fria05" /> Kunci</label>
                 </div>
               ))}
             </div>
             <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowSoalModal(false)} className="px-5 py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-[#CC6B27] text-white rounded-lg font-bold">Simpan</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
}