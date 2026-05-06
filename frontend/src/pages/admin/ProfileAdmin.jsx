import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  User, MapPin, Edit2, Save, X, Shield, 
  GraduationCap, Loader2, Hash, Calendar, Camera,
  Sparkles, BadgeCheck, IdCard, Home, Award
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

  // --- FETCH WILAYAH ---
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

  // --- PHOTO HANDLER ---
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file)); 
    }
  };

  const handleEditClick = () => {
    setFormData({ ...profile });
    setFotoFile(null);
    setFotoPreview(profile.foto ? `${API_URL}/uploads/${profile.foto}` : null); 
    setIsEditing(true);
    setSelectedWilayahId({ provinsi: '', kota: '', kecamatan: '' });
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

  const inputClass = "w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60";
  const labelClass = "mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400";

  const DetailText = ({ label, value, icon: Icon }) => (
    <div className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {Icon && <Icon size={12} className="text-orange-500"/>} {label}
      </p>
      <p className="text-sm font-black text-[#071E3D]">{value || '-'}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-orange-500" size={42}/>
        <p className="mt-4 text-sm font-black uppercase tracking-widest text-[#071E3D]">
          Memuat Profil
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Shield size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Profil Administrator
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Profil
                <br />
                <span className="text-orange-500">Administrator</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Kelola informasi akun, data diri, domisili, pendidikan, dan lisensi administrator.
              </p>

              <button
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                onClick={handleEditClick}
              >
                <Edit2 size={16}/>
                Edit Profil
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-5 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-orange-500 text-5xl font-black text-white shadow-2xl">
                  {profile.foto ? (
                    <img src={`${API_URL}/uploads/${profile.foto}`} alt="Profil" className="h-full w-full object-cover"/>
                  ) : (
                    profile.nama_lengkap ? profile.nama_lengkap.charAt(0).toUpperCase() : <User size={56}/>
                  )}
                </div>

                <h2 className="text-2xl font-black leading-tight">
                  {profile.nama_lengkap || userAccount.username}
                </h2>

                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/80">
                  <BadgeCheck size={13} className="text-orange-400" />
                  {userAccount.role}
                </span>

                <div className="mt-6 grid w-full grid-cols-2 gap-3">
                  <HeroPill label="NIP Admin" value={profile.nip_admin || '-'} />
                  <HeroPill label="NIK" value={profile.nik || '-'} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* LEFT PROFILE CARD */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
              <div className="relative h-32 bg-[#071E3D]">
                <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
              </div>

              <div className="-mt-16 flex justify-center">
                <div className="relative z-10 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-orange-500 text-5xl font-black text-white shadow-xl">
                  {profile.foto ? (
                    <img src={`${API_URL}/uploads/${profile.foto}`} alt="Profil" className="h-full w-full object-cover"/>
                  ) : (
                    profile.nama_lengkap ? profile.nama_lengkap.charAt(0).toUpperCase() : <User size={54}/>
                  )}
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 text-center">
                <h2 className="text-2xl font-black text-[#071E3D]">
                  {profile.nama_lengkap || userAccount.username}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  {userAccount.username}
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                  <Shield size={13} />
                  {userAccount.role}
                </div>
              </div>

              <div className="border-t border-slate-100 p-6">
                <div className="flex items-center gap-4 rounded-[24px] bg-slate-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <IdCard size={21}/>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      NIP Administrator
                    </p>
                    <p className="mt-1 text-sm font-black text-[#071E3D]">
                      {profile.nip_admin || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT DATA */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            
            <InfoCard icon={<User size={18}/>} title="Informasi Identitas Pribadi">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailText icon={User} label="Nama Lengkap" value={profile.nama_lengkap} />
                <DetailText icon={Hash} label="NIK" value={profile.nik} />
                <DetailText icon={MapPin} label="Tempat Lahir" value={profile.tempat_lahir} />
                <DetailText icon={Calendar} label="Tanggal Lahir" value={profile.tanggal_lahir} />
              </div>
            </InfoCard>

            <InfoCard icon={<Home size={18}/>} title="Detail Domisili">
              <div className="mb-4 rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Alamat Lengkap
                </p>
                <p className="text-sm font-black leading-relaxed text-[#071E3D]">
                  {profile.alamat || '-'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailText label="Provinsi" value={profile.provinsi} />
                <DetailText label="Kota / Kabupaten" value={profile.kota} />
                <DetailText label="Kecamatan" value={profile.kecamatan} />
                <DetailText label="Kelurahan / Desa" value={profile.kelurahan} />
                <DetailText label="RT" value={profile.rt} />
                <DetailText label="RW" value={profile.rw} />
              </div>
            </InfoCard>

            <InfoCard icon={<GraduationCap size={18}/>} title="Pendidikan & Lisensi">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailText icon={GraduationCap} label="Pendidikan Terakhir" value={profile.pendidikan_terakhir} />
                <DetailText icon={Award} label="Nomor Lisensi" value={profile.no_lisensi} />
                <DetailText icon={Calendar} label="Masa Berlaku Lisensi" value={profile.masa_berlaku} />
              </div>
            </InfoCard>
          </div>
        </div>
      </div>

      {/* MODAL EDIT PROFIL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  <Edit2 size={20} className="text-orange-500"/>
                  Form Perbarui Profil
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Perbarui foto, identitas, alamat, pendidikan, dan lisensi.
                </p>
              </div>

              <button
                onClick={handleCancelEdit}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X size={20}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
                
                {/* SECTION FOTO PROFIL */}
                <div className="flex flex-col gap-5 rounded-[28px] border border-slate-100 bg-slate-50/70 p-5 md:flex-row md:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-orange-500 bg-white shadow-sm">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" className="h-full w-full object-cover"/>
                    ) : (
                      <Camera size={34} className="text-slate-300"/>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className={labelClass}>Unggah Foto Profil Baru</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFotoChange} 
                      className="w-full rounded-2xl border border-slate-100 bg-white p-2 text-sm font-semibold text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-orange-500 hover:file:bg-orange-100"
                    />
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      Format: JPG, PNG (Max 2MB). Biarkan kosong jika tidak ingin mengubah foto.
                    </p>
                  </div>
                </div>

                {/* IDENTITAS */}
                <FormSection icon={<User size={17}/>} title="Data Identitas">
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
                <FormSection icon={<MapPin size={17}/>} title="Alamat Domisili">
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className={labelClass}>Alamat Lengkap</label>
                      <textarea name="alamat" value={formData.alamat || ''} onChange={handleChange} rows="3" className={`${inputClass} resize-none`}></textarea>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Provinsi</label>
                        <select name="provinsi" onChange={handleProvinsiChange} value={selectedWilayahId.provinsi} className={inputClass}>
                          <option value="">-- Pilih Provinsi Baru --</option>
                          {provinsiList.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                        {formData.provinsi && !selectedWilayahId.provinsi && <span className="mt-2 block text-xs font-bold text-slate-400">Saat ini: {formData.provinsi}</span>}
                      </div>

                      <div>
                        <label className={labelClass}>Kota / Kabupaten</label>
                        <select name="kota" onChange={handleKotaChange} value={selectedWilayahId.kota} disabled={!selectedWilayahId.provinsi} className={inputClass}>
                          <option value="">-- Pilih Kota --</option>
                          {kotaList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                        {formData.kota && !selectedWilayahId.kota && <span className="mt-2 block text-xs font-bold text-slate-400">Saat ini: {formData.kota}</span>}
                      </div>

                      <div>
                        <label className={labelClass}>Kecamatan</label>
                        <select name="kecamatan" onChange={handleKecamatanChange} value={selectedWilayahId.kecamatan} disabled={!selectedWilayahId.kota} className={inputClass}>
                          <option value="">-- Pilih Kecamatan --</option>
                          {kecamatanList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                        {formData.kecamatan && !selectedWilayahId.kecamatan && <span className="mt-2 block text-xs font-bold text-slate-400">Saat ini: {formData.kecamatan}</span>}
                      </div>

                      <div>
                        <label className={labelClass}>Kelurahan / Desa</label>
                        <select name="kelurahan" onChange={handleKelurahanChange} disabled={!selectedWilayahId.kecamatan} className={inputClass}>
                          <option value="">-- Pilih Kelurahan --</option>
                          {kelurahanList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                        {formData.kelurahan && !kelurahanList.length && <span className="mt-2 block text-xs font-bold text-slate-400">Saat ini: {formData.kelurahan}</span>}
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
                <FormSection icon={<GraduationCap size={17}/>} title="Pendidikan & Lisensi">
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

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 p-6">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
              >
                Batal
              </button>

              <button
                type="submit"
                form="edit-profile-form"
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
              >
                <Save size={16}/>
                Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-black text-white">{value}</p>
    </div>
  );
}

function InfoCard({ icon, title, children }) {
  return (
    <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-black text-[#071E3D]">
        <span className="text-orange-500">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function FormSection({ icon, title, children }) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-5">
      <h4 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-black text-[#071E3D]">
        <span className="text-orange-500">{icon}</span>
        {title}
      </h4>
      {children}
    </section>
  );
}

export default ProfileAdmin;