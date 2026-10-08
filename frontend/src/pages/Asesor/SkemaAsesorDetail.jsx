import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, FileQuestion, FileText, Layers3, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import api from "../../services/api";

export default function SkemaAsesorDetail() {
  const { id_skema } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/asesor/skema/${id_skema}`);
        setData(response.data?.data || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id_skema]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]"><Loader2 size={34} className="animate-spin text-[#CC6B27]" /></div>;
  }

  if (!data?.skema) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]"><p className="font-bold text-[#071E3D]">Skema tidak ditemukan.</p></div>;
  }

  const instruments = [
    { label: "FR.IA.02", path: "fr-ia02", icon: FileText, ready: Boolean(data.instrumen?.fr_ia_02) },
    { label: "FR.IA.03", path: "fr-ia03", icon: FileQuestion, ready: Boolean(data.instrumen?.fr_ia_03) },
    { label: "Paket Soal FR.IA.05", path: "fr-ia05", icon: CheckCircle2, ready: Boolean(data.instrumen?.fr_ia_05) }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="min-h-screen p-4 md:p-6 lg:ml-24 lg:p-8">
        <div className="mx-auto max-w-[1300px] space-y-5">
          <button type="button" onClick={() => navigate("/asesor/skema")} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#071E3D]/60 hover:text-[#CC6B27]"><ArrowLeft size={15} /> Kembali ke Skema</button>
          <section className="rounded-2xl border border-[#071E3D]/10 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-[#CC6B27]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#CC6B27]">{data.skema.kode_skema}</span>
                <h1 className="mt-3 text-2xl font-black text-[#071E3D] md:text-3xl">{data.skema.judul_skema}</h1>
                <p className="mt-2 text-sm font-medium leading-6 text-[#182D4A]/60">{data.skema.bidang || "Bidang belum diisi"} · {data.skema.jenis_skema} · Jenjang {data.skema.jenjang_kualifikasi || "-"}</p>
              </div>
              <div className="rounded-xl bg-[#FAFAFA] p-4 text-right"><p className="text-[10px] font-black uppercase tracking-wider text-[#182D4A]/40">Unit Kompetensi</p><p className="mt-1 text-2xl font-black text-[#071E3D]">{data.units?.length || 0}</p></div>
            </div>
          </section>
          <section className="grid gap-4 md:grid-cols-3">
            {instruments.map(({ label, path, icon: Icon, ready }) => (
              <button key={path} type="button" onClick={() => navigate(`/asesor/skema/${id_skema}/${path}`)} className="rounded-2xl border border-[#071E3D]/10 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#CC6B27]/35 hover:shadow-md">
                <div className="flex items-start justify-between gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#CC6B27]/10 text-[#CC6B27]"><Icon size={21} /></span><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${ready ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{ready ? "Tersedia" : "Belum dibuat"}</span></div>
                <h2 className="mt-5 text-base font-black text-[#071E3D]">{label}</h2>
                <p className="mt-2 text-xs font-medium leading-6 text-[#182D4A]/55">{path === "fr-ia02" ? "Tugas praktik demonstrasi berdasarkan unit dan kelompok pekerjaan." : path === "fr-ia03" ? "Pertanyaan lisan untuk menggali bukti kompetensi." : "Paket soal pilihan ganda yang digunakan pada pelaksanaan asesmen."}</p>
              </button>
            ))}
          </section>
          <section className="grid gap-4 lg:grid-cols-2">
            <InfoCard icon={<Layers3 size={18} />} title="Kelompok Pekerjaan" items={(data.kelompok || []).map((item) => `${item.urutan || "-"}. ${item.nama_kelompok}`)} empty="Belum ada kelompok pekerjaan." />
            <InfoCard icon={<FileText size={18} />} title="Unit Kompetensi" items={(data.units || []).map((item) => item.unit ? `${item.unit.kode_unit} — ${item.unit.judul_unit}` : `Unit ${item.id_unit}`)} empty="Belum ada unit kompetensi." />
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ icon, title, items, empty }) {
  return <section className="rounded-2xl border border-[#071E3D]/10 bg-white p-6 shadow-sm"><div className="flex items-center gap-2 text-[#071E3D]"><span className="text-[#CC6B27]">{icon}</span><h2 className="text-sm font-black uppercase tracking-wider">{title}</h2></div><div className="mt-4 space-y-2">{items.length ? items.map((item, index) => <div key={`${item}-${index}`} className="rounded-xl bg-[#FAFAFA] px-4 py-3 text-xs font-semibold leading-5 text-[#182D4A]/70">{item}</div>) : <p className="text-xs font-medium text-[#182D4A]/45">{empty}</p>}</div></section>;
}
