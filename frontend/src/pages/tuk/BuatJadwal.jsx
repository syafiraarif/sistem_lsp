import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    tgl_pra_asesmen: '', 
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
        
        console.log('🔍 Fetch skema dengan token:', token.substring(0, 20) + '...');
        
        const res = await axios.get(
          'http://localhost:3000/api/tuk/skema',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('✅ Skema loaded:', res.data?.data?.length || 0);
        setSkemaOptions(res.data?.data || []);

      } catch (err) {
        console.error('❌ Skema Error:', err.response?.data || err.message);
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

    // VALIDASI
    if (!form.id_skema) return setMsg({ type: 'error', text: 'Pilih Skema terlebih dahulu!' });
    if (!form.nama_kegiatan) return setMsg({ type: 'error', text: 'Nama kegiatan wajib diisi!' });
    if (!form.kuota || isNaN(form.kuota)) return setMsg({ type: 'error', text: 'Kuota harus angka!' });
    if (!form.tgl_awal || !form.tgl_akhir) return setMsg({ type: 'error', text: 'Tanggal Awal & Akhir wajib!' });
    if (new Date(form.tgl_akhir) < new Date(form.tgl_awal)) return setMsg({ type: 'error', text: 'Tanggal Akhir > Tanggal Awal!' });

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('📤 Submit payload:', {
        ...form,
        id_skema: parseInt(form.id_skema),
        tahun: parseInt(form.tahun),
        kuota: parseInt(form.kuota),
        id_tuk: userData.id_tuk // Debug
      });

      const payload = {
        kode_jadwal: form.kode_jadwal || null,
        id_skema: parseInt(form.id_skema),
        nama_kegiatan: form.nama_kegiatan,
        tahun: parseInt(form.tahun),
        periode_bulan: form.periode_bulan || null,
        gelombang: form.gelombang || null,
        tgl_pra_asesmen: form.tgl_pra_asesmen || null,  // YYYY-MM-DD
        tgl_awal: form.tgl_awal || null,                 // YYYY-MM-DD  
        tgl_akhir: form.tgl_akhir || null,               // YYYY-MM-DD
        jam: form.jam || null,                           // HH:MM
        kuota: parseInt(form.kuota),
        pelaksanaan_uji: form.pelaksanaan_uji,
        url_agenda: form.url_agenda || null,
        status: form.status
      };

      const res = await axios.post(
        'http://localhost:3000/api/tuk/jadwal',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Jadwal created:', res.data);
      setMsg({ type: 'success', text: 'Jadwal berhasil dibuat!' });
      setTimeout(() => navigate('/tuk/jadwal'), 1500);

    } catch (err) {
      console.error('❌ Create jadwal error:', err.response?.data || err.message);
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Gagal membuat jadwal!'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={() => {
          localStorage.clear();
          navigate('/login');
        }}
      />

      <div className="flex-1 ml-0 lg:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Buat Jadwal Uji Kompetensi</h1>

        {msg.text && (
          <div className={`mb-4 p-3 rounded text-white ${
            msg.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* IDENTITAS */}
          <div className="font-bold border-b pb-1 text-lg">📋 Identitas Jadwal</div>

          <input name="kode_jadwal" placeholder="Kode Jadwal (opsional)" value={form.kode_jadwal} onChange={handleChange} className="p-3 border rounded w-full" />

          <select name="id_skema" value={form.id_skema} onChange={handleChange} className="p-3 border rounded w-full" disabled={skemaLoading} required>
            <option value="">{skemaLoading ? 'Loading skema...' : 'Pilih Skema'}</option>
            {skemaOptions.map(s => (
              <option key={s.id_skema} value={s.id_skema}>
                {s.judul_skema} ({s.kode_skema})
              </option>
            ))}
          </select>

          <input name="nama_kegiatan" placeholder="Nama Kegiatan *" value={form.nama_kegiatan} onChange={handleChange} className="p-3 border rounded w-full" required />

          {/* WAKTU */}
          <div className="font-bold border-b pb-1 text-lg">🕒 Waktu Pelaksanaan</div>

          <input type="number" name="tahun" value={form.tahun} onChange={handleChange} className="p-3 border rounded w-full" min="2020" max="2030" />

          <select name="periode_bulan" value={form.periode_bulan} onChange={handleChange} className="p-3 border rounded w-full">
            <option value="">Pilih Bulan</option>
            {getFilteredBulan().map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <input name="gelombang" placeholder="Gelombang (opsional)" value={form.gelombang} onChange={handleChange} className="p-3 border rounded w-full" />

          <input name="kuota" type="number" placeholder="Kuota Peserta *" value={form.kuota} onChange={handleChange} className="p-3 border rounded w-full" min="1" required />

          {/* TANGGAL - DI-BEDAIN JELAS */}
          <div className="font-bold border-b pb-1 text-lg">📅 Tanggal Pelaksanaan</div>

          {/* PRA ASESMEN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">📌 Tanggal Pra Asesmen (opsional)</label>
              <input
                type="date"
                name="tgl_pra_asesmen"
                value={form.tgl_pra_asesmen}
                onChange={handleChange}
                className="p-3 border rounded w-full"
              />
            </div>

            {/* AWAL */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">🎯 Tanggal Mulai Uji *</label>
              <input
                type="date"
                name="tgl_awal"
                min={todayString}
                value={form.tgl_awal}
                onChange={handleChange}
                className="p-3 border rounded w-full bg-orange-50"
                required
              />
            </div>
          </div>

          {/* AKHIR + JAM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">🏁 Tanggal Selesai Uji *</label>
              <input
                type="date"
                name="tgl_akhir"
                min={form.tgl_awal || todayString}
                value={form.tgl_akhir}
                onChange={handleChange}
                className="p-3 border rounded w-full bg-red-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">⏰ Jam Pelaksanaan</label>
              <input
                type="time"
                name="jam"
                value={form.jam}
                onChange={handleChange}
                className="p-3 border rounded w-full"
              />
            </div>
          </div>

          {/* TIPE & URL */}
          <div className="font-bold border-b pb-1 text-lg">⚙️ Pengaturan Lain</div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Tipe Pelaksanaan Uji</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['luring','daring','hybrid','onsite'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, pelaksanaan_uji: t })}
                  className={`p-3 border-2 rounded-lg capitalize font-semibold transition-all ${
                    form.pelaksanaan_uji === t
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                      : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <input name="url_agenda" placeholder="URL Google Agenda / Zoom (opsional)" value={form.url_agenda} onChange={handleChange} className="p-3 border rounded w-full" />

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || skemaLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? '💾 Menyimpan Jadwal...' : '✅ Simpan Jadwal Baru'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuatJadwal;