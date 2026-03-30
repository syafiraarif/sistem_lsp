import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  User, MapPin, Edit2, Save, X, Shield, 
  GraduationCap, Loader2, Hash, Calendar, Camera
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

  const inputClass = "w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[13px] text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium";
  const labelClass = "block text-[12px] font-bold text-[#071E3D] mb-1.5";

  const DetailText = ({ label, value, icon: Icon }) => (
    <div className="mb-4">
      <p className="text-[11px] font-bold text-[#182D4A]/60 uppercase tracking-widest mb-1 flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-[#CC6B27]"/>} {label}
      </p>
      <p className="text-[14px] font-semibold text-[#071E3D]">{value || '-'}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#CC6B27]" size={40}/>
        <p className="text-[#182D4A] mt-3 font-medium text-[14px]">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6 relative">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Profil Administrator</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola informasi akun, data diri, dan lisensi Anda.</p>
        </div>
        <button 
          className="px-5 py-2.5 rounded-lg font-bold bg-[#071E3D] text-white hover:bg-[#182D4A] shadow-md transition-all flex items-center gap-2 text-[13px]" 
          onClick={handleEditClick}
        >
          <Edit2 size={16}/> Edit Profil
        </button>
      </div>

      {/* VIEW MODE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-[#071E3D] to-[#182D4A] relative"></div>
            
            {/* AREA FOTO PROFIL */}
            <div className="flex justify-center -mt-14 relative z-10">
              <div className="w-28 h-28 bg-[#CC6B27] rounded-full border-[5px] border-white shadow-md flex items-center justify-center text-white font-bold text-[40px] overflow-hidden">
                {profile.foto ? (
                  <img src={`${API_URL}/uploads/${profile.foto}`} alt="Profil" className="w-full h-full object-cover"/>
                ) : (
                  profile.nama_lengkap ? profile.nama_lengkap.charAt(0).toUpperCase() : <User size={48}/>
                )}
              </div>
            </div>

            <div className="text-center px-6 pt-4 pb-6 border-b border-[#071E3D]/10">
              <h2 className="text-[20px] font-extrabold text-[#071E3D] leading-tight mb-1">
                {profile.nama_lengkap || userAccount.username}
              </h2>
              <span className="inline-block px-3.5 py-1 bg-[#071E3D]/10 text-[#071E3D] border border-[#071E3D]/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
                {userAccount.role}
              </span>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              {/* BAGIAN EMAIL SUDAH DIHAPUS */}
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

        {/* KOLOM KANAN */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm p-6">
            <h3 className="text-[16px] font-bold text-[#CC6B27] mb-5 border-b border-[#CC6B27]/20 pb-2 flex items-center gap-2">
              <User size={18}/> Informasi Identitas Pribadi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <DetailText icon={User} label="Nama Lengkap" value={profile.nama_lengkap} />
              <DetailText icon={Hash} label="NIK" value={profile.nik} />
              <DetailText icon={MapPin} label="Tempat Lahir" value={profile.tempat_lahir} />
              <DetailText icon={Calendar} label="Tanggal Lahir" value={profile.tanggal_lahir} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm p-6">
            <h3 className="text-[16px] font-bold text-[#CC6B27] mb-5 border-b border-[#CC6B27]/20 pb-2 flex items-center gap-2">
              <MapPin size={18}/> Detail Domisili
            </h3>
            <div className="mb-4">
              <p className="text-[11px] font-bold text-[#182D4A]/60 uppercase tracking-widest mb-1">Alamat Lengkap</p>
              <p className="text-[14px] font-semibold text-[#071E3D] bg-[#FAFAFA] p-3 rounded-lg border border-[#071E3D]/5">
                {profile.alamat || '-'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <DetailText label="Provinsi" value={profile.provinsi} />
              <DetailText label="Kota / Kabupaten" value={profile.kota} />
              <DetailText label="Kecamatan" value={profile.kecamatan} />
              <DetailText label="Kelurahan / Desa" value={profile.kelurahan} />
              <div className="flex gap-6">
                <DetailText label="RT" value={profile.rt} />
                <DetailText label="RW" value={profile.rw} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm p-6">
            <h3 className="text-[16px] font-bold text-[#CC6B27] mb-5 border-b border-[#CC6B27]/20 pb-2 flex items-center gap-2">
              <GraduationCap size={18}/> Pendidikan & Lisensi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <DetailText label="Pendidikan Terakhir" value={profile.pendidikan_terakhir} />
              <DetailText label="Nomor Lisensi" value={profile.no_lisensi} />
              <DetailText label="Masa Berlaku Lisensi" value={profile.masa_berlaku} />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT PROFIL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2">
                <Edit2 size={20} className="text-[#CC6B27]"/> Form Perbarui Profil
              </h3>
              <button onClick={handleCancelEdit} className="w-8 h-8 rounded-full bg-white border border-[#071E3D]/20 flex justify-center items-center text-[#182D4A] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
                <X size={18}/>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
                
                {/* SECTION FOTO PROFIL */}
                <div className="bg-[#FAFAFA] p-5 rounded-xl border border-[#071E3D]/10 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full border-4 border-[#CC6B27] overflow-hidden flex justify-center items-center bg-gray-200 shadow-sm shrink-0">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover"/>
                    ) : (
                      <Camera size={30} className="text-gray-400"/>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>Unggah Foto Profil Baru</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFotoChange} 
                      className="w-full text-[13px] text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[12px] file:font-semibold file:bg-[#CC6B27]/10 file:text-[#CC6B27] hover:file:bg-[#CC6B27]/20 cursor-pointer"
                    />
                    <p className="text-[11px] text-gray-400 mt-2">Format: JPG, PNG (Max 2MB). Biarkan kosong jika tidak ingin mengubah foto.</p>
                  </div>
                </div>

                {/* IDENTITAS */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 border-b border-[#CC6B27]/20 pb-2 flex items-center gap-2">
                    <User size={16}/> Data Identitas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                </div>

                {/* ALAMAT */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 border-b border-[#CC6B27]/20 pb-2 flex items-center gap-2">
                    <MapPin size={16}/> Alamat Domisili
                  </h4>
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className={labelClass}>Alamat Lengkap</label>
                      <textarea name="alamat" value={formData.alamat || ''} onChange={handleChange} rows="2" className={`${inputClass} resize-none`}></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Provinsi</label>
                        <select name="provinsi" onChange={handleProvinsiChange} value={selectedWilayahId.provinsi} className={inputClass}>
                          <option value="">-- Pilih Provinsi Baru --</option>
                          {provinsiList.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                        {formData.provinsi && !selectedWilayahId.provinsi && <span className="text-[11px] text-gray-500 mt-1 block">Saat ini: {formData.provinsi}</span>}
                      </div>
                      <div>
                        <label className={labelClass}>Kota / Kabupaten</label>
                        <select name="kota" onChange={handleKotaChange} value={selectedWilayahId.kota} disabled={!selectedWilayahId.provinsi} className={inputClass}>
                          <option value="">-- Pilih Kota --</option>
                          {kotaList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                        {formData.kota && !selectedWilayahId.kota && <span className="text-[11px] text-gray-500 mt-1 block">Saat ini: {formData.kota}</span>}
                      </div>
                      <div>
                        <label className={labelClass}>Kecamatan</label>
                        <select name="kecamatan" onChange={handleKecamatanChange} value={selectedWilayahId.kecamatan} disabled={!selectedWilayahId.kota} className={inputClass}>
                          <option value="">-- Pilih Kecamatan --</option>
                          {kecamatanList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                        {formData.kecamatan && !selectedWilayahId.kecamatan && <span className="text-[11px] text-gray-500 mt-1 block">Saat ini: {formData.kecamatan}</span>}
                      </div>
                      <div>
                        <label className={labelClass}>Kelurahan / Desa</label>
                        <select name="kelurahan" onChange={handleKelurahanChange} disabled={!selectedWilayahId.kecamatan} className={inputClass}>
                          <option value="">-- Pilih Kelurahan --</option>
                          {kelurahanList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
                        </select>
                        {formData.kelurahan && !kelurahanList.length && <span className="text-[11px] text-gray-500 mt-1 block">Saat ini: {formData.kelurahan}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5 w-full md:w-1/2">
                      <div><label className={labelClass}>RT</label><input type="text" name="rt" value={formData.rt || ''} onChange={handleChange} className={inputClass}/></div>
                      <div><label className={labelClass}>RW</label><input type="text" name="rw" value={formData.rw || ''} onChange={handleChange} className={inputClass}/></div>
                    </div>
                  </div>
                </div>

                {/* PENDIDIKAN & LISENSI */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 border-b border-[#CC6B27]/20 pb-2 flex items-center gap-2">
                    <GraduationCap size={16}/> Pendidikan & Lisensi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] hover:bg-[#E2E8F0] transition-colors text-[13px]">Batal</button>
              <button type="submit" form="edit-profile-form" className="px-6 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-md transition-all flex items-center gap-2 text-[13px]">
                <Save size={16}/> Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileAdmin;