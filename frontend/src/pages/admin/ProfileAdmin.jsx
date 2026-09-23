import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  User, MapPin, Edit2, Save, X, Shield, 
  GraduationCap, Loader2, Hash, Calendar, Camera,
  IdCard, Home, Award, FileText
} from 'lucide-react';

const ProfileAdmin = () => {
  // --- BASE URL UNTUK FOTO ---
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // --- STATE DATA ---
  const [profile, setProfile] = useState({
    nip_admin: '', nik: '', nama_lengkap: '', 
    tempat_lahir: '', tanggal_lahir: '',
    alamat: '', provinsi: '', kota: '', kecamatan: '', kelurahan: '', rt: '', rw: '',
    pendidikan_terakhir: '', no_lisensi: '', masa_berlaku: '', foto: ''
  });
  
  const [userAccount, setUserAccount] = useState({
    username: '', role: 'Administrator'
  });

  // --- STATE FORM DATA (Untuk Modal Edit) ---
  const [formData, setFormData] = useState({});
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
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
      // Perbaikan: Ambil data secara aman, apa pun struktur response-nya
      const data = response.data?.data || response.data || {};
      
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

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUserAccount({
        username: data.user?.username || storedUser.username || 'Admin',
        role: data.user?.role || storedUser.role || 'Administrator'
      });
      
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- FETCH WILAYAH ---
  const fetchKota = async (provId) => {
    try { 
      const res = await api.get(`/public/kota/${provId}`); 
      setKotaList(Array.isArray(res.data) ? res.data : (res.data?.data || [])); 
    } catch (err) { console.error(err); }
  };
  const fetchKecamatan = async (kotaId) => {
    try { 
      const res = await api.get(`/public/kecamatan/${kotaId}`); 
      setKecamatanList(Array.isArray(res.data) ? res.data : (res.data?.data || [])); 
    } catch (err) { console.error(err); }
  };
  const fetchKelurahan = async (kecId) => {
    try { 
      const res = await api.get(`/public/kelurahan/${kecId}`); 
      setKelurahanList(Array.isArray(res.data) ? res.data : (res.data?.data || [])); 
    } catch (err) { console.error(err); }
  };

  // --- HANDLERS WILAYAH ---
  const handleProvinsiChange = (e) => {
    const id = e.target.value;
    const name = provinsiList.find(p => p.id === id)?.name || '';
    setFormData(prev => ({ ...prev, provinsi: name, kota: '', kecamatan: '', kelurahan: '' }));
    setSelectedWilayahId(prev => ({ ...prev, provinsi: id, kota: '', kecamatan: '' }));
    setKotaList([]); setKecamatanList([]); setKelurahanList([]);
    if (id) fetchKota(id);
  };
  const handleKotaChange = (e) => {
    const id = e.target.value;
    const name = kotaList.find(k => k.id === id)?.name || '';
    setFormData(prev => ({ ...prev, kota: name, kecamatan: '', kelurahan: '' }));
    setSelectedWilayahId(prev => ({ ...prev, kota: id, kecamatan: '' }));
    setKecamatanList([]); setKelurahanList([]);
    if (id) fetchKecamatan(id);
  };
  const handleKecamatanChange = (e) => {
    const id = e.target.value;
    const name = kecamatanList.find(k => k.id === id)?.name || '';
    setFormData(prev => ({ ...prev, kecamatan: name, kelurahan: '' }));
    setSelectedWilayahId(prev => ({ ...prev, kecamatan: id }));
    setKelurahanList([]);
    if (id) fetchKelurahan(id);
  };
  const handleKelurahanChange = (e) => {
    const id = e.target.value;
    const name = kelurahanList.find(k => k.id === id)?.name || '';
    setFormData(prev => ({ ...prev, kelurahan: name }));
  };

  // --- GENERAL HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file)); 
    }
  };

  // Perbaikan: Auto-Load ID Wilayah saat Edit
  const handleEditClick = async () => {
    setFormData({ ...profile });
    setFotoFile(null);
    setFotoPreview(profile.foto ? `${API_URL}/uploads/${profile.foto}` : null); 
    setIsEditing(true);

    try {
      const resProv = await api.get('/public/provinsi');
      const provs = Array.isArray(resProv.data) ? resProv.data : (resProv.data?.data || []);
      setProvinsiList(provs);

      let provId = '';
      let kotaId = '';
      let kecId = '';

      const matchedProv = provs.find(p => p.name === profile.provinsi);
      if (matchedProv) {
         provId = matchedProv.id;
         const resKota = await api.get(`/public/kota/${provId}`);
         const kotas = Array.isArray(resKota.data) ? resKota.data : (resKota.data?.data || []);
         setKotaList(kotas);
         
         const matchedKota = kotas.find(k => k.name === profile.kota);
         if (matchedKota) {
            kotaId = matchedKota.id;
            const resKec = await api.get(`/public/kecamatan/${kotaId}`);
            const kecs = Array.isArray(resKec.data) ? resKec.data : (resKec.data?.data || []);
            setKecamatanList(kecs);

            const matchedKec = kecs.find(k => k.name === profile.kecamatan);
            if (matchedKec) {
               kecId = matchedKec.id;
               const resKel = await api.get(`/public/kelurahan/${kecId}`);
               const kels = Array.isArray(resKel.data) ? resKel.data : (resKel.data?.data || []);
               setKelurahanList(kels);
            }
         }
      }

      setSelectedWilayahId({
        provinsi: provId,
        kota: kotaId,
        kecamatan: kecId
      });

    } catch (error) {
       console.error("Gagal memuat wilayah awal:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'foto' && formData[key] !== null && formData[key] !== undefined) {
          payload.append(key, formData[key]);
        }
      });
      if (fotoFile) {
        payload.append('foto', fotoFile);
      }
      await api.put('/admin/profile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.name = formData.nama_lengkap; 
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Profil berhasil diperbarui', timer: 1500, showConfirmButton: false });
      setIsEditing(false);
      fetchProfile();
      setTimeout(() => window.location.reload(), 1500); 
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Gagal update profil', 'error');
    }
  };

  // STANDARD STYLING
  const inputClass = "w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10 disabled:cursor-not-allowed disabled:opacity-60";
  const labelClass = "mb-1.5 block text-[11px] font-bold text-[#071E3D] uppercase tracking-wider";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-[#CC6B27]" size={42} />
          <p className="text-[13px] font-bold text-[#071E3D]">Memuat Profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8 flex flex-col gap-6">
      
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">
              Profil Administrator
            </h2>
            <p className="m-0 max-w-2xl text-[14px] font-medium text-[#182D4A]/70">
              Kelola informasi akun, data diri, domisili, pendidikan, dan lisensi Anda di dalam sistem.
            </p>
          </div>
          
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <button
              type="button"
              onClick={handleEditClick}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] md:flex-none"
            >
              <Edit2 size={16} />
              Edit Profil
            </button>
          </div>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[380px_1fr]">
        
        {/* PANEL KIRI: PROFILE CARD */}
        <aside className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm sticky top-6">
          <div className="h-32 bg-[#071E3D] relative overflow-hidden">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#CC6B27]/30 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-[#CC6B27]/20 blur-xl" />
          </div>
          <div className="-mt-16 flex justify-center relative z-10">
            <div className="h-28 w-28 rounded-full border-4 border-white bg-[#FAFAFA] flex items-center justify-center overflow-hidden shadow-md">
              {profile.foto ? (
                <img src={`${API_URL}/uploads/${profile.foto}`} alt="Profil" className="h-full w-full object-cover"/>
              ) : (
                <User size={46} className="text-[#182D4A]/30"/>
              )}
            </div>
          </div>
          <div className="p-6 text-center">
            <h3 className="text-[18px] font-black text-[#071E3D]">
              {profile.nama_lengkap || userAccount.username}
            </h3>
            <p className="mt-1 text-[13px] font-semibold text-[#182D4A]/60">
              {userAccount.username}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#CC6B27]/20 bg-[#CC6B27]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
              <Shield size={14} /> {userAccount.role}
            </div>
          </div>
          <div className="border-t border-[#071E3D]/10 bg-[#FAFAFA] p-5">
            <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <IdCard size={18}/>
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60 truncate">NIP Administrator</p>
                <p className="mt-0.5 text-[14px] font-bold text-[#071E3D] truncate">
                  {profile.nip_admin || '-'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* PANEL KANAN: DETAIL INFO */}
        <section className="flex flex-col gap-6 min-w-0">
          
          {/* Identitas */}
          <InfoPanel title="Informasi Identitas Pribadi" icon={<User size={18} />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem label="Nama Lengkap" value={profile.nama_lengkap} />
              <DetailItem label="NIK (KTP)" value={profile.nik} />
              <DetailItem label="Tempat Lahir" value={profile.tempat_lahir} />
              <DetailItem label="Tanggal Lahir" value={profile.tanggal_lahir ? new Date(profile.tanggal_lahir).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-'} />
            </div>
          </InfoPanel>

          {/* Domisili */}
          <InfoPanel title="Detail Domisili" icon={<Home size={18} />}>
            <div className="mb-4">
              <DetailItem label="Alamat Lengkap" value={profile.alamat} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem label="Provinsi" value={profile.provinsi} />
              <DetailItem label="Kota / Kabupaten" value={profile.kota} />
              <DetailItem label="Kecamatan" value={profile.kecamatan} />
              <DetailItem label="Kelurahan / Desa" value={profile.kelurahan} />
              <DetailItem label="RT" value={profile.rt} />
              <DetailItem label="RW" value={profile.rw} />
            </div>
          </InfoPanel>

          {/* Pendidikan & Lisensi */}
          <InfoPanel title="Pendidikan & Lisensi" icon={<GraduationCap size={18} />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem label="Pendidikan Terakhir" value={profile.pendidikan_terakhir} wide />
              <DetailItem label="Nomor Lisensi" value={profile.no_lisensi} />
              <DetailItem label="Masa Berlaku Lisensi" value={profile.masa_berlaku ? new Date(profile.masa_berlaku).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-'} />
            </div>
          </InfoPanel>
        </section>
      </div>

      {/* MODAL EDIT PROFIL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-[#CC6B27]/10 p-2 rounded-lg text-[#CC6B27]">
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Form Perbarui Profil</h3>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-red-50 hover:text-red-500"
                onClick={handleCancelEdit}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
              <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* SECTION FOTO PROFIL */}
                <FormSection title="Foto Profil" icon={<Camera size={16} />}>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="h-24 w-24 shrink-0 rounded-full border border-[#071E3D]/10 bg-[#FAFAFA] flex items-center justify-center overflow-hidden shadow-sm">
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Preview" className="h-full w-full object-cover"/>
                      ) : (
                        <Camera size={30} className="text-[#182D4A]/30"/>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Unggah Foto Baru</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFotoChange} 
                        className="block w-full text-xs font-semibold text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#CC6B27]/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#CC6B27] hover:file:bg-[#CC6B27] hover:file:text-white transition-all cursor-pointer border border-[#071E3D]/10 rounded-lg p-2 bg-white"
                      />
                      <p className="mt-2 text-[10px] font-medium text-slate-400">
                        Format: JPG, PNG (Max 2MB). Biarkan kosong jika tidak ingin mengubah foto.
                      </p>
                    </div>
                  </div>
                </FormSection>

                {/* IDENTITAS */}
                <FormSection title="Data Identitas Pribadi" icon={<User size={16} />}>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className={labelClass}>Nama Lengkap</label>
                      <input type="text" name="nama_lengkap" value={formData.nama_lengkap || ''} onChange={handleChange} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>NIK (Nomor Induk Kependudukan)</label>
                      <input type="text" name="nik" value={formData.nik || ''} onChange={handleChange} maxLength={16} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>NIP Admin / Pegawai</label>
                      <input type="text" name="nip_admin" value={formData.nip_admin || ''} onChange={handleChange} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>Tempat Lahir</label>
                      <input type="text" name="tempat_lahir" value={formData.tempat_lahir || ''} onChange={handleChange} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>Tanggal Lahir</label>
                      <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir || ''} onChange={handleChange} className={inputClass}/>
                    </div>
                  </div>
                </FormSection>

                {/* ALAMAT */}
                <FormSection title="Alamat Domisili" icon={<MapPin size={16} />}>
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className={labelClass}>Alamat Lengkap</label>
                      <textarea name="alamat" value={formData.alamat || ''} onChange={handleChange} rows="3" className={`${inputClass} resize-none`}></textarea>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Provinsi</label>
                        <select name="provinsi" onChange={handleProvinsiChange} value={selectedWilayahId.provinsi} className={inputClass}>
                          <option value="">-- Pilih Provinsi --</option>
                          {provinsiList.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Kota / Kabupaten</label>
                        <select name="kota" onChange={handleKotaChange} value={selectedWilayahId.kota} disabled={!selectedWilayahId.provinsi} className={inputClass}>
                          <option value="">-- Pilih Kota --</option>
                          {kotaList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Kecamatan</label>
                        <select name="kecamatan" onChange={handleKecamatanChange} value={selectedWilayahId.kecamatan} disabled={!selectedWilayahId.kota} className={inputClass}>
                          <option value="">-- Pilih Kecamatan --</option>
                          {kecamatanList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Kelurahan / Desa</label>
                        <select name="kelurahan" onChange={handleKelurahanChange} value={formData.kelurahan && kelurahanList.find(k => k.name === formData.kelurahan)?.id || ''} disabled={!selectedWilayahId.kecamatan} className={inputClass}>
                          <option value="">-- Pilih Kelurahan --</option>
                          {kelurahanList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5 md:w-1/2">
                      <div>
                        <label className={labelClass}>RT</label>
                        <input type="text" name="rt" value={formData.rt || ''} onChange={handleChange} className={inputClass}/>
                      </div>
                      <div>
                        <label className={labelClass}>RW</label>
                        <input type="text" name="rw" value={formData.rw || ''} onChange={handleChange} className={inputClass}/>
                      </div>
                    </div>
                  </div>
                </FormSection>

                {/* PENDIDIKAN & LISENSI */}
                <FormSection title="Pendidikan & Lisensi" icon={<GraduationCap size={16} />}>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className={labelClass}>Pendidikan Terakhir</label>
                      <input type="text" name="pendidikan_terakhir" value={formData.pendidikan_terakhir || ''} onChange={handleChange} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>No. Lisensi</label>
                      <input type="text" name="no_lisensi" value={formData.no_lisensi || ''} onChange={handleChange} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>Masa Berlaku Lisensi</label>
                      <input type="date" name="masa_berlaku" value={formData.masa_berlaku || ''} onChange={handleChange} className={inputClass}/>
                    </div>
                  </div>
                </FormSection>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="pt-5 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] text-[13px] font-bold transition-all"
                onClick={handleCancelEdit}
              >
                Batal
              </button>
              <button
                type="submit"
                form="edit-profile-form"
                className="px-5 py-2.5 rounded-lg bg-[#CC6B27] text-white hover:bg-[#a8561f] font-bold flex items-center gap-2 text-[13px] transition-all"
              >
                <Save size={16} />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCROLLBAR CUSTOM */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
      ` }} />
    </div>
  );
};

// --- SUB COMPONENTS ---

function InfoPanel({ title, icon, children }) {
  return (
    <div className="rounded-xl border border-[#071E3D]/10 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] p-5 flex items-center gap-3">
        <div className="text-[#CC6B27]">{icon}</div>
        <h4 className="text-[14px] font-bold text-[#071E3D] m-0">{title}</h4>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function FormSection({ title, icon, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] p-4 flex items-center gap-3">
        <div className="text-[#CC6B27]">{icon}</div>
        <h4 className="text-[14px] font-bold text-[#071E3D] m-0">{title}</h4>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DetailItem({ label, value, wide }) {
  return (
    <div className={`rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-4 flex flex-col justify-center ${wide ? "md:col-span-2" : ""}`}>
      <p className="text-[10px] font-bold text-[#182D4A]/60 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-[13.5px] font-bold text-[#071E3D]">{value || '-'}</p>
    </div>
  );
}

export default ProfileAdmin;