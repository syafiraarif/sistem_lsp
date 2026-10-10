import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Save, CheckCircle, XCircle, AlertCircle, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";

const defaultPetunjuk = [
  "Baca dan pelajari setiap instruksi kerja di bawah ini dengan cermat sebelum melaksanakan praktek",
  "Klarifikasi kepada asesor kompetensi apabila ada hal-hal yang belum jelas",
  "Laksanakan pekerjaan sesuai dengan urutan proses yang sudah ditetapkan",
  "Seluruh proses kerja mengacu kepada SOP/WI yang dipersyaratkan (Jika Ada)",
];

export default function AdminFRIA02() {
  const { id_skema, id } = useParams();
  const skemaId = id_skema || id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skema, setSkema] = useState(null);
  const [listAsesor, setListAsesor] = useState([]);
  const [statusValidasi, setStatusValidasi] = useState("draft");

  const [form, setForm] = useState({
    petunjuk: defaultPetunjuk,
    kelompok: [],
    penyusun: [{ id_user: "", nama: "", nomor_met: "", ttd: "", tanggal: "" }],
    validator: [{ id_user: "", nama: "", nomor_met: "", ttd: "", tanggal: "" }],
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [skemaRes, asesorRes, unitRes, fria02Res] = await Promise.allSettled([
        api.get(`/admin/skema/${skemaId}`),
        api.get("/admin/asesor"),
        api.get(`/admin/fr-ia02/unit/${skemaId}`),
        api.get(`/admin/fr-ia02/${skemaId}`)
      ]);

      if (skemaRes.status === "fulfilled") setSkema(skemaRes.value.data?.data || skemaRes.value.data);
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

      let kelompokMap = new Map();

      if (unitRes.status === "fulfilled") {
        const unitsData = Array.isArray(unitRes.value.data?.data) ? unitRes.value.data.data : [];
        unitsData.forEach((u) => {
          const kId = u.id_kelompok || "default";
          if (!kelompokMap.has(kId)) {
            kelompokMap.set(kId, {
              id_kelompok: u.id_kelompok,
              kelompok_pekerjaan: u.nama_kelompok || "Kelompok Pekerjaan",
              units: [],
              skenario_tugas: "",
              langkah_kerja: "",
              perlengkapan_peralatan: "",
              waktu: ""
            });
          }
          kelompokMap.get(kId).units.push({
            kode_unit: u.kode_unit,
            judul_unit: u.judul_unit,
            urutan: u.urutan
          });
        });
      }

      let penyusun = [];
      let validator = [];

      if (fria02Res.status === "fulfilled") {
        const fria02Data = fria02Res.value.data?.data || {};
        if (fria02Data.status_validasi) setStatusValidasi(fria02Data.status_validasi);

        if (fria02Data?.detail?.length) {
          fria02Data.detail.forEach((item) => {
            const kId = item.id_kelompok || "default";
            if (kelompokMap.has(kId)) {
              const k = kelompokMap.get(kId);
              k.skenario_tugas = item.skenario || k.skenario_tugas;
              k.langkah_kerja = item.langkah_kerja || k.langkah_kerja;
              k.perlengkapan_peralatan = item.peralatan || k.perlengkapan_peralatan;
              k.waktu = item.durasi || k.waktu;
            }
          });
        }
        (fria02Data?.validator || []).forEach((item) => {
          const data = { 
            id_user: item?.id_asesor || "", nama: item?.asesor?.nama_lengkap || "", 
            nomor_met: item?.asesor?.no_lisensi || item?.asesor?.no_reg_asesor || "", 
            ttd: item?.asesor?.ttd_path || "", tanggal: item?.tanggal || "" 
          };
          if (item?.peran === "penyusun") penyusun.push(data);
          if (item?.peran === "validator") validator.push(data);
        });
      }

      // -------------------------------------------------------------
      // LOAD DATA DARI LOCAL STORAGE (JIKA ADA) SEBELUM SET FORM
      // -------------------------------------------------------------
      const savedData = localStorage.getItem(`fria02_local_${skemaId}`);
      let localPetunjuk = null, localPenyusun = null, localValidator = null;
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          localPetunjuk = parsed.petunjuk;
          localPenyusun = parsed.penyusun;
          localValidator = parsed.validator;
        } catch (e) { console.error("Gagal load lokal", e); }
      }

      setForm((prev) => ({
        ...prev,
        kelompok: Array.from(kelompokMap.values()),
        petunjuk: localPetunjuk || prev.petunjuk,
        penyusun: localPenyusun || (penyusun.length ? penyusun : prev.penyusun),
        validator: localValidator || (validator.length ? validator : prev.validator)
      }));

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [skemaId]);

  // -------------------------------------------------------------
  // AUTO-SAVE KE LOCAL STORAGE SETIAP ADA PERUBAHAN
  // -------------------------------------------------------------
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(`fria02_local_${skemaId}`, JSON.stringify({
        petunjuk: form.petunjuk,
        penyusun: form.penyusun,
        validator: form.validator
      }));
    }
  }, [form.petunjuk, form.penyusun, form.validator, skemaId, loading]);

  const isReadOnly = statusValidasi === "menunggu_validasi";
  const jenisSkema = skema?.jenis_skema?.toLowerCase() || "";

  const handleSave = async () => {
    try {
      setSaving(true);
      const details = form.kelompok.flatMap((k) => k.units.map((u, i) => ({ 
        id_kelompok: k.id_kelompok, kode_unit: u.kode_unit, judul_unit: u.judul_unit, urutan: i + 1, skenario: k.skenario_tugas, langkah_kerja: k.langkah_kerja, peralatan: k.perlengkapan_peralatan, durasi: k.waktu 
      })));
      const validators = [
        ...form.penyusun.filter(i => i.id_user).map((i, idx) => ({ id_asesor: Number(i.id_user), peran: "penyusun", urutan: idx + 1 })),
        ...form.validator.filter(i => i.id_user).map((i, idx) => ({ id_asesor: Number(i.id_user), peran: "validator", urutan: idx + 1 })),
      ];

      await api.post("/admin/fr-ia02", { id_skema: Number(skemaId), details, validators });
      Swal.fire("Berhasil", "Master FR.IA.02 berhasil disimpan.", "success");
      fetchData();
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleValidasi = async (status) => {
    const isSetuju = status === "disetujui";
    const confirm = await Swal.fire({ title: isSetuju ? "Setujui Perubahan?" : "Tolak Perubahan?", icon: isSetuju ? "question" : "warning", showCancelButton: true, confirmButtonColor: isSetuju ? "#10b981" : "#ef4444", confirmButtonText: isSetuju ? "Ya, Setujui" : "Ya, Tolak" });
    if (!confirm.isConfirmed) return;
    try {
      setSaving(true);
      await api.put(`/admin/fr-ia02/validasi/${skemaId}`, { status_validasi: status });
      Swal.fire("Berhasil", `Pengajuan ${status}.`, "success");
      fetchData();
    } catch (err) { 
      Swal.fire("Gagal", "Gagal memproses validasi.", "error"); 
    } finally { setSaving(false); }
  };

  const updatePetunjuk = (index, value) => !isReadOnly && setForm(p => ({ ...p, petunjuk: p.petunjuk.map((item, i) => i === index ? value : item) }));
  const updateKelompok = (index, field, value) => !isReadOnly && setForm(p => ({ ...p, kelompok: p.kelompok.map((item, i) => i === index ? { ...item, [field]: value } : item) }));

  const updatePerson = (type, index, field, value) => !isReadOnly && setForm(p => ({ ...p, [type]: p[type].map((item, i) => i === index ? { ...item, [field]: value } : item) }));
  const addPerson = (type) => !isReadOnly && setForm(p => ({ ...p, [type]: [...p[type], { id_user: "", nama: "", nomor_met: "", ttd: "", tanggal: "" }] }));
  const removePerson = (type, index) => !isReadOnly && setForm(p => ({ ...p, [type]: p[type].filter((_, i) => i !== index) }));

  const autoResizeTextarea = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-600"><Loader2 className="animate-spin mr-2" /> Memuat...</div>;

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
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold shadow-sm"><ArrowLeft size={18} /> Kembali</button>
        <div className="flex gap-3">
          {statusValidasi === "menunggu_validasi" ? (
            <>
              <button onClick={() => handleValidasi("ditolak")} className="flex gap-2 rounded-xl bg-red-100 px-5 py-3 font-bold text-red-600"><XCircle size={18} /> Tolak</button>
              <button onClick={() => handleValidasi("disetujui")} className="flex gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-white"><CheckCircle size={18} /> Setujui</button>
            </>
          ) : (
            <button onClick={handleSave} disabled={saving} className="flex gap-2 rounded-xl bg-[#CC6B27] px-5 py-3 font-bold text-white"><Save size={18} /> Simpan Data</button>
          )}
          <button onClick={() => window.print()} className="flex gap-2 rounded-xl bg-[#071E3D] px-5 py-3 font-bold text-white"><Download size={18} /> Cetak</button>
        </div>
      </div>

      <main id="print-area" className="mx-auto w-[900px] bg-white px-10 py-8 text-[14px] text-black shadow-lg print:w-full print:shadow-none print:px-0">
        
        {statusValidasi === "menunggu_validasi" && (
          <div className="mb-6 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-800 print-hidden">
            <AlertCircle className="shrink-0 mt-0.5 text-orange-500" />
            <p className="text-sm">Asesor mengajukan perubahan pada FR.IA.02. Silakan <b>Setujui</b> atau <b>Tolak</b>.</p>
          </div>
        )}

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
            <h1 className="text-[16px] font-bold">FR.IA.02. TPD - TUGAS PRAKTIK DEMONSTRASI</h1>
        </div>

        <table className="w-full border-collapse border border-black mb-6 text-[13px]">
          <tbody>
            <tr>
              <td rowSpan="2" className="w-[230px] border border-black p-2 bg-slate-50 print:bg-transparent">
                Skema Sertifikasi<br/>
                (
                  <span className={jenisSkema === 'kkni' ? '' : 'line-through'}>KKNI</span> /
                  <span className={jenisSkema === 'okupasi' ? '' : 'line-through'}> Okupasi </span> /
                  <span className={jenisSkema === 'klaster' ? '' : 'line-through'}> Klaster</span>
                )
              </td>
              <td className="w-[100px] border border-black p-2 bg-slate-50 print:bg-transparent">Judul</td>
              <td className="w-[20px] border border-black text-center">:</td>
              <td className="border border-black p-2">{skema?.judul_skema || "-"}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 print:bg-transparent">Nomor</td>
              <td className="border border-black text-center">:</td>
              <td className="border border-black p-2">{skema?.kode_skema || "-"}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-2 bg-slate-50 print:bg-transparent">TUK</td>
              <td className="border border-black text-center">:</td>
              <td className="border border-black p-2">Sewaktu/Tempat Kerja/Mandiri*</td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-2 bg-slate-50 print:bg-transparent">Nama Asesor</td>
              <td className="border border-black text-center">:</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-2 bg-slate-50 print:bg-transparent">Nama Asesi</td>
              <td className="border border-black text-center">:</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black p-2 bg-slate-50 print:bg-transparent">Tanggal</td>
              <td className="border border-black text-center">:</td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>
        <p className="text-[12px] -mt-5 mb-5 print:block hidden">*Coret yang tidak perlu</p>

        <section>
          <div className="flex gap-2 font-bold text-[14px]"><span>A.</span> <h2>Petunjuk</h2></div>
          <ol className="ml-[18px] mt-2 list-decimal space-y-1 text-[13px]">
            {form.petunjuk.map((item, index) => (
              <li key={index} className="pl-2">
                 <input value={item} readOnly={isReadOnly} onChange={e => updatePetunjuk(index, e.target.value)} className={`w-full outline-none py-1 print-hidden ${isReadOnly ? 'bg-transparent' : 'bg-slate-50 border border-slate-200 rounded px-2 focus:border-[#CC6B27] focus:bg-white'}`} />
                 <span className="hidden print:inline">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-7">
          <div className="flex gap-2 font-bold mb-4 text-[14px]"><span>B.</span> <h2>Skenario Tugas Praktik Demonstrasi</h2></div>

          {form.kelompok.map((kelompok, kIndex) => (
            <div key={kIndex} className="mt-2 mb-10 pl-5">
              <div className="mb-2 flex justify-between print-hidden">
                <p className="font-bold text-slate-700">Set {kelompok.kelompok_pekerjaan}</p>
              </div>

              <table className="w-full border-collapse border border-black mb-4 text-[13px]">
                <thead>
                  <tr className="bg-slate-50 print:bg-transparent font-bold text-center">
                    <th className="w-[185px] border border-black py-2">Kelompok Pekerjaan</th>
                    <th className="w-[45px] border border-black py-2">No.</th>
                    <th className="w-[170px] border border-black py-2">Kode Unit</th>
                    <th className="border border-black py-2 text-center">Judul Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {kelompok.units.map((unit, uIndex) => (
                    <tr key={uIndex}>
                      {uIndex === 0 && (
                        <td rowSpan={kelompok.units.length} className="w-[185px] border border-black p-2 align-middle text-center font-bold bg-slate-50 print:bg-transparent">
                           {kelompok.kelompok_pekerjaan}
                        </td>
                      )}
                      <td className="border border-black text-center">{uIndex + 1}.</td>
                      <td className="border border-black p-2 text-center">{unit.kode_unit}</td>
                      <td className="border border-black px-3 py-2 text-left">{unit.judul_unit}</td>
                    </tr>
                  ))}
                  {kelompok.units.length === 0 && (
                    <tr>
                      <td colSpan="4" className="border border-black p-3 text-center text-slate-400 italic">Belum ada unit kompetensi di kelompok ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="text-[13px] leading-relaxed">
                <p className="font-bold mb-1">Skenario Tugas Praktik Demonstrasi:</p>
                <p className="italic print:block hidden">(Situation/Situasi)</p>
                <textarea value={kelompok.skenario_tugas} readOnly={isReadOnly} onInput={autoResizeTextarea} onChange={e => updateKelompok(kIndex, "skenario_tugas", e.target.value)} className={`w-full min-h-[100px] outline-none resize-none p-2 print-hidden ${isReadOnly ? 'bg-transparent' : 'bg-slate-50 border border-slate-300 rounded'}`}/>
                <div className="hidden print:block whitespace-pre-wrap mb-4 text-justify">{kelompok.skenario_tugas}</div>

                <p className="font-bold mb-1">Perlengkapan dan Peralatan :</p>
                <textarea value={kelompok.perlengkapan_peralatan} readOnly={isReadOnly} onInput={autoResizeTextarea} onChange={e => updateKelompok(kIndex, "perlengkapan_peralatan", e.target.value)} className={`w-full min-h-[100px] outline-none resize-none p-2 print-hidden ${isReadOnly ? 'bg-transparent' : 'bg-slate-50 border border-slate-300 rounded'}`}/>
                <div className="hidden print:block whitespace-pre-wrap mb-4 pl-4">{kelompok.perlengkapan_peralatan}</div>

                <p className="font-bold mb-1">Langkah Kerja :</p>
                <textarea value={kelompok.langkah_kerja} readOnly={isReadOnly} onInput={autoResizeTextarea} onChange={e => updateKelompok(kIndex, "langkah_kerja", e.target.value)} className={`w-full min-h-[100px] outline-none resize-none p-2 print-hidden ${isReadOnly ? 'bg-transparent' : 'bg-slate-50 border border-slate-300 rounded'}`}/>
                <div className="hidden print:block whitespace-pre-wrap mb-4 pl-4">{kelompok.langkah_kerja}</div>

                <div className="flex gap-2">
                  <p>Anda diberi waktu</p>
                  <input type="number" readOnly={isReadOnly} value={kelompok.waktu} onChange={e => updateKelompok(kIndex, "waktu", e.target.value)} className={`w-16 text-center outline-none print-hidden font-bold ${isReadOnly ? 'bg-transparent' : 'bg-slate-50 border border-slate-300 rounded'}`}/>
                  <span className="hidden print:inline font-bold">{kelompok.waktu}</span>
                  <p>menit untuk mengerjakan demonstrasi atau praktek.</p>
                </div>
              </div>
            </div>
          ))}

          {form.kelompok.length === 0 && (
             <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-center font-semibold">
               Unit Kompetensi dan Kelompok Pekerjaan belum diatur pada Skema ini.
             </div>
          )}
        </section>

        <section className="mt-12 break-inside-avoid">
            <table className="w-full border-collapse border border-black text-[13px] mb-6">
                <tbody>
                    <tr><td colSpan="3" className="border border-black p-2 font-bold bg-slate-50 print:bg-transparent uppercase">ASESI :</td></tr>
                    <tr><td className="w-[200px] border border-black p-2">Nama</td><td className="w-[10px] border border-black text-center">:</td><td className="border border-black p-2"></td></tr>
                    <tr><td className="border border-black p-2 h-[60px] align-top">Tanda tangan dan<br/>Tanggal</td><td className="border border-black text-center align-top pt-2">:</td><td className="border border-black p-2"></td></tr>
                    <tr><td colSpan="3" className="border border-black p-2 font-bold bg-slate-50 print:bg-transparent uppercase">ASESOR :</td></tr>
                    <tr><td className="border border-black p-2">Nama</td><td className="border border-black text-center">:</td><td className="border border-black p-2"></td></tr>
                    <tr><td className="border border-black p-2">No. Reg</td><td className="border border-black text-center">:</td><td className="border border-black p-2"></td></tr>
                    <tr><td className="border border-black p-2 h-[60px] align-top">Tanda tangan dan<br/>Tanggal</td><td className="border border-black text-center align-top pt-2">:</td><td className="border border-black p-2"></td></tr>
                </tbody>
            </table>

          <p className="font-bold text-[13px] mb-1">PENYUSUN DAN VALIDATOR</p>
          <table className="w-full border-collapse border border-black text-[13px] text-center">
            <thead>
              <tr className="bg-slate-50 print:bg-transparent uppercase">
                <th className="border border-black p-2">STATUS</th><th className="border border-black p-2 w-[40px]">NO</th><th className="border border-black p-2">NAMA</th>
                <th className="border border-black p-2">NOMOR MET</th><th className="border border-black p-2">TANDA TANGAN DAN TANGGAL</th>
                {!isReadOnly && <th className="border border-black print-hidden w-[40px]"></th>}
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
                      updatePerson(type, index, "nomor_met", a?.no_lisensi || a?.no_reg_asesor || ""); 
                      updatePerson(type, index, "ttd", a?.ttd_path || ""); 
                      updatePerson(type, index, "tanggal", new Date().toISOString().slice(0, 10)); 
                    }} className={`w-full outline-none print-hidden ${isReadOnly ? 'bg-transparent appearance-none' : 'bg-slate-50 border border-slate-300 p-1.5 rounded cursor-pointer'}`}>
                      <option value="">-- Pilih Asesor --</option>
                      {listAsesor.map(a => <option key={a.id_asesor || a.id_user} value={a.id_asesor || a.id_user}>{a.nama_lengkap}</option>)}
                    </select>
                    <span className="hidden print:inline ml-2">{item.nama}</span>
                  </td>
                  <td className="border border-black p-2">{item.nomor_met || "-"}</td>
                  <td className="border border-black p-1">
                    <div className="flex flex-col items-center justify-center py-2 relative h-[70px]">
                      {item.ttd ? (<img src={item.ttd} alt="TTD" className="h-12 object-contain absolute top-1" />) : null}
                    </div>
                  </td>
                  {!isReadOnly && <td className="border border-black print-hidden"><button onClick={() => removePerson(type, index)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={15}/></button></td>}
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
    </div>
  );
}