import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Printer } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";

const PRINT_CSS = `
@page { size: A4 portrait; margin: 10mm; }
@media print {
  html, body { background: #fff !important; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .fria01-print-sheet { width: 100% !important; max-width: none !important; margin: 0 !important; box-shadow: none !important; }
  .fria01-page-break-avoid { break-inside: avoid; page-break-inside: avoid; }
  .fria01-rows-avoid tr { break-inside: avoid; page-break-inside: avoid; }
}
`;

export default function FRIA01Asesor() {
  const navigate = useNavigate();
  const { id, id_jadwal, id_peserta } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [idFrIa01, setIdFrIa01] = useState(null);
  const [exists, setExists] = useState(false);
  const [context, setContext] = useState({
    skema: {},
    tuk: {},
    asesor: {},
    asesi: {},
    jadwal: {},
  });
  const [groups, setGroups] = useState([]);
  const [detail, setDetail] = useState([]);
  const [form, setForm] = useState({
    umpan_balik: "",
    rekomendasi: "",
    catatan_rekomendasi: "",
    ttd_asesor: "",
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, id_jadwal, id_peserta]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = id
        ? await api.get(`/asesor/fr-ia01/${id}`)
        : await api.get(`/asesor/fr-ia01?id_jadwal=${id_jadwal}&id_peserta=${id_peserta}`);

      const payload = response.data || {};
      const source = payload.data || payload;

      setExists(Boolean(source?.id_fr_ia_01));
      setIdFrIa01(source?.id_fr_ia_01 || payload?.id_fr_ia_01 || id || null);

      setContext({
        skema: payload.skema || source.skema || {},
        tuk: payload.tuk || source.tuk || {},
        asesor: payload.asesor || source.asesor || {},
        asesi: payload.asesi || source.asesi || {},
        jadwal: payload.jadwal || source.jadwal || {},
      });

      const incomingGroups = payload.kelompokPekerjaan || source.kelompokPekerjaan || [];
      setGroups(Array.isArray(incomingGroups) ? incomingGroups : []);

      const incomingDetail = payload.detail || source.detail || [];
      const sopStandard = `SOP ${payload.skema?.judul_skema || source.skema?.judul_skema || ""}`.trim();
      setDetail(
        Array.isArray(incomingDetail)
          ? incomingDetail.map((row) => ({
              ...row,
              standar_industri: sopStandard || row.standar_industri || "",
            }))
          : []
      );

      setForm({
        umpan_balik: source.umpan_balik || payload.umpan_balik || "",
        rekomendasi: source.rekomendasi || payload.rekomendasi || "",
        catatan_rekomendasi:
          source.catatan_rekomendasi || payload.catatan_rekomendasi || "",
        ttd_asesor:
          source.ttd_asesor ||
          payload.ttd_asesor ||
          payload.asesor?.ttd_path ||
          source.asesor?.ttd_path ||
          "",
      });
    } catch (err) {
      console.error("LOAD FR.IA.01 ERROR:", err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Data FR.IA.01 tidak dapat dimuat",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const groupedDetail = useMemo(() => {
    if (!groups.length) return [];
    return groups;
  }, [groups]);

  const incompleteItems = useMemo(() => {
    const items = [];
    groups.forEach((group) => {
      (group.units || []).forEach((unit) => {
        (unit.detail || []).forEach((baseRow) => {
          const current = detail.find((row) => Number(row.id_kuk) === Number(baseRow.id_kuk)) || baseRow;
          if (current.pencapaian === "tidak") {
            items.push({
              kelompok: group.nama_kelompok || `Kelompok Pekerjaan`,
              unit: `${unit.kode_unit || "-"} - ${unit.judul_unit || "-"}`,
              elemen: current.nama_elemen || "-",
              kuk: current.kuk || "-",
            });
          }
        });
      });
    });
    return items;
  }, [groups, detail]);

  const derivedRecommendation = useMemo(() => {
    if (!detail.length) return form.rekomendasi || "";
    const hasTidak = detail.some((row) => row.pencapaian === "tidak");
    const allYa = detail.every((row) => row.pencapaian === "ya");
    if (hasTidak) return "belum_kompeten";
    if (allYa) return "kompeten";
    return form.rekomendasi || "";
  }, [detail, form.rekomendasi]);

  const updateDetail = (idKuk, field, value) => {
    setDetail((prev) =>
      prev.map((item) =>
        Number(item.id_kuk) === Number(idKuk)
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const updatePencapaian = (idKuk, value) => {
    setDetail((prev) => {
      const next = prev.map((item) =>
        Number(item.id_kuk) === Number(idKuk)
          ? { ...item, pencapaian: value }
          : item
      );
      const hasTidak = next.some((item) => item.pencapaian === "tidak");
      const allYa = next.length > 0 && next.every((item) => item.pencapaian === "ya");
      setForm((current) => ({
        ...current,
        rekomendasi: hasTidak ? "belum_kompeten" : allYa ? "kompeten" : current.rekomendasi || "",
      }));
      return next;
    });
  };

  const handleSave = async () => {
    if (!id_jadwal && !context.jadwal?.id_jadwal) {
      return Swal.fire("Gagal", "ID jadwal tidak ditemukan", "warning");
    }

    if (!id_peserta && !context.asesi?.id_peserta) {
      return Swal.fire("Gagal", "ID peserta tidak ditemukan", "warning");
    }

    try {
      setSaving(true);
      const payload = {
        id_jadwal: Number(id_jadwal || context.jadwal?.id_jadwal),
        id_peserta: Number(id_peserta || context.asesi?.id_peserta),
        umpan_balik: form.umpan_balik || "",
        rekomendasi: derivedRecommendation || null,
        catatan_rekomendasi: form.catatan_rekomendasi || null,
        ttd_asesor:
          form.ttd_asesor ||
          context.asesor?.ttd_path ||
          context.asesor?.ttd ||
          null,
        detail: detail.map((item) => ({
          id_unit: item.id_unit,
          id_elemen: item.id_elemen,
          id_kuk: item.id_kuk,
          standar_industri:
            item.standar_industri ||
            `SOP ${context.skema?.judul_skema || ""}`.trim() ||
            null,
          pencapaian: item.pencapaian || null,
          penilaian_lanjut: item.penilaian_lanjut || null,
        })),
      };

      let response;
      if (exists && idFrIa01) {
        response = await api.put(`/asesor/fr-ia01/${idFrIa01}`, payload);
      } else {
        response = await api.post("/asesor/fr-ia01", payload);
      }

      const newId = response.data?.id_fr_ia_01 || response.data?.data?.id_fr_ia_01;
      if (newId) {
        setIdFrIa01(newId);
        setExists(true);
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "FR.IA.01 berhasil disimpan",
        timer: 1200,
        showConfirmButton: false,
      });

      await fetchData();
    } catch (err) {
      console.error("SAVE FR.IA.01 ERROR:", err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "FR.IA.01 gagal disimpan",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const printPage = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 font-bold text-slate-600">
          <Loader2 className="animate-spin" />
          Memuat FR.IA.01 Asesor Penguji...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{PRINT_CSS}</style>

      <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
        <div className="mx-auto mb-5 flex max-w-[1100px] justify-between print:hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {exists ? "Update FR.IA.01" : "Simpan FR.IA.01"}
            </button>

            <button
              type="button"
              onClick={printPage}
              className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-900"
            >
              <Printer size={18} />
              Cetak / PDF
            </button>

          </div>
        </div>

        <main className="fria01-print-sheet mx-auto w-[1000px] max-w-[1000px] bg-white px-10 py-7 text-[12px] leading-tight text-black shadow-lg print:w-full print:max-w-none print:px-0 print:py-0 print:shadow-none">
          <h1 className="mb-5 text-center text-[17px] font-black uppercase leading-snug">
            FR.IA.01. CL - CEKLIS OBSERVASI AKTIVITAS DI TEMPAT KERJA ATAU TEMPAT KERJA SIMULASI
          </h1>

          <HeaderTable context={context} />

          <section className="mt-5 border border-black fria01-page-break-avoid">
            <div className="border-b border-black bg-gray-100 px-2 py-1 font-bold uppercase">
              PANDUAN BAGI ASESOR
            </div>
            <ul className="list-disc space-y-1 px-7 py-2.5 leading-relaxed">
              <li>Lengkapi nama unit kompetensi, elemen, dan kriteria unjuk kerja sesuai kolom dalam tabel.</li>
              <li>Isilah standar industri atau tempat kerja.</li>
              <li>Beri tanda centang (✓) pada kolom “YA” jika Anda yakin asesi dapat melakukan/mendemonstrasikan tugas sesuai KUK, atau centang (✓) pada kolom “Tidak” bila sebaliknya.</li>
              <li>Penilaian Lanjut disesuaikan dengan hasil pengamatan untuk memastikan keputusan dapat dibuat.</li>
              <li>Isilah kolom KUK sesuai dengan Unit Kompetensi/ SKKNI.</li>
            </ul>
          </section>

          {groupedDetail.length === 0 ? (
            <div className="my-6 border border-black p-6 text-center font-bold">
              Belum ada unit kompetensi yang dipetakan pada skema ini.
            </div>
          ) : (
            groupedDetail.map((group, groupIndex) => (
              <GroupSection
                key={group.id_kelompok || `group-${groupIndex}`}
                group={group}
                groupIndex={groupIndex}
                detail={detail}
                updateDetail={updateDetail}
                updatePencapaian={updatePencapaian}
              />
            ))
          )}

          <section className="mt-5 border border-black fria01-page-break-avoid">
            <div className="px-2 py-1 font-bold">Umpan Balik untuk asesi:</div>
            <textarea
              value={form.umpan_balik}
              onChange={(e) => setForm((prev) => ({ ...prev, umpan_balik: e.target.value }))}
              rows={5}
              className="block h-[92px] w-full resize-none border-0 border-t border-black px-2 py-2 text-[12px] outline-none print:h-[92px]"
              placeholder="Umpan balik hasil observasi..."
            />
          </section>

          <section className="mt-4 border border-black fria01-page-break-avoid">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-2">
                <div className="font-bold">Rekomendasi:</div>
                <div className="mt-2 flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={derivedRecommendation === "kompeten"}
                    readOnly
                    className="mt-0.5 h-3.5 w-3.5"
                  />
                  <span>Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan <b>KOMPETEN</b></span>
                </div>

                <div className="mt-4 flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={derivedRecommendation === "belum_kompeten"}
                    readOnly
                    className="mt-0.5 h-3.5 w-3.5"
                  />
                  <span>
                    Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan <b>BELUM KOMPETEN</b>
                  </span>
                </div>

                {derivedRecommendation === "belum_kompeten" && incompleteItems.length > 0 && (
                  <div className="mt-3 space-y-2 text-[11px] leading-snug">
                    {incompleteItems.map((item, index) => (
                      <div key={`${item.kuk}-${index}`} className="border-t border-black pt-2">
                        <div><b>Kelompok Pekerjaan:</b> {item.kelompok}</div>
                        <div><b>Unit:</b> {item.unit}</div>
                        <div><b>Elemen:</b> {item.elemen}</div>
                        <div><b>KUK:</b> {item.kuk}</div>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  value={form.catatan_rekomendasi}
                  onChange={(e) => setForm((prev) => ({ ...prev, catatan_rekomendasi: e.target.value }))}
                  rows={4}
                  className="mt-3 w-full resize-none border border-black px-2 py-1 text-[11px] outline-none print:h-[60px]"
                  placeholder="Catatan rekomendasi tambahan (opsional)"
                />
              </div>

              <SignatureBlock asesi={context.asesi} asesor={context.asesor} />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

function HeaderTable({ context }) {
  const { skema, tuk, asesor, asesi, jadwal } = context;
  const tanggal = jadwal?.tgl_awal || jadwal?.tgl_akhir || new Date().toISOString().slice(0, 10);

  return (
    <table className="w-full border-collapse border border-black">
      <tbody>
        <tr>
          <td rowSpan="2" className="w-[205px] border border-black px-2 py-2 font-bold align-middle">
            Skema Sertifikasi<br />(KKNI/Okupasi/Klaster)
          </td>
          <td className="w-[75px] border border-black px-2 py-1 font-bold">Judul</td>
          <td className="w-[18px] border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">{skema?.judul_skema || "-"}</td>
        </tr>
        <tr>
          <td className="border border-black px-2 py-1 font-bold">Nomor</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">{skema?.kode_skema || "-"}</td>
        </tr>
        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">TUK</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">{tuk?.nama_tuk || "-"}</td>
        </tr>
        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">Nama Asesor</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">{getNama(asesor)}</td>
        </tr>
        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">Nama Asesi</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">{getNama(asesi)}</td>
        </tr>
        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">Tanggal</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">{formatDate(tanggal)}</td>
        </tr>
      </tbody>
    </table>
  );
}

function GroupSection({ group, groupIndex, detail, updateDetail, updatePencapaian }) {
  const totalRows = Math.max(group.units.length, 1);

  return (
    <section className="mt-5 fria01-page-break-avoid">
      <table className="w-full border-collapse border border-black fria01-rows-avoid">
        <thead>
          <tr>
            <th className="w-[45px] border border-black px-2 py-1 text-center">No.</th>
            <th className="w-[185px] border border-black px-2 py-1 text-center">Kode Unit</th>
            <th className="border border-black px-2 py-1 text-center">Judul Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan={Math.max(totalRows + 1, 2)} className="w-[90px] border border-black px-2 py-1 align-middle text-center font-bold">
              Kelompok<br />Pekerjaan {groupIndex + 1}<br />
              <span className="font-normal">{group.nama_kelompok}</span>
            </td>
            {group.units.length > 0 ? (
              <td className="border border-black px-2 py-1 font-bold">{group.units[0].kode_unit}</td>
            ) : (
              <td className="border border-black px-2 py-1" colSpan="2">Belum ada unit kompetensi</td>
            )}
            {group.units.length > 0 && (
              <td className="border border-black px-2 py-1">{group.units[0].judul_unit}</td>
            )}
          </tr>
          {group.units.slice(1).map((unit) => (
            <tr key={`unit-${unit.id_unit}`}>
              <td className="border border-black px-2 py-1 font-bold">{unit.kode_unit}</td>
              <td className="border border-black px-2 py-1">{unit.judul_unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {group.units.map((unit) => (
        <UnitDetailTable
          key={`detail-${unit.id_unit}`}
          unit={unit}
          detail={detail}
          updateDetail={updateDetail}
          updatePencapaian={updatePencapaian}
        />
      ))}
    </section>
  );
}

function UnitDetailTable({ unit, detail, updateDetail, updatePencapaian }) {
  const rows = detail.filter((item) => Number(item.id_unit) === Number(unit.id_unit));
  const groupedElements = [];
  rows.forEach((row) => {
    let target = groupedElements.find((item) => Number(item.id_elemen) === Number(row.id_elemen));
    if (!target) {
      target = { id_elemen: row.id_elemen, nama_elemen: row.nama_elemen, rows: [] };
      groupedElements.push(target);
    }
    target.rows.push(row);
  });

  return (
    <div className="mt-4 fria01-page-break-avoid">
      <table className="w-full border-collapse border border-black">
        <tbody>
          <tr>
            <td className="w-[180px] border border-black px-2 py-1 font-bold">Unit Kompetensi</td>
            <td className="w-[55px] border border-black px-2 py-1 text-center">:</td>
            <td className="border border-black px-2 py-1 font-bold">{unit.kode_unit}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1 font-bold">Judul Unit</td>
            <td className="border border-black px-2 py-1 text-center">:</td>
            <td className="border border-black px-2 py-1">{unit.judul_unit}</td>
          </tr>
        </tbody>
      </table>

      <table className="mt-3 w-full border-collapse border border-black fria01-rows-avoid">
        <thead>
          <tr>
            <th rowSpan="2" className="w-[40px] border border-black px-1.5 py-1 text-center align-middle">No.</th>
            <th rowSpan="2" className="w-[95px] border border-black px-1.5 py-1 text-center align-middle">Elemen</th>
            <th rowSpan="2" className="border border-black px-1.5 py-1 text-center align-middle">Kriteria Unjuk Kerja</th>
            <th rowSpan="2" className="w-[175px] border border-black px-1.5 py-1 text-center align-middle">Standar Industri<br />atau Tempat Kerja</th>
            <th colSpan="2" className="w-[96px] border border-black px-1 py-1 text-center">Pencapaian</th>
            <th rowSpan="2" className="w-[135px] border border-black px-1.5 py-1 text-center align-middle">Penilaian<br />Lanjut</th>
          </tr>
          <tr>
            <th className="w-[48px] border border-black px-1 py-1 text-[10px] text-center">Ya</th>
            <th className="w-[48px] border border-black px-1 py-1 text-[10px] text-center">Tidak</th>
          </tr>
        </thead>
        <tbody>
          {groupedElements.length === 0 ? (
            <tr>
              <td colSpan="7" className="border border-black px-2 py-4 text-center">Belum ada elemen / KUK.</td>
            </tr>
          ) : (
            groupedElements.map((element, elementIndex) =>
              element.rows.map((row, rowIndex) => (
                <tr key={row.id_kuk}>
                  {rowIndex === 0 && (
                    <td rowSpan={element.rows.length} className="border border-black px-1.5 py-1 align-top text-center">
                      {elementIndex + 1}
                    </td>
                  )}
                  {rowIndex === 0 && (
                    <td rowSpan={element.rows.length} className="border border-black px-1.5 py-1 align-middle text-left">
                      {element.nama_elemen || "-"}
                    </td>
                  )}
                  <td className="border border-black px-1.5 py-1 align-top">
                    {row.kuk || "-"}
                  </td>
                  <td className="border border-black px-1.5 py-1 align-top text-[11px]">
                    {row.standar_industri || "-"}
                  </td>
                  <td className="border border-black px-1 py-1 align-middle text-center">
                    <input
                      type="checkbox"
                      checked={row.pencapaian === "ya"}
                      onChange={() => updatePencapaian(row.id_kuk, "ya")}
                    />
                  </td>
                  <td className="border border-black px-1 py-1 align-middle text-center">
                    <input
                      type="checkbox"
                      checked={row.pencapaian === "tidak"}
                      onChange={() => updatePencapaian(row.id_kuk, "tidak")}
                    />
                  </td>
                  <td className="border border-black px-1.5 py-1 align-top">
                    <textarea
                      value={row.penilaian_lanjut || ""}
                      onChange={(e) => updateDetail(row.id_kuk, "penilaian_lanjut", e.target.value)}
                      rows={3}
                      className="w-full resize-none border-0 p-0 text-[11px] leading-tight outline-none"
                      placeholder=""
                    />
                  </td>
                </tr>
              ))
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function SignatureBlock({ asesi, asesor }) {
  const asesiTtd = normalizeFileUrl(asesi?.ttd_path || asesi?.ttd);
  const asesorTtd = normalizeFileUrl(asesor?.ttd_path || asesor?.ttd);
  const tanggal = new Date().toLocaleDateString("id-ID");

  return (
    <div className="grid grid-cols-1">
      <div className="border-b border-black">
        <div className="border-b border-black px-2 py-1 font-bold">Asesi</div>
        <div className="grid grid-cols-[145px_20px_1fr]">
          <div className="border-r border-black px-2 py-2 font-bold">Nama</div>
          <div className="border-r border-black px-2 py-2 text-center">:</div>
          <div className="px-2 py-2">{getNama(asesi)}</div>
          <div className="border-r border-t border-black px-2 py-2 font-bold">Tanda tangan / Tanggal</div>
          <div className="border-r border-t border-black px-2 py-2 text-center">:</div>
          <div className="h-[82px] border-t border-black px-2 py-1">
            {asesiTtd ? (
              <img src={asesiTtd} alt="Tanda tangan asesi" className="h-[60px] max-w-[180px] object-contain object-left" />
            ) : (
              <div className="pt-10 text-[10px] text-gray-500">{tanggal}</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="border-b border-black px-2 py-1 font-bold">Asesor</div>
        <div className="grid grid-cols-[145px_20px_1fr]">
          <div className="border-r border-black px-2 py-2 font-bold">Nama</div>
          <div className="border-r border-black px-2 py-2 text-center">:</div>
          <div className="px-2 py-2">{getNama(asesor)}</div>

          <div className="border-r border-t border-black px-2 py-2 font-bold">No. Reg</div>
          <div className="border-r border-t border-black px-2 py-2 text-center">:</div>
          <div className="border-t border-black px-2 py-2">{asesor?.no_reg_asesor || asesor?.no_reg || "-"}</div>

          <div className="border-r border-t border-black px-2 py-2 font-bold">Tanda tangan / Tanggal</div>
          <div className="border-r border-t border-black px-2 py-2 text-center">:</div>
          <div className="h-[82px] border-t border-black px-2 py-1">
            {asesorTtd ? (
              <img src={asesorTtd} alt="Tanda tangan asesor" className="h-[60px] max-w-[180px] object-contain object-left" />
            ) : (
              <div className="pt-10 text-[10px] text-gray-500">{tanggal}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getNama(obj) {
  return obj?.nama_lengkap || obj?.nama || obj?.username || obj?.email || "-";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID");
}

function normalizeFileUrl(path) {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  const base = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
  const root = base.replace("/api", "");
  return `${root}/${String(path).replace(/^\/+/, "")}`;
}