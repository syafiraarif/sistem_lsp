// frontend/src/pages/admin/MasterFRIA05.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Loader2, Plus, Save, Trash2, Download, ArrowLeft } from "lucide-react";
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
        api.get("/admin/asesor?limit=100") 
      ]);

      if (asesorRes.status === "fulfilled") {
        const resData = asesorRes.value.data?.data;
        const asesorData = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
        setListAsesor(asesorData);
      }

      if (fria05Res.status === "fulfilled") {
        const data = fria05Res.value.data?.data || {};
        setSkema(data.skema); 
        setPaket(data.paket);
        
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

  const isKKNI = skema?.jenis_skema?.toLowerCase() === 'kkni';
  const isOkupasi = skema?.jenis_skema?.toLowerCase() === 'okupasi';
  const isKlaster = skema?.jenis_skema?.toLowerCase() === 'klaster';

  // Kalkulasi untuk Kunci Jawaban
  const totalSoal = paket?.soal?.length || 0;
  const midPoint = Math.ceil(totalSoal / 2);
  const getKunci = (soalObj) => {
    if (!soalObj) return "";
    const kunci = soalObj.opsi.find(o => o.is_benar);
    return kunci ? kunci.kode_opsi.toUpperCase() : "";
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:p-0">
      <style>{`
        @media print { 
          @page { size: A4; margin: 15mm; } 
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none !important; }
          .print-hidden { display: none !important; } 
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* Action Buttons Luar Kertas */}
      <div className="mx-auto mb-5 flex w-[900px] justify-between print-hidden items-end">
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl font-bold shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors h-fit">
            <ArrowLeft size={18}/> Kembali
          </button>
        </div>

        <div className="flex gap-3 h-fit">
          <button onClick={savePaket} disabled={saving} className="flex items-center gap-2 bg-[#D97706] hover:bg-[#B45309] text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm">
            <Save size={18}/> Simpan Data
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#071E3D] hover:bg-[#041124] text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm">
            <Download size={18}/> Cetak
          </button>
        </div>
      </div>

      {/* KERTAS PRINT */}
      <main id="print-area" className="mx-auto w-[900px] print:w-full print:shadow-none bg-transparent">
        
        {/* ======================================================== */}
        {/* HALAMAN 1: FR.IA.05.A (SOAL)                             */}
        {/* ======================================================== */}
        <div className="bg-white px-12 py-12 text-[12px] text-black shadow-lg print:shadow-none print:px-0 print:py-0">
          
          <div className="flex justify-between items-start mb-6">
            <img src="/logo-lsp.png" alt="LSP" className="h-[75px] object-contain" onError={(e) => e.target.style.display='none'} />
            <img src="/logo-bnsp.png" alt="BNSP" className="h-[75px] object-contain" onError={(e) => e.target.style.display='none'} />
          </div>

          <div className="mb-4">
            <h1 className="text-[14px] font-bold">FR.IA.05A. DPT - PERTANYAAN TERTULIS PILIHAN GANDA</h1>
          </div>

          <table className="w-full border-collapse border border-black text-[13px] mb-2">
            <tbody>
              <tr>
                <td rowSpan="2" className="w-[35%] border border-black px-2 py-1 align-top font-medium">
                  Skema Sertifikasi<br/>
                  (
                  <span className={!isKKNI ? 'line-through' : ''}>KKNI</span>/
                  <span className={!isOkupasi ? 'line-through' : ''}>Okupasi</span>/
                  <span className={!isKlaster ? 'line-through' : ''}>Klaster</span>
                  )*
                </td>
                <td className="w-[12%] border border-black px-2 py-1 font-medium">Judul</td>
                <td className="w-[2%] border border-black px-2 py-1 text-center">:</td>
                <td className="border border-black px-2 py-1 font-medium">{skema?.judul_skema || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-medium">Nomor</td>
                <td className="border border-black px-2 py-1 text-center">:</td>
                <td className="border border-black px-2 py-1 font-medium">{skema?.kode_skema || "-"}</td>
              </tr>
              <tr>
                <td colSpan="2" className="border border-black px-2 py-1 font-medium">TUK</td>
                <td className="border border-black px-2 py-1 text-center">:</td>
                <td className="border border-black px-2 py-1 font-medium">Sewaktu/Tempat Kerja/Mandiri*</td>
              </tr>
              <tr>
                <td colSpan="2" className="border border-black px-2 py-1 font-medium">Nama Asesor</td>
                <td className="border border-black px-2 py-1 text-center">:</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr>
                <td colSpan="2" className="border border-black px-2 py-1 font-medium">Nama Asesi</td>
                <td className="border border-black px-2 py-1 text-center">:</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr>
                <td colSpan="2" className="border border-black px-2 py-1 font-medium">Tanggal</td>
                <td className="border border-black px-2 py-1 text-center">:</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
            </tbody>
          </table>

          <p className="mb-4 text-[12px] font-medium">*Coret yang tidak perlu</p>
          <p className="mb-2 text-[13px] font-medium">Jawab semua pertanyaan berikut:</p>

          <table className="w-full border-collapse border border-black text-[13px] mb-4">
            <tbody>
              {!paket?.soal?.length ? (
                <tr><td className="border border-black px-3 py-10 text-center text-slate-500 font-bold">Belum ada pertanyaan.</td></tr>
              ) : (
                paket.soal.map((soal, i) => (
                  <React.Fragment key={soal.id_soal}>
                    {/* Baris Pertanyaan */}
                    <tr>
                      <td className="border border-black px-3 py-2 align-top">
                        <div className="flex justify-between">
                          <div className="font-medium text-justify">
                            <span className="mr-2">{i + 1}.</span> {soal.pertanyaan}
                          </div>
                          <div className="flex gap-2 print-hidden h-fit ml-4 shrink-0">
                            <button onClick={() => {setEditingSoal(soal); setFormSoal({...soal, opsi: soal.opsi}); setShowSoalModal(true);}} className="text-blue-600 bg-blue-50 p-1.5 rounded hover:bg-blue-100"><Edit size={14}/></button>
                            <button onClick={() => deleteSoal(soal)} className="text-red-600 bg-red-50 p-1.5 rounded hover:bg-red-100"><Trash2 size={14}/></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Baris Opsi Jawaban (KUNCI TIDAK TAMPIL SAAT PRINT) */}
                    <tr>
                      <td className="border border-black px-3 py-2 align-top">
                        <div className="space-y-1 ml-5">
                          {soal.opsi.map(o => (
                            <div key={o.kode_opsi} className="flex gap-2 font-medium">
                              <span className="w-4">{o.kode_opsi.toLowerCase()}.</span>
                              <span>{o.jawaban}</span> 
                              {o.is_benar && <span className="print-hidden text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded ml-2">Kunci</span>}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>

          <div className="print-hidden mb-10 flex justify-start">
            <button onClick={openAddSoal} className="flex items-center gap-2 bg-[#071E3D] hover:bg-[#041124] text-white px-6 py-2.5 rounded-lg font-bold text-[13px] shadow transition-colors">
              <Plus size={16}/> Tambah Pertanyaan
            </button>
          </div>

          <section className="mt-8 page-break-inside-avoid">
            <div className="font-bold mb-2 text-[13px] uppercase">PENYUSUN DAN VALIDATOR</div>
            <table className="w-full border-collapse border border-black text-[13px] text-center font-medium">
              <thead>
                <tr className="bg-slate-50 print:bg-white">
                  <th className="border border-black p-2">STATUS</th>
                  <th className="border border-black p-2 w-[40px]">NO</th>
                  <th className="border border-black p-2">NAMA</th>
                  <th className="border border-black p-2">NOMOR MET</th>
                  <th className="border border-black p-2 w-[220px]">TANDA TANGAN DAN TANGGAL</th>
                  <th className="border border-black p-2 w-[40px] print-hidden"></th>
                </tr>
              </thead>
              <tbody>
                {["penyusun", "validator"].map(type => formPerson[type].map((item, index) => (
                  <tr key={`${type}-${index}`}>
                    {index === 0 && <td rowSpan={formPerson[type].length} className="border border-black p-2 font-bold uppercase align-middle">{type}</td>}
                    <td className="border border-black p-2">{index + 1}</td>
                    <td className="border border-black p-2 text-left">
                      <select value={item.id_user} onChange={e => { 
                          const a = listAsesor.find(x => String(x.id_user) === e.target.value); 
                          updatePerson(type, index, "id_user", e.target.value); 
                          updatePerson(type, index, "nama", a?.nama_lengkap||""); 
                          updatePerson(type, index, "nomor_met", a?.no_lisensi||a?.nomor_met||""); 
                          updatePerson(type, index, "tanggal", new Date().toISOString().slice(0, 10)); 
                        }} 
                        className="w-full border border-slate-300 rounded px-2 py-1.5 font-medium bg-white cursor-pointer print-hidden focus:outline-none focus:border-[#D97706]"
                      >
                        <option value="">-- Pilih Asesor --</option>
                        {listAsesor.map(a => <option key={a.id_user} value={a.id_user}>{a.nama_lengkap}</option>)}
                      </select>
                      <span className="hidden print:inline ml-2">{item.nama}</span>
                    </td>
                    <td className="border border-black p-2">{item.nomor_met || "-"}</td>
                    <td className="border border-black p-2">
                      <div className="py-4"></div>
                    </td>
                    <td className="border border-black p-2 print-hidden">
                      <button onClick={() => removePerson(type, index)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
            <div className="mt-3 flex gap-3 print-hidden">
              <button onClick={() => addPerson("penyusun")} className="flex items-center gap-1.5 bg-slate-800 text-white px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-700 transition-colors"><Plus size={14}/> Tambah Penyusun</button>
              <button onClick={() => addPerson("validator")} className="flex items-center gap-1.5 bg-slate-800 text-white px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-700 transition-colors"><Plus size={14}/> Tambah Validator</button>
            </div>
          </section>
        </div>

        {/* PEMBATAS UNTUK TAMPILAN LAYAR (DISEMBUNYIKAN SAAT CETAK) */}
        <div className="w-full h-8 bg-slate-100 print-hidden"></div>

        {/* ======================================================== */}
        {/* HALAMAN 2: FR.IA.05.B (KUNCI JAWABAN)                    */}
        {/* ======================================================== */}
        <div className="page-break bg-white px-12 py-12 text-[12px] text-black shadow-lg print:shadow-none print:px-0 print:py-0">
          
          <div className="flex justify-between items-start mb-6">
            <img src="/logo-lsp.png" alt="LSP" className="h-[75px] object-contain" onError={(e) => e.target.style.display='none'} />
            <img src="/logo-bnsp.png" alt="BNSP" className="h-[75px] object-contain" onError={(e) => e.target.style.display='none'} />
          </div>

          <div className="mb-4">
            <h1 className="text-[14px] font-bold">FR.IA.05.B. LEMBAR KUNCI JAWABAN PERTANYAAN TERTULIS PILIHAN GANDA</h1>
          </div>

          <table className="w-full border-collapse border border-black text-[13px] mb-2">
            <tbody>
              <tr>
                <td rowSpan="2" className="w-[35%] border border-black px-2 py-1 align-top font-medium">
                  Skema Sertifikasi<br/>
                  (
                  <span className={!isKKNI ? 'line-through' : ''}>KKNI</span>/
                  <span className={!isOkupasi ? 'line-through' : ''}>Okupasi</span>/
                  <span className={!isKlaster ? 'line-through' : ''}>Klaster</span>
                  )*
                </td>
                <td className="w-[12%] border border-black px-2 py-1 font-medium">Judul</td>
                <td className="w-[2%] border border-black px-2 py-1 text-center">:</td>
                <td className="border border-black px-2 py-1 font-medium">{skema?.judul_skema || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-medium">Nomor</td>
                <td className="border border-black px-2 py-1 text-center">:</td>
                <td className="border border-black px-2 py-1 font-medium">{skema?.kode_skema || "-"}</td>
              </tr>
              <tr>
                <td colSpan="2" className="border border-black px-2 py-1 font-medium">TUK</td>
                <td className="border border-black px-2 py-1 text-center">:</td>
                <td className="border border-black px-2 py-1 font-medium">Sewaktu/Tempat Kerja/Mandiri*</td>
              </tr>
            </tbody>
          </table>

          <p className="mb-4 text-[12px] font-medium">*Coret yang tidak perlu</p>
          <p className="mb-2 text-[13px] font-medium">Kunci Jawaban Pertanyaan Tertulis – Pilihan Ganda:</p>

          <table className="w-full border-collapse border border-black text-[13px] text-center mb-6">
            <thead>
              <tr className="bg-slate-50 print:bg-white font-bold">
                <td className="border border-black p-2 w-[10%]">No.</td>
                <td className="border border-black p-2 w-[40%]">Kunci Jawaban</td>
                <td className="border border-black p-2 w-[10%]">No.</td>
                <td className="border border-black p-2 w-[40%]">Kunci Jawaban</td>
              </tr>
            </thead>
            <tbody>
              {totalSoal === 0 ? (
                <tr><td colSpan={4} className="border border-black p-4 text-slate-500 italic">Belum ada Kunci Jawaban.</td></tr>
              ) : (
                Array.from({ length: midPoint }).map((_, i) => {
                  const leftIndex = i;
                  const rightIndex = i + midPoint;
                  const leftItem = paket.soal[leftIndex];
                  const rightItem = paket.soal[rightIndex];
                  return (
                    <tr key={i} className="font-medium">
                      <td className="border border-black p-2">{leftIndex + 1}.</td>
                      <td className="border border-black p-2">{getKunci(leftItem)}</td>
                      <td className="border border-black p-2">{rightItem ? `${rightIndex + 1}.` : ""}</td>
                      <td className="border border-black p-2">{rightItem ? getKunci(rightItem) : ""}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Tabel Validator untuk FR.IA.05.B (Mirror Data) */}
          <section className="mt-8 page-break-inside-avoid">
            <div className="font-bold mb-2 text-[13px] uppercase">PENYUSUN DAN VALIDATOR</div>
            <table className="w-full border-collapse border border-black text-[13px] text-center font-medium">
              <thead>
                <tr className="bg-slate-50 print:bg-white">
                  <th className="border border-black p-2">STATUS</th>
                  <th className="border border-black p-2 w-[40px]">NO</th>
                  <th className="border border-black p-2">NAMA</th>
                  <th className="border border-black p-2">NOMOR MET</th>
                  <th className="border border-black p-2 w-[220px]">TANDA TANGAN DAN TANGGAL</th>
                </tr>
              </thead>
              <tbody>
                {["penyusun", "validator"].map(type => formPerson[type].map((item, index) => (
                  <tr key={`b-${type}-${index}`}>
                    {index === 0 && <td rowSpan={formPerson[type].length} className="border border-black p-2 font-bold uppercase align-middle">{type}</td>}
                    <td className="border border-black p-2">{index + 1}</td>
                    <td className="border border-black p-2 text-left">
                      <span className="ml-2">{item.nama}</span>
                    </td>
                    <td className="border border-black p-2">{item.nomor_met || "-"}</td>
                    <td className="border border-black p-2">
                      <div className="py-4"></div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </section>

        </div>
      </main>

      {/* Modal Tambah/Edit Pertanyaan */}
      {showSoalModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 print-hidden">
          <form onSubmit={saveSoal} className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-xl">
             <h3 className="text-lg font-black mb-4">{editingSoal ? "Edit Pertanyaan" : "Tambah Pertanyaan"}</h3>
             <textarea value={formSoal.pertanyaan} onChange={e => setFormSoal({...formSoal, pertanyaan: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg outline-none mb-4 focus:border-slate-500 font-medium" rows={3} placeholder="Tuliskan pertanyaan di sini..." required />
             <div className="space-y-3">
               {formSoal.opsi.map((o, i) => (
                 <div key={i} className="flex gap-3 items-center border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                   <span className="font-bold w-6">{o.kode_opsi}.</span>
                   <input value={o.jawaban} onChange={e => setFormSoal(p=>({...p, opsi: p.opsi.map((opt, idx) => idx===i ? {...opt, jawaban: e.target.value} : opt)}))} className="flex-1 outline-none bg-transparent font-medium" placeholder={`Jawaban opsi ${o.kode_opsi}`} required />
                   <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                     <input type="radio" checked={o.is_benar} onChange={() => setFormSoal(p=>({...p, opsi: p.opsi.map((opt, idx) => ({...opt, is_benar: idx===i}))}))} name="kunci_fria05" className="w-4 h-4 cursor-pointer" /> 
                     Kunci
                   </label>
                 </div>
               ))}
             </div>
             <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowSoalModal(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg font-bold transition-colors">Simpan Pertanyaan</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
}