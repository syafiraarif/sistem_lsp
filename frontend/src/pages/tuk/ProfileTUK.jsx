// frontend/src/pages/tuk/ProfileTUK.jsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Save } from 'lucide-react';
import SidebarTUK from '../../components/sidebar/SidebarTuk'; // Pastikan path import sesuai

const ProfileTUK = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State untuk Sidebar
  
  const [formData, setFormData] = useState({
    kode_tuk: '', nama_tuk: '', jenis_tuk: 'mandiri', penanggung_jawab: '',
    alamat: '', provinsi: '', kota: '', kecamatan: '', kelurahan: '', rt: '', rw: '', kode_pos: '',
    telepon: '', email_tuk: '', institusi_induk: '',
    no_lisensi: '', masa_berlaku: '', status_tuk: 'aktif', foto: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/tuk/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.status) setFormData(result.data);
      } catch (err) {
        toast.error("Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tuk/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      toast.success(result.message);
    } catch (err) {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <SidebarTUK 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area with Left Margin to avoid sidebar overlap */}
      <div className="flex-1 lg:ml-20 transition-all duration-300 lg:pl-6">
        
        {/* Container Utama Tanpa Card (Dihapus: bg-white, rounded-xl, shadow-sm, border) */}
        <div className="p-6 max-w-4xl mx-auto mt-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-[#071E3D]">Profile TUK</h1>
            <button 
              onClick={handleSubmit} 
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identitas */}
            <div className="md:col-span-2 font-semibold text-gray-700 border-b mb-2 pb-1">Identitas</div>
            <input type="text" name="kode_tuk" value={formData.kode_tuk} onChange={handleChange} placeholder="Kode TUK" className="p-2 border rounded-lg bg-gray-100" disabled />
            <input type="text" name="nama_tuk" value={formData.nama_tuk} onChange={handleChange} placeholder="Nama TUK" className="p-2 border rounded-lg" />
            <select name="jenis_tuk" value={formData.jenis_tuk} onChange={handleChange} className="p-2 border rounded-lg">
              <option value="mandiri">Mandiri</option>
              <option value="sewaktu">Sewaktu</option>
              <option value="tempat_kerja">Tempat Kerja</option>
            </select>
            <input type="text" name="penanggung_jawab" value={formData.penanggung_jawab} onChange={handleChange} placeholder="Penanggung Jawab" className="p-2 border rounded-lg" />
            <input type="text" name="institusi_induk" value={formData.institusi_induk} onChange={handleChange} placeholder="Institusi Induk" className="p-2 border rounded-lg" />
            <input type="text" name="status_tuk" value={formData.status_tuk} className="p-2 border rounded-lg bg-gray-100" disabled />

            {/* Alamat */}
            <div className="md:col-span-2 font-semibold text-gray-700 border-b mb-2 pb-1 mt-2">Alamat</div>
            <textarea name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Alamat" className="md:col-span-2 p-2 border rounded-lg" rows={2}></textarea>
            <input type="text" name="provinsi" value={formData.provinsi} onChange={handleChange} placeholder="Provinsi" className="p-2 border rounded-lg" />
            <input type="text" name="kota" value={formData.kota} onChange={handleChange} placeholder="Kota" className="p-2 border rounded-lg" />
            <input type="text" name="kecamatan" value={formData.kecamatan} onChange={handleChange} placeholder="Kecamatan" className="p-2 border rounded-lg" />
            <input type="text" name="kelurahan" value={formData.kelurahan} onChange={handleChange} placeholder="Kelurahan" className="p-2 border rounded-lg" />
            <div className="flex gap-2">
              <input type="text" name="rt" value={formData.rt} onChange={handleChange} placeholder="RT" className="p-2 border rounded-lg w-1/2" />
              <input type="text" name="rw" value={formData.rw} onChange={handleChange} placeholder="RW" className="p-2 border rounded-lg w-1/2" />
            </div>
            <input type="text" name="kode_pos" value={formData.kode_pos} onChange={handleChange} placeholder="Kode Pos" className="p-2 border rounded-lg" />

            {/* Kontak & Legalitas */}
            <div className="md:col-span-2 font-semibold text-gray-700 border-b mb-2 pb-1 mt-2">Kontak & Legalitas</div>
            <input type="text" name="telepon" value={formData.telepon} onChange={handleChange} placeholder="Telepon" className="p-2 border rounded-lg" />
            <input type="email" name="email_tuk" value={formData.email_tuk} onChange={handleChange} placeholder="Email TUK" className="p-2 border rounded-lg" />
            <input type="text" name="no_lisensi" value={formData.no_lisensi} onChange={handleChange} placeholder="No. Lisensi" className="p-2 border rounded-lg" />
            <input type="date" name="masa_berlaku" value={formData.masa_berlaku?.split('T')[0]} onChange={handleChange} className="p-2 border rounded-lg" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileTUK;