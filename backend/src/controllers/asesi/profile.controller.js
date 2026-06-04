const ProfileAsesi =
require("../../models/profileAsesi.model");

const response =
require("../../utils/response.util");

const fs =
require("fs");

const path =
require("path");


/* =====================================
GET PROFILE
===================================== */

exports.getProfile =
async(req,res)=>{

try{

const profile =
await ProfileAsesi.findByPk(
req.user.id_user
);

if(!profile){

return response.error(
res,
"Profil asesi tidak ditemukan",
404
);

}

return response.success(
res,
"Profil asesi",
profile
);

}

catch(err){

console.error(
"GET PROFILE ERROR:",
err
);

return response.error(
res,
err.message
);

}

};



/* =====================================
UPDATE PROFILE
===================================== */

exports.updateProfile =
async(req,res)=>{

try{

const profile =
await ProfileAsesi.findByPk(
req.user.id_user
);

if(!profile){

return response.error(
res,
"Profil tidak ditemukan",
404
);

}

/*
FIELD YANG BOLEH DIUPDATE
*/

const allowedFields=[

"nik",
"nama_lengkap",
"jenis_kelamin",
"tempat_lahir",
"tanggal_lahir",
"kebangsaan",
"alamat",
"rt",
"rw",
"provinsi",
"kota",
"kecamatan",
"kelurahan",
"kode_pos",

"pendidikan_terakhir",
"universitas",
"jurusan",
"tahun_lulus",

"pekerjaan",
"jabatan",

"nama_perusahaan",
"alamat_perusahaan",
"telp_perusahaan",
"fax_perusahaan",
"email_perusahaan"

];

const updateData={};

allowedFields.forEach(field=>{

if(req.body[field]!==undefined){

updateData[field]=
req.body[field];

}

});

if(
Object.keys(updateData)
.length===0
){

return response.error(

res,

"Tidak ada data yang diubah",

400

);

}

await profile.update(
updateData
);

return response.success(

res,

"Profil berhasil diperbarui",

profile

);

}

catch(err){

console.error(
"UPDATE PROFILE ERROR:",
err
);

return response.error(
res,
err.message
);

}

};



/* =====================================
UPLOAD FOTO PROFIL
===================================== */

exports.uploadDokumen =
async(req,res)=>{

try{

const profile =
await ProfileAsesi.findByPk(
req.user.id_user
);

if(!profile){

return response.error(

res,

"Profil tidak ditemukan",

404

);

}

const file =
req.files?.foto_profil?.[0];

if(!file){

return response.error(

res,

"Foto profil wajib diupload",

400

);

}

const baseDir=
path.join(

process.cwd(),

"uploads",

"asesi",

"dokumen",

"foto_profil"

);

fs.mkdirSync(
baseDir,
{
recursive:true
}
);

/*
hapus lama
*/

if(profile.foto_profil){

const oldPath=
path.join(

process.cwd(),

profile.foto_profil

);

if(
fs.existsSync(oldPath)
){

fs.unlinkSync(
oldPath
);

}

}

const filename=

`foto_profil_${req.user.id_user}${path.extname(file.originalname)}`;

const destination=

path.join(
baseDir,
filename
);

fs.renameSync(
file.path,
destination
);

const relativePath=

path.join(

"uploads",
"asesi",
"dokumen",
"foto_profil",
filename

).replace(/\\/g,"/");

await profile.update({

foto_profil:
relativePath

});

return response.success(

res,

"Foto profil berhasil diperbarui",

{

foto_profil:
relativePath

}

);

}

catch(err){

console.error(
"UPLOAD FOTO ERROR:",
err
);

return response.error(
res,
err.message
);

}

};



/* =====================================
UPLOAD TTD
===================================== */

exports.uploadTTD =
async(req,res)=>{

try{

const {
ttd_base64
}=req.body;

if(
!ttd_base64
){

return response.error(

res,

"Tanda tangan tidak ditemukan",

400

);

}

const profile=
await ProfileAsesi.findByPk(
req.user.id_user
);

if(!profile){

return response.error(

res,

"Profil tidak ditemukan",

404

);

}

if(profile.ttd_path){

const oldPath=
path.join(
process.cwd(),
profile.ttd_path
);

if(
fs.existsSync(oldPath)
){

fs.unlinkSync(
oldPath
);

}

}

const uploadDir=
path.join(

process.cwd(),

"uploads",
"asesi",
"ttd"

);

fs.mkdirSync(
uploadDir,
{
recursive:true
}
);

const base64=

ttd_base64.replace(
/^data:image\/\w+;base64,/,
""
);

const filename=

`ttd_${req.user.id_user}.png`;

const destination=

path.join(
uploadDir,
filename
);

fs.writeFileSync(

destination,

Buffer.from(
base64,
"base64"
)

);

const relativePath=

path.join(

"uploads",
"asesi",
"ttd",
filename

).replace(/\\/g,"/");

await profile.update({

ttd_path:
relativePath

});

return response.success(

res,

"TTD berhasil diperbarui",

{

ttd_path:
relativePath

}

);

}

catch(err){

console.error(
"UPLOAD TTD ERROR:",
err
);

return response.error(
res,
err.message
);

}

};



/* =====================================
GET FILES
===================================== */

exports.getFiles =
async(req,res)=>{

try{

const profile=
await ProfileAsesi.findByPk(
req.user.id_user
);

if(!profile){

return response.error(

res,

"Data tidak ditemukan",

404

);

}

const baseUrl=

`${req.protocol}://${req.get("host")}`;

return response.success(

res,

"File berhasil diambil",

{

foto_profil:

profile.foto_profil

? `${baseUrl}/${profile.foto_profil}`

: null,

ttd:

profile.ttd_path

? `${baseUrl}/${profile.ttd_path}`

: null

}

);

}

catch(err){

console.error(
"GET FILES ERROR:",
err
);

return response.error(
res,
err.message
);

}

};