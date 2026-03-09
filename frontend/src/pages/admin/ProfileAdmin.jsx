import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  User, Mail, MapPin, Edit2, Save, X, Shield, 
  GraduationCap, Loader2, Briefcase, FileText
} from 'lucide-react';

const ProfileAdmin = () => {
  // --- STATE DATA ---
  const [profile, setProfile] = useState({
    nip_admin: '', nik: '', nama_lengkap: '', 
    tempat_lahir: '', tanggal_lahir: '',
    alamat: '', provinsi: '', kota: '', kecamatan: '', kelurahan: '', rt: '', rw: '',
    pendidikan_terakhir: '', no_lisensi: '', masa_berlaku: '', foto: ''
  });
  
  const [userAccount, setUserAccount] = useState({
    username: '', email: '', role: 'Administrator'
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // --- STATE WILAYAH ---
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);
  
  const [selectedWilayahId, setSelectedWilayahId] = useState({
    provinsi: '', kota: '', kecamatan: ''
  });

  // --- FETCH DATA ---
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/profile');
      if (response.data.success) {
        const data = response.data.data || {};
        setProfile({
          nip_admin: data.nip_admin || '',
          nik: data.nik || '',
          nama_lengkap: data.nama_lengkap || '',
          tempat_lahir: data.tempat_lahir || '',
          tanggal_lahir: data.tanggal_lahir ? data.tanggal_lahir.split('T')[0] : '',
          alamat: data.alamat || '',
          provinsi: data.provinsi || '',
          kota: data.kota || '',
          kecamatan: data.kecamatan || '',
          kelurahan: data.kelurahan || '',
          rt: data.rt || '',
          rw: data.rw || '',
          pendidikan_terakhir: data.pendidikan_terakhir || '',
          no_lisensi: data.no_lisensi || '',
          masa_berlaku: data.masa_berlaku ? data.masa_berlaku.split('T')[0] : '',
          foto: data.foto || ''
        });
      }

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUserAccount({
        username: storedUser.username || 'Admin',
        email: storedUser.email || '-',
        role: storedUser.role || 'Administrator'
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- FETCH WILAYAH (Saat Mode Edit) ---
  useEffect(() => {
    if (isEditing) {
      api.get('/public/provinsi')
        .then(res => setProvinsiList(res.data || []))
        .catch(err => console.error("Gagal load provinsi", err));
    }
  }, [isEditing]);

  const fetchKota = async (provId) => {
    try { const res = await api.get(`/public/kota/${provId}`); setKotaList(res.data || []); } 
    catch (err) { console.error(err); }
  };

  const fetchKecamatan = async (kotaId) => {
    try { const res = await api.get(`/public/kecamatan/${kotaId}`); setKecamatanList(res.data || []); } 
    catch (err) { console.error(err); }
  };

  const fetchKelurahan = async (kecId) => {
    try { const res = await api.get(`/public/kelurahan/${kecId}`); setKelurahanList(res.data || []); } 
    catch (err) { console.error(err); }
  };

  // --- HANDLERS WILAYAH ---
  const handleProvinsiChange = (e) => {
    const id = e.target.value;
    const name = provinsiList.find(p => p.id === id)?.name || '';
    setProfile(prev => ({ ...prev, provinsi: name, kota: '', kecamatan: '', kelurahan: '' }));
    setSelectedWilayahId(prev => ({ ...prev, provinsi: id, kota: '', kecamatan: '' }));
    setKotaList([]); setKecamatanList([]); setKelurahanList([]);
    if (id) fetchKota(id);
  };

  const handleKotaChange = (e) => {
    const id = e.target.value;
    const name = kotaList.find(k => k.id === id)?.name || '';
    setProfile(prev => ({ ...prev, kota: name, kecamatan: '', kelurahan: '' }));
    setSelectedWilayahId(prev => ({ ...prev, kota: id, kecamatan: '' }));
    setKecamatanList([]); setKelurahanList([]);
    if (id) fetchKecamatan(id);
  };

  const handleKecamatanChange = (e) => {
    const id = e.target.value;
    const name = kecamatanList.find(k => k.id === id)?.name || '';
    setProfile(prev => ({ ...prev, kecamatan: name, kelurahan: '' }));
    setSelectedWilayahId(prev => ({ ...prev, kecamatan: id }));
    setKelurahanList([]);
    if (id) fetchKelurahan(id);
  };

  const handleKelurahanChange = (e) => {
    const id = e.target.value;
    const name = kelurahanList.find(k => k.id === id)?.name || '';
    setProfile(prev => ({ ...prev, kelurahan: name }));
  };

  // --- GENERAL HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await api.put('/admin/profile', profile);
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.name = profile.nama_lengkap; 
      localStorage.setItem('user', JSON.stringify(storedUser));

      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Profil berhasil diperbarui', timer: 1500, showConfirmButton: false });
      setIsEditing(false);
      fetchProfile();
      // Memaksa refresh halaman agar Navbar update nama (opsional)
      setTimeout(() => window.location.reload(), 1500); 
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Gagal update profil', 'error');
    }
  };

  // Helper Class
  const inputClass = "w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[13px] text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all disabled:opacity-70 disabled:bg-gray-100 disabled:border-gray-200 font-medium";
  const labelClass = "block text-[12px] font-bold text-[#071E3D] mb-1.5";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#CC6B27]" size={40}/>
        <p className="text-[#182D4A] mt-3 font-medium text-[14px]">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* 1. HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Profil Administrator</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola informasi akun, data diri, dan lisensi Anda.</p>
        </div>
      </div>

      {/* 2. MAIN CONTENT (2 KOLOM) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: KARTU PROFIL RINGKAS */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden">
            {/* Banner Cover */}
            <div className="h-28 bg-gradient-to-r from-[#071E3D] to-[#182D4A] relative"></div>
            
            {/* Avatar Circle */}
            <div className="flex justify-center -mt-14 relative z-10">
              <div className="w-28 h-28 bg-[#CC6B27] rounded-full border-[5px] border-white shadow-md flex items-center justify-center text-white font-bold text-[40px]">
                {profile.nama_lengkap ? profile.nama_lengkap.charAt(0).toUpperCase() : <User size={48}/>}
              </div>
            </div>
            
            {/* Nama & Role */}
            <div className="text-center px-6 pt-4 pb-6 border-b border-[#071E3D]/10">
              <h2 className="text-[20px] font-extrabold text-[#071E3D] leading-tight mb-1">
                {profile.nama_lengkap || userAccount.username}
              </h2>
              <span className="inline-block px-3.5 py-1 bg-[#071E3D]/10 text-[#071E3D] border border-[#071E3D]/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
                {userAccount.role}
              </span>
            </div>
            
            {/* Info Cepat */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#CC6B27]/10 flex items-center justify-center text-[#CC6B27]">
                  <Mail size={18}/>
                </div>
                <div>
                  <p className="text-[#182D4A]/70 text-[11px] font-bold uppercase mb-0.5">Email Akun</p>
                  <p className="text-[#071E3D] font-bold text-[13.5px] truncate max-w-[200px]">{userAccount.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#CC6B27]/10 flex items-center justify-center text-[#CC6B27]">
                  <Shield size={18}/>
                </div>
                <div>
                  <p className="text-[#182D4A]/70 text-[11px] font-bold uppercase mb-0.5">NIP Administrator</p>
                  <p className="text-[#071E3D] font-bold text-[13.5px]">{profile.nip_admin || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: FORM DETAIL DATA */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden flex flex-col h-full">
            
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[16px] font-bold text-[#071E3D] flex items-center gap-2">
                <FileText size={18} className="text-[#CC6B27]"/> Detail Informasi Pribadi
              </h3>
              {!isEditing ? (
                <button 
                  className="px-4 py-2 rounded-lg font-bold bg-[#071E3D]/10 text-[#071E3D] hover:bg-[#071E3D] hover:text-white transition-all flex items-center gap-2 text-[12px]" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={14}/> Edit Profil
                </button>
              ) : (
                <button 
                  className="px-4 py-2 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] hover:bg-[#E2E8F0] transition-colors flex items-center gap-2 text-[12px]" 
                  onClick={() => { setIsEditing(false); fetchProfile(); }}
                >
                  <X size={14}/> Batal
                </button>
              )}
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-8 flex-1">
              
              {/* SECTION: DATA DIRI */}
              <div>
                <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 border-b border-[#CC6B27]/20 pb-2 flex items-center gap-2">
                  <User size={16}/> Data Identitas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Nama Lengkap</label>
                    <input type="text" name="nama_lengkap" value={profile.nama_lengkap} onChange={handleChange} disabled={!isEditing} className={inputClass}/>
                  </div>
                  <div>
                    <label className={labelClass}>NIK (Nomor Induk Kependudukan)</label>
                    <input type="text" name="nik" value={profile.nik} onChange={handleChange} disabled={!isEditing} maxLength={16} className={inputClass}/>
                  </div>
                  <div>
                    <label className={labelClass}>Tempat Lahir</label>
                    <input type="text" name="tempat_lahir" value={profile.tempat_lahir} onChange={handleChange} disabled={!isEditing} className={inputClass}/>
                  </div>
                  <div>
                    <label className={labelClass}>Tanggal Lahir</label>
                    <input type="date" name="tanggal_lahir" value={profile.tanggal_lahir} onChange={handleChange} disabled={!isEditing} className={inputClass}/>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>NIP Admin / Pegawai</label>
                    <input type="text" name="nip_admin" value={profile.nip_admin} onChange={handleChange} disabled={!isEditing} className={inputClass}/>
                  </div>
                </div>
              </div>

              {/* SECTION: ALAMAT */}
              <div>
                <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 border-b border-[#CC6B27]/20 pb-2 flex items-center gap-2">
                  <MapPin size={16}/> Alamat Domisili
                </h4>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className={labelClass}>Alamat Lengkap (Jalan/Gang/Nomor Rumah)</label>
                    <textarea name="alamat" value={profile.alamat} onChange={handleChange} disabled={!isEditing} rows="2" className={`${inputClass} resize-none`}></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Provinsi</label>
                      {isEditing ? (
                        <select name="provinsi" onChange={handleProvinsiChange} value={selectedWilayahId.provinsi} className={inputClass}>
                          <option value="">-- Pilih Provinsi --</option>
                          {provinsiList.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                      ) : (
                        <input type="text" value={profile.provinsi || '-'} disabled className={inputClass}/>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Kota / Kabupaten</label>
                      {isEditing ? (
                        <select name="kota" onChange={handleKotaChange} value={selectedWilayahId.kota} disabled={!selectedWilayahId.provinsi} className={inputClass}>
                          <option value="">-- Pilih Kota --</option>
                          {kotaList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                      ) : (
                        <input type="text" value={profile.kota || '-'} disabled className={inputClass}/>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Kecamatan</label>
                      {isEditing ? (
                        <select name="kecamatan" onChange={handleKecamatanChange} value={selectedWilayahId.kecamatan} disabled={!selectedWilayahId.kota} className={inputClass}>
                          <option value="">-- Pilih Kecamatan --</option>
                          {kecamatanList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                      ) : (
                        <input type="text" value={profile.kecamatan || '-'} disabled className={inputClass}/>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Kelurahan / Desa</label>
                      {isEditing ? (
                        <select name="kelurahan" onChange={handleKelurahanChange} value={kelurahanList.find(k => k.name === profile.kelurahan)?.id || ''} disabled={!selectedWilayahId.kecamatan} className={inputClass}>
                          <option value="">-- Pilih Kelurahan --</option>
                          {kelurahanList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                      ) : (
                        <input type="text" value={profile.kelurahan || '-'} disabled className={inputClass}/>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5 w-full md:w-1/2">
                    <div>
                      <label className={labelClass}>RT</label>
                      <input type="text" name="rt" value={profile.rt} onChange={handleChange} disabled={!isEditing} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>RW</label>
                      <input type="text" name="rw" value={profile.rw} onChange={handleChange} disabled={!isEditing} className={inputClass}/>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: PENDIDIKAN & LISENSI */}
              <div>
                <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 border-b border-[#CC6B27]/20 pb-2 flex items-center gap-2">
                  <GraduationCap size={16}/> Pendidikan & Lisensi
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Pendidikan Terakhir</label>
                    <input type="text" name="pendidikan_terakhir" value={profile.pendidikan_terakhir} onChange={handleChange} disabled={!isEditing} placeholder="Contoh: S1 Teknik Informatika" className={inputClass}/>
                  </div>
                  <div>
                    <label className={labelClass}>No. Lisensi (Jika Ada)</label>
                    <input type="text" name="no_lisensi" value={profile.no_lisensi} onChange={handleChange} disabled={!isEditing} className={inputClass}/>
                  </div>
                  <div>
                    <label className={labelClass}>Masa Berlaku Lisensi</label>
                    <input type="date" name="masa_berlaku" value={profile.masa_berlaku} onChange={handleChange} disabled={!isEditing} className={inputClass}/>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON (Tampil hanya saat mode Edit) */}
              {isEditing && (
                <div className="mt-4 pt-5 border-t border-[#071E3D]/10 flex justify-end">
                  <button type="submit" className="px-6 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]">
                    <Save size={16}/> Simpan Perubahan Profil
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileAdmin;