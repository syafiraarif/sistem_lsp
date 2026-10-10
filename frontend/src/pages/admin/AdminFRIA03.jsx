import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Loader2, Plus, Save, Trash2, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";

const defaultPanduan = [
  "Formulir ini di isi oleh asesor kompetensi dapat sebelum, pada saat atau setelah melakukan asesmen dengan metode observasi demonstrasi.",
  "Pertanyaan dibuat dengan tujuan untuk menggali, dapat berisi pertanyaan yang berkaitan dengan dimensi kompetensi, batasan variabel dan aspek kritis yang relevan dengan skenario tugas dan praktik demonstrasi.",
  "Jika pertanyaan disampaikan sebelum asesi melakukan praktik demonstrasi, maka pertanyaan dibuat berkaitan dengan aspek K3L, SOP, penggunaan peralatan dan perlengkapan.",
  "Jika setelah asesi melakukan praktik demonstrasi terdapat item pertanyaan pendukung observasi telah terpenuhi, maka pertanyaan tersebut tidak perlu ditanyakan lagi dan cukup memberi catatan bahwa sudah terpenuhi pada saat tugas praktek demonstrasi pada kolom tanggapan",
  "Jika pada saat observasi ada hal yang perlu dikonfirmasi sedangkan di instrumen daftar pertanyaan pendukung observasi tidak ada, maka asesor dapat memberikan pertanyaan dengan syarat pertanyaan harus berkaitan dengan tugas praktek demonstrasi. Jika dilakukan, asesor harus mencatat dalam instrumen pertanyaan pendukung observasi.",
  "Tanggapan asesi ditulis pada kolom tanggapan."
];

export default function AdminFRIA03() {
  const { id_skema } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [skemaDetail, setSkemaDetail] = useState({});
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [listAsesor, setListAsesor] = useState([]);
  const [statusValidasi, setStatusValidasi] = useState("draft");

  const [showModal, setShowModal] = useState(false);
  const [editingPertanyaan, setEditingPertanyaan] = useState(null);
  const [formSoal, setFormSoal] = useState({ id_unit: "", pertanyaan: "", urutan: "" });

  const [form, setForm] = useState({
    panduan: defaultPanduan,
    penyusun: [{ id_user: "", nama: "", nomor_met: "", ttd: "", tanggal: "" }],
    validator: [{ id_user: "", nama: "", nomor_met: "", ttd: "", tanggal: "" }],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const cleanId = id_skema.split(':')[0]; 

      const [skemaRes, unitRes, asesorRes, fria03Res] = await Promise.allSettled([
        api.get(`/admin/skema/${cleanId}`),
        api.get(`/admin/fr-ia02/unit/${cleanId}`),
        api.get("/admin/asesor"),
        api.get(`/admin/fr-ia03/${cleanId}`)
      ]);

      if (skemaRes.status === "fulfilled") {
         setSkemaDetail(skemaRes.value.data?.data || skemaRes.value.data || {});
      }

      if (asesorRes.status === "fulfilled") {
        const responsePayload = asesorRes.value.data;
        let asesorArray = [];
        if (responsePayload?.data?.data && Array.isArray(responsePayload.data.data)) {
          asesorArray = responsePayload.data.data;
        } else if (responsePayload?.data && Array.isArray(responsePayload.data)) {
          asesorArray = responsePayload.data;
        }
        setListAsesor(asesorArray);
      }

      if (unitRes.status === "fulfilled") {
        setUnitOptions(Array.isArray(unitRes.value.data?.data) ? unitRes.value.data.data : []);
      }

      let penyusun = [];
      let validator = [];

      if (fria03Res.status === "fulfilled") {
        const currentData = fria03Res.value.data?.data || null;
        setPertanyaanList(Array.isArray(currentData?.pertanyaan) ? currentData.pertanyaan : []);
        if (currentData?.status_validasi) setStatusValidasi(currentData.status_validasi);

        if (currentData?.validator && currentData.validator.length > 0) {
           currentData.validator.forEach((item) => {
              const vData = { id_user: item?.id_asesor || "", nama: item?.asesor?.nama_lengkap || "", nomor_met: item?.asesor?.no_lisensi || item?.asesor?.no_reg_asesor || "", ttd: item?.asesor?.ttd_path || "", tanggal: item?.tanggal || "" };
              if (item?.peran === "penyusun") penyusun.push(vData);
              if (item?.peran === "validator") validator.push(vData);
           });
        }
      }

      // -------------------------------------------------------------
      // LOAD DATA DARI LOCAL STORAGE (JIKA ADA) SEBELUM SET FORM
      // -------------------------------------------------------------
      const savedData = localStorage.getItem(`fria03_local_${cleanId}`);
      let localPanduan = null, localPenyusun = null, localValidator = null;
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          localPanduan = parsed.panduan;
          localPenyusun = parsed.penyusun;
          localValidator = parsed.validator;
        } catch (e) { console.error("Gagal load lokal", e); }
      }

      setForm((prev) => ({
        ...prev,
        panduan: localPanduan || prev.panduan,
        penyusun: localPenyusun || (penyusun.length ? penyusun : prev.penyusun),
        validator: localValidator || (validator.length ? validator : prev.validator)
      }));

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id_skema]);

  // -------------------------------------------------------------
  // AUTO-SAVE KE LOCAL STORAGE SETIAP ADA PERUBAHAN
  // -------------------------------------------------------------
  useEffect(() => {
    const cleanId = id_skema.split(':')[0];
    if (!loading) {
      localStorage.setItem(`fria03_local_${cleanId}`, JSON.stringify({
        panduan: form.panduan,
        penyusun: form.penyusun,
        validator: form.validator
      }));
    }
  }, [form.panduan, form.penyusun, form.validator, id_skema, loading]);

  const isReadOnly = statusValidasi === "menunggu_validasi";
  const jenisSkema = skemaDetail?.jenis_skema?.toLowerCase() || "";

  const updatePanduan = (index, value) => !isReadOnly && setForm(p => ({ ...p, panduan: p.panduan.map((item, i) => i === index ? value : item) }));
  
  const updatePerson = (type, index, field, value) => !isReadOnly && setForm(p => ({ ...p, [type]: p[type].map((item, i) => i === index ? { ...item, [field]: value } : item) }));
  const addPerson = (type) => !isReadOnly && setForm(p => ({ ...p, [type]: [...p[type], { id_user: "", nama: "", nomor_met: "", ttd: "", tanggal: "" }] }));
  const removePerson = (type, index) => !isReadOnly && setForm(p => ({ ...p, [type]: p[type].filter((_, i) => i !== index) }));

  const saveHeaderAndValidators = async () => {
    try {
      setSaving(true);
      const cleanId = id_skema.split(':')[0];
      const validators = [
        ...form.penyusun.filter(i => i.id_user).map((i, idx) => ({ id_asesor: Number(i.id_user), peran: "penyusun", urutan: idx + 1 })),
        ...form.validator.filter(i => i.id_user).map((i, idx) => ({ id_asesor: Number(i.id_user), peran: "validator", urutan: idx + 1 })),
      ];
      await api.post("/admin/fr-ia03/header", { id_skema: Number(cleanId), validators });
      Swal.fire({ title: "Berhasil", text: "Informasi Master disimpan", icon: "success", timer: 1300, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  const savePertanyaan = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const cleanId = id_skema.split(':')[0];
      const payload = { id_skema: Number(cleanId), id_unit: Number(formSoal.id_unit), pertanyaan: formSoal.pertanyaan.trim(), urutan: Number(formSoal.urutan) };
      if (editingPertanyaan) await api.put(`/admin/fr-ia03/pertanyaan/${editingPertanyaan.id_pertanyaan}`, payload);
      else await api.post("/admin/fr-ia03/pertanyaan", payload);
      setShowModal(false);
      fetchData();
    } catch (err) { Swal.fire("Gagal", err.response?.data?.message || "Gagal menyimpan", "error"); } finally { setSaving(false); }
  };

  const deletePertanyaan = async (item) => {
    const confirm = await Swal.fire({ title: "Hapus?", icon: "warning", showCancelButton: true });
    if (!confirm.isConfirmed) return;
    try { await api.delete(`/admin/fr-ia03/pertanyaan/${item.id_pertanyaan}`); fetchData(); } catch (err) { Swal.fire("Gagal", "Gagal menghapus.", "error"); }
  };

  const autoResizeTextarea = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center font-bold"><Loader2 className="animate-spin mr-2"/> Memuat...</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <style>{`
        @media print { 
          @page { size: A4; margin: 15mm; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none !important; }
          input, select { border: none !important; outline: none !important; background: transparent !important; -webkit-appearance: none; appearance: none; }
          .print-hidden { display: none !important; }
        }
      `}</style>
      
      <div className="mx-auto mb-5 flex w-[900px] justify-between print-hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl font-bold shadow-sm"><ArrowLeft size={18}/> Kembali</button>
        <div className="flex gap-3">
          {statusValidasi === "menunggu_validasi" ? (
             <>
               <button className="flex gap-2 rounded-xl bg-red-100 px-5 py-3 font-bold text-red-600"><XCircle size={18} /> Tolak</button>
               <button className="flex gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-white"><CheckCircle size={18} /> Setujui</button>
             </>
          ) : (
            <button onClick={saveHeaderAndValidators} disabled={saving} className="flex gap-2 bg-orange-100 text-orange-700 px-5 py-3 rounded-xl font-bold"><Save size={18}/> Simpan Data</button>
          )}
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 font-bold text-white"><Download size={18} /> Cetak</button>
        </div>
      </div>

      <main id="print-area" className="mx-auto w-[900px] bg-white px-10 py-8 text-[13px] shadow-lg print:w-full print:shadow-none print:px-0">
        
        <div className="hidden print:flex justify-between items-center border-b-2 border-black pb-4 mb-6">
             <div className="font-bold text-left">
                  <h1 className="text-xl text-blue-800 uppercase tracking-wide">PUSTAKA ILMIAH ELEKTRONIK</h1>
                  <h2 className="text-lg text-orange-500">Lembaga Sertifikasi Profesi</h2>
             </div>
             <div className="font-bold text-right text-3xl italic">
                 <span className="text-red-600">✔</span>BNSP
             </div>
        </div>

        <div className="mb-6 text-left">
            <h1 className="text-[16px] font-bold">FR.IA.03. PERTANYAAN UNTUK MENDUKUNG OBSERVASI</h1>
        </div>

        <table className="w-full border-collapse border border-black mb-1 text-[13px]">
          <tbody>
            <tr>
              <td rowSpan="2" className="w-[240px] border border-black p-2 bg-slate-50 print:bg-transparent">
                Skema Sertifikasi<br/>
                (
                  <span className={jenisSkema === 'kkni' ? '' : 'line-through'}>KKNI</span> /
                  <span className={jenisSkema === 'okupasi' ? '' : 'line-through'}> Okupasi </span> /
                  <span className={jenisSkema === 'klaster' ? '' : 'line-through'}> Klaster</span>
                )
              </td>
              <td className="w-[100px] border border-black p-2 bg-slate-50 print:bg-transparent text-center">Judul</td>
              <td className="w-[20px] border border-black text-center">:</td>
              <td className="border border-black p-2">{skemaDetail?.judul_skema || "-"}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 print:bg-transparent text-center">Nomor</td>
              <td className="border border-black text-center">:</td>
              <td className="border border-black p-2">{skemaDetail?.kode_skema || "-"}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-2 font-bold bg-slate-50 print:bg-transparent">TUK</td>
              <td className="border border-black text-center">:</td>
              <td className="border border-black p-2">Sewaktu/Tempat Kerja/Mandiri*</td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-2 font-bold bg-slate-50 print:bg-transparent">Nama Asesor</td>
              <td className="border border-black text-center">:</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-2 font-bold bg-slate-50 print:bg-transparent">Nama Asesi</td>
              <td className="border border-black text-center">:</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-2 font-bold bg-slate-50 print:bg-transparent">Tanggal</td>
              <td className="border border-black text-center">:</td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>
        <p className="text-[12px] mb-5 print:block hidden">*Coret yang tidak perlu</p>

        <section className="mb-5 border border-black">
          <div className="border-b border-black bg-slate-50 print:bg-transparent px-3 py-1.5 font-bold">PANDUAN BAGI ASESOR</div>
          <ul className="list-disc space-y-1 px-8 py-3 leading-relaxed text-[13px]">
            {form.panduan.map((item, index) => (
              <li key={index} className="pl-1">
                 <textarea 
                    value={item} 
                    readOnly={isReadOnly} 
                    onInput={autoResizeTextarea}
                    onChange={e => updatePanduan(index, e.target.value)} 
                    className={`w-full outline-none py-1 resize-none overflow-hidden print-hidden ${isReadOnly ? 'bg-transparent' : 'bg-slate-50 border border-slate-200 rounded px-2 focus:border-[#CC6B27] focus:bg-white'}`} 
                 />
                 <span className="hidden print:inline">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* TABEL UNIT KOMPETENSI MERGE KELOMPOK PEKERJAAN (SUDAH DIPERBAIKI SESUAI PDF BNSP) */}
        <table className="w-full border-collapse border border-black mb-8 text-[13px]">
          <thead>
            <tr className="bg-slate-50 print:bg-transparent font-bold text-center">
              {unitOptions.length > 0 ? (
                <th rowSpan={unitOptions.length + 1} className="w-[180px] border border-black p-2 align-middle bg-white print:bg-transparent">
                  {unitOptions[0].nama_kelompok || "Kelompok Pekerjaan 1"}
                </th>
              ) : (
                <th className="w-[180px] border border-black p-2 align-middle bg-white print:bg-transparent">
                  Kelompok Pekerjaan
                </th>
              )}
              <th className="w-[50px] border border-black p-2 bg-slate-50 print:bg-transparent">No.</th>
              <th className="w-[150px] border border-black p-2 bg-slate-50 print:bg-transparent">Kode Unit</th>
              <th className="border border-black p-2 text-center bg-slate-50 print:bg-transparent">Judul Unit</th>
            </tr>
          </thead>
          <tbody>
            {unitOptions.length > 0 ? unitOptions.map((u, i) => (
              <tr key={u.id_unit} className="bg-white print:bg-transparent">
                <td className="border border-black p-2 text-center">{i + 1}.</td>
                <td className="border border-black p-2 text-center">{u.kode_unit}</td>
                <td className="border border-black p-2 text-left">{u.judul_unit}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="border border-black p-3 text-center text-slate-400 italic">Belum ada unit kompetensi</td>
              </tr>
            )}
          </tbody>
        </table>

        <table className="w-full border-collapse border border-black mb-4">
          <thead>
            <tr className="bg-slate-50 print:bg-transparent">
              <th className="border border-black p-2 font-bold" rowSpan={2}>Pertanyaan</th>
              <th className="border border-black p-2 font-bold text-center w-[120px]" colSpan={2}>Pencapaian</th>
            </tr>
            <tr className="bg-slate-50 print:bg-transparent">
              <th className="border border-black p-2 font-bold text-center w-[60px]">Ya</th>
              <th className="border border-black p-2 font-bold text-center w-[60px]">Tidak</th>
            </tr>
          </thead>
          <tbody>
            {pertanyaanList.length === 0 ? (
               <tr><td colSpan={3} className="border border-black p-4 text-center font-bold text-slate-400">Belum ada pertanyaan. Silakan klik Tambah Pertanyaan di bawah.</td></tr>
            ) : pertanyaanList.map((q, i) => (
              <React.Fragment key={q.id_pertanyaan}>
                <tr>
                  <td className="border border-black p-3">
                    <div className="flex justify-between items-start">
                      <span className="flex-1 text-justify pr-3">
                        <span className="inline-block mr-2 text-center w-[20px] font-bold">{i + 1}.</span> 
                        {q.pertanyaan}
                      </span>
                      {!isReadOnly && (
                        <div className="flex gap-2 print-hidden">
                          <button onClick={() => { setEditingPertanyaan(q); setFormSoal({ id_unit: q.id_unit, pertanyaan: q.pertanyaan, urutan: q.urutan }); setShowModal(true); }} className="text-slate-600 bg-slate-100 p-1.5 rounded hover:bg-slate-200"><Edit size={14}/></button>
                          <button onClick={() => deletePertanyaan(q)} className="text-red-600 bg-red-50 p-1.5 rounded hover:bg-red-100"><Trash2 size={14}/></button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="border border-black text-center align-top p-0"><div className="h-full min-h-[50px]"></div></td>
                  <td className="border border-black text-center align-top p-0"><div className="h-full min-h-[50px]"></div></td>
                </tr>
                <tr>
                   <td colSpan={3} className="border border-black p-0 h-[100px] align-top text-left">
                       <div className="p-2 border-b border-black pb-4 h-full flex flex-col justify-between">
                           <div>
                               <div className="flex items-center gap-2 mb-2 font-semibold">
                                  <div className="w-3 h-3 border border-black rounded-sm print:border-[1.5px]"></div>
                                  <span>bahwa sudah terpenuhi pada saat tugas praktek demonstrasi</span>
                               </div>
                               <p className="font-bold">Tanggapan:</p>
                           </div>
                       </div>
                   </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {pertanyaanList.length > 0 && (
          <div className="border border-black p-3 min-h-[80px] mt-2 mb-10 hidden print:block">
              Umpan balik untuk asesi:
          </div>
        )}

        {!isReadOnly && (
          <button onClick={() => { setEditingPertanyaan(null); setFormSoal({ id_unit: unitOptions[0]?.id_unit || "", pertanyaan: "", urutan: pertanyaanList.length + 1 }); setShowModal(true); }} className="flex gap-2 bg-[#071E3D] px-4 py-3 rounded-xl text-white font-bold mb-8 print-hidden hover:bg-slate-800">
            <Plus size={18}/> Tambah Pertanyaan
          </button>
        )}

        <section className="mt-12 break-inside-avoid">
            <table className="w-full border-collapse border border-black text-[13px] mb-2">
                <tbody>
                    <tr><td colSpan="3" className="border border-black p-2 font-bold bg-slate-50 print:bg-transparent">Asesi :</td></tr>
                    <tr><td className="w-[150px] border border-black p-2">Nama</td><td className="w-[10px] border border-black text-center">:</td><td className="border border-black p-2"></td></tr>
                    <tr><td className="border border-black p-2 h-[60px] align-top">Tanda tangan dan<br/>Tanggal</td><td className="border border-black text-center align-top pt-2">:</td><td className="border border-black p-2"></td></tr>
                    <tr><td colSpan="3" className="border border-black p-2 font-bold bg-slate-50 print:bg-transparent">Asesor :</td></tr>
                    <tr><td className="border border-black p-2">Nama</td><td className="border border-black text-center">:</td><td className="border border-black p-2"></td></tr>
                    <tr><td className="border border-black p-2">No. Reg</td><td className="border border-black text-center">:</td><td className="border border-black p-2"></td></tr>
                    <tr><td className="border border-black p-2 h-[60px] align-top">Tanda tangan dan<br/>Tanggal</td><td className="border border-black text-center align-top pt-2">:</td><td className="border border-black p-2"></td></tr>
                </tbody>
            </table>
            <p className="text-[10px] text-justify mb-8 hidden print:block">
              Diadaptasi dari template yang disediakan di Departemen Pendidikan dan Pelatihan, Australia. Merancang instrumen asesmen untuk hasil yang berkualitas di VET, 2008 di VET, 200
            </p>

          <div className="print:hidden mb-2 font-bold mt-10 border-b pb-2">Penyusunan & Validasi Internal LSP</div>
          <table className="w-full border-collapse border border-black text-[13px] text-center print-hidden">
            <thead>
              <tr className="bg-slate-50 uppercase">
                <th className="border border-black p-2">STATUS</th><th className="border border-black p-2 w-[40px]">NO</th><th className="border border-black p-2">NAMA</th>
                <th className="border border-black p-2">NOMOR MET</th><th className="border border-black p-2">TANDA TANGAN & TANGGAL</th>
                {!isReadOnly && <th className="border border-black w-[40px]"></th>}
              </tr>
            </thead>
            <tbody>
              {["penyusun", "validator"].map(type => form[type].map((item, index) => (
                <tr key={`${type}-${index}`}>
                  {index === 0 && <td rowSpan={form[type].length} className="border border-black p-2 font-bold uppercase align-middle">{type}</td>}
                  <td className="border border-black p-2">{index + 1}</td>
                  <td className="border border-black p-2 text-left">
                    <select value={item.id_user} disabled={isReadOnly} onChange={e => {
                      const a = listAsesor.find(x => String(x.id_asesor || x.id_user) === String(e.target.value));
                      updatePerson(type, index, "id_user", e.target.value);
                      updatePerson(type, index, "nama", a?.nama_lengkap||"");
                      updatePerson(type, index, "nomor_met", a?.no_lisensi||a?.nomor_met||"");
                      updatePerson(type, index, "tanggal", new Date().toISOString().slice(0, 10));
                    }} className={`w-full outline-none font-semibold ${isReadOnly ? 'bg-transparent appearance-none' : 'bg-slate-50 border border-slate-300 p-1.5 rounded cursor-pointer'}`}>
                      <option value="">-- Pilih Asesor --</option>
                      {listAsesor.map(a => <option key={a.id_asesor || a.id_user} value={a.id_asesor || a.id_user}>{a.nama_lengkap}</option>)}
                    </select>
                  </td>
                  <td className="border border-black p-2">{item.nomor_met || "-"}</td>
                  <td className="border border-black p-1">
                    <div className="flex flex-col items-center justify-center py-2 h-[70px]">
                      <div className="w-[150px] mt-6 border-b border-black"></div>
                      <p className="mt-1 text-[11px]">{item.tanggal || "-"}</p>
                    </div>
                  </td>
                  {!isReadOnly && <td className="border border-black"><button onClick={() => removePerson(type, index)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={15}/></button></td>}
                </tr>
              )))}
            </tbody>
          </table>
          <div className="mt-3 flex gap-3 print-hidden">
            {!isReadOnly && <button onClick={() => addPerson("penyusun")} className="flex gap-2 bg-slate-100 border border-slate-300 text-slate-700 px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-200"><Plus size={14}/> Tambah Penyusun</button>}
            {!isReadOnly && <button onClick={() => addPerson("validator")} className="flex gap-2 bg-slate-100 border border-slate-300 text-slate-700 px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-200"><Plus size={14}/> Tambah Validator</button>}
          </div>
        </section>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4 print-hidden">
          <form onSubmit={savePertanyaan} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black mb-4">{editingPertanyaan ? "Edit" : "Tambah"} Pertanyaan</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-500 mb-1 block">Unit Kompetensi</label>
                <select value={formSoal.id_unit} onChange={e => setFormSoal({...formSoal, id_unit: e.target.value})} className="w-full border p-3 rounded-xl font-bold bg-slate-50" required>
                  <option value="" disabled>-- Pilih Unit --</option>
                  {unitOptions.map(u => <option key={u.id_unit} value={u.id_unit}>{u.kode_unit} - {u.judul_unit}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-500 mb-1 block">Pertanyaan</label>
                <textarea value={formSoal.pertanyaan} onChange={e => setFormSoal({...formSoal, pertanyaan: e.target.value})} rows={4} className="w-full border p-3 rounded-xl font-bold bg-slate-50 outline-none focus:border-[#CC6B27]" required />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 bg-slate-100 rounded-xl font-bold hover:bg-slate-200">Batal</button>
              <button type="submit" disabled={saving} className="px-5 py-3 bg-[#CC6B27] text-white rounded-xl font-bold hover:bg-orange-700">{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}