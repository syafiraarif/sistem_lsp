import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle, Loader2, X, RefreshCw } from 'lucide-react';
import SidebarTUK from '../../components/sidebar/SidebarTuk';

const BuatJadwal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skemaLoading, setSkemaLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [skemaOptions, setSkemaOptions] = useState([]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayString = today.toISOString().split('T')[0];

  const bulanList = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember'
  ];

  const [form, setForm] = useState({
    kode_jadwal: '',
    id_skema: '',
    nama_kegiatan: '',
    tahun: currentYear,
    periode_bulan: '',
    gelombang: '',
    kuota: '',
    tgl_awal: '',
    tgl_akhir: '',
    jam: '09:00',
    pelaksanaan_uji: 'luring',
    url_agenda: '',
    status: 'draft'
  });

  /* FETCH SKEMA */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const fetchSkema = async () => {
      try {
        setSkemaLoading(true);
        const res = await axios.get(
          'http://localhost:3000/api/tuk/skema',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSkemaOptions(res.data.data || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setSkemaLoading(false);
      }
    };

    fetchSkema();
  }, [navigate]);

  const getFilteredBulan = () => {
    if (parseInt(form.tahun) === currentYear)
      return bulanList.filter((_, i) => i >= currentMonth);
    return bulanList;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_skema)
      return setMsg({ type: 'error', text: 'Pilih Skema terlebih dahulu!' });

    if (!form.kuota)
      return setMsg({ type: 'error', text: 'Masukkan Kuota Peserta!' });

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const payload = {
        ...form,
        id_skema: parseInt(form.id_skema),
        tahun: parseInt(form.tahun),
        kuota: parseInt(form.kuota)
      };

      await axios.post(
        'http://localhost:3000/api/tuk/jadwal',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg({ type: 'success', text: 'Jadwal berhasil dibuat!' });
      setTimeout(() => navigate('/tuk/jadwal'), 1500);

    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Gagal membuat jadwal.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarTUK isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onLogout={()=>{
        localStorage.clear();
        navigate('/login');
      }} />

      <div className="flex-1 ml-0 lg:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Buat Jadwal Uji Kompetensi</h1>

        {msg.text && (
          <div className={`mb-4 p-3 rounded text-white ${msg.type==='success'?'bg-green-500':'bg-red-500'}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="font-bold border-b pb-1">Identitas</div>

          <input name="kode_jadwal" placeholder="Kode Jadwal"
            value={form.kode_jadwal} onChange={handleChange}
            className="p-3 border rounded w-full" />

          <select name="id_skema" value={form.id_skema}
            onChange={handleChange}
            className="p-3 border rounded w-full"
            required>
            <option value="">Pilih Skema</option>
            {skemaOptions.map(s=>(
              <option key={s.id_skema} value={s.id_skema}>
                {s.judul_skema}
              </option>
            ))}
          </select>

          <input name="nama_kegiatan" placeholder="Nama Kegiatan"
            value={form.nama_kegiatan}
            onChange={handleChange}
            className="p-3 border rounded w-full"
            required />

          <div className="font-bold border-b pb-1">Waktu Pelaksanaan</div>

          <input type="number" name="tahun"
            value={form.tahun}
            onChange={handleChange}
            className="p-3 border rounded w-full" />

          <select name="periode_bulan"
            value={form.periode_bulan}
            onChange={handleChange}
            className="p-3 border rounded w-full">
            <option value="">Pilih Bulan</option>
            {getFilteredBulan().map(b=>(
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <input name="gelombang"
            placeholder="Gelombang"
            value={form.gelombang}
            onChange={handleChange}
            className="p-3 border rounded w-full" />

          <input name="kuota"
            placeholder="Kuota Peserta"
            value={form.kuota}
            onChange={handleChange}
            className="p-3 border rounded w-full" />

          <input type="date"
            name="tgl_awal"
            min={todayString}
            value={form.tgl_awal}
            onChange={handleChange}
            className="p-3 border rounded w-full" />

          <input type="date"
            name="tgl_akhir"
            min={form.tgl_awal || todayString}
            value={form.tgl_akhir}
            onChange={handleChange}
            className="p-3 border rounded w-full" />

          <input type="time"
            name="jam"
            value={form.jam}
            onChange={handleChange}
            className="p-3 border rounded w-full" />

          <div className="font-medium">Tipe</div>
          <div className="grid grid-cols-4 gap-2">
            {['luring','daring','hybrid','onsite'].map(t=>(
              <button type="button"
                key={t}
                onClick={()=>setForm({...form, pelaksanaan_uji:t})}
                className={`p-2 border rounded capitalize ${form.pelaksanaan_uji===t?'bg-orange-500 text-white':''}`}>
                {t}
              </button>
            ))}
          </div>

          <input name="url_agenda"
            placeholder="URL Agenda"
            value={form.url_agenda}
            onChange={handleChange}
            className="p-3 border rounded w-full" />

          <button type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white p-3 rounded">
            {loading ? "Menyimpan..." : "Simpan Jadwal"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuatJadwal;