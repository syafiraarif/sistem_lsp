import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function FRIA01Asesor() {
  const navigate = useNavigate();

  const {
    id,
    id_jadwal,
    id_peserta
  } = useParams();

  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [idFrIa01, setIdFrIa01] = useState(null);

  const [form, setForm] = useState({
    umpan_balik: "",
    rekomendasi: "",
    catatan_rekomendasi: "",
    ttd_asesor: ""
  });

  const [detail, setDetail] = useState([]);

  useEffect(() => {
  fetchData();
}, [id, id_jadwal, id_peserta]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      let res;

      if (id) {
        res = await axios.get(
          `http://localhost:3000/api/asesor/fr-ia01/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        res = await axios.get(
          `http://localhost:3000/api/asesor/fr-ia01?id_jadwal=${id_jadwal}&id_peserta=${id_peserta}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      if (!id && res.data.generated) {
        setIsEdit(false);
        setDetail(res.data.detail);
      } else {
        setIsEdit(true);
        setIdFrIa01(res.data.id_fr_ia_01 || id);

        setForm({
          umpan_balik: res.data.umpan_balik || "",
          rekomendasi: res.data.rekomendasi || "",
          catatan_rekomendasi: res.data.catatan_rekomendasi || "",
          ttd_asesor: res.data.ttd_asesor || ""
        });

        setDetail(res.data.detail);
      }
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Data FR.IA.01 tidak dapat dimuat"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleDetailChange = (index, field, value) => {
    const temp = [...detail];

    temp[index][field] = value;

    setDetail(temp);
  };

    const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        id_jadwal,
        id_peserta,
        umpan_balik: form.umpan_balik,
        rekomendasi: form.rekomendasi,
        catatan_rekomendasi: form.catatan_rekomendasi,
        ttd_asesor: form.ttd_asesor,
        detail
      };

      if (isEdit) {
        await axios.put(
          `http://localhost:3000/api/asesor/fr-ia01/${idFrIa01}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        await axios.post(
          "http://localhost:3000/api/asesor/fr-ia01",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "FR.IA.01 berhasil disimpan"
      });

      navigate(
        `/asesor/jadwal-saya/${id_jadwal}/peserta/${id_peserta}`
      );
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Terjadi kesalahan"
      });
    }
  };

  const downloadPdf = () => {
    if (!idFrIa01) {
      Swal.fire({
        icon: "warning",
        title: "Belum Bisa",
        text: "Simpan data terlebih dahulu."
      });

      return;
    }

    const token = localStorage.getItem("token");

    window.open(
      `http://localhost:3000/api/asesor/fr-ia01/${idFrIa01}/pdf?token=${token}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="container py-5">
        <h5>Loading...</h5>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      <div className="card shadow">

        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">

          <h4 className="mb-0">
            FR.IA.01 Checklist Observasi
          </h4>

          <button
            className="btn btn-light"
            onClick={() => navigate(-1)}
          >
            Kembali
          </button>

        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="fw-bold">
                Umpan Balik
              </label>

              <textarea
                className="form-control"
                rows={3}
                name="umpan_balik"
                value={form.umpan_balik}
                onChange={handleHeaderChange}
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="fw-bold">
                Rekomendasi
              </label>

              <textarea
                className="form-control"
                rows={3}
                name="rekomendasi"
                value={form.rekomendasi}
                onChange={handleHeaderChange}
              />

            </div>

            <div className="col-md-12 mb-3">

              <label className="fw-bold">
                Catatan Rekomendasi
              </label>

              <textarea
                className="form-control"
                rows={3}
                name="catatan_rekomendasi"
                value={form.catatan_rekomendasi}
                onChange={handleHeaderChange}
              />

            </div>

          </div>

          <hr />

          <div className="table-responsive">

            <table className="table table-bordered align-middle">

              <thead className="table-primary">

                <tr>
                  <th width="5%">No</th>
                  <th width="15%">Kode Unit</th>
                  <th>Elemen / KUK</th>
                  <th width="20%">Standar Industri</th>
                  <th width="15%">Pencapaian</th>
                  <th width="15%">Penilaian Lanjut</th>
                </tr>

              </thead>

              <tbody>

                                {detail.map((item, index) => (
                  <tr key={index}>
                    <td className="text-center">
                      {index + 1}
                    </td>

                    <td>
                      <div className="fw-bold">
                        {item.kode_unit}
                      </div>
                      <small className="text-muted">
                        {item.judul_unit}
                      </small>
                    </td>

                    <td>
                      <div className="fw-semibold">
                        {item.nama_elemen}
                      </div>

                      <div className="text-muted mt-2">
                        {item.kuk}
                      </div>
                    </td>

                    <td>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={item.standar_industri || ""}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "standar_industri",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <select
                        className="form-select"
                        value={item.pencapaian || ""}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "pencapaian",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Pilih
                        </option>

                        <option value="ya">
                            Ya
                        </option>

                        <option value="tidak">
                            Tidak
                        </option>
                      </select>
                    </td>

                    <td>
                      <select
                        className="form-select"
                        value={item.penilaian_lanjut || ""}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "penilaian_lanjut",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Pilih
                        </option>

                        <option value="Lanjut">
                          Lanjut
                        </option>

                        <option value="Tidak Lanjut">
                          Tidak Lanjut
                        </option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

          <hr />

          <div className="d-flex justify-content-end gap-2">

            {isEdit && (
              <button
                className="btn btn-danger"
                onClick={downloadPdf}
              >
                Download PDF
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              {isEdit ? "Update FR.IA.01" : "Simpan FR.IA.01"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}