const {
  Apl02,
  Apl02Detail,
  Apl02Bukti,
  SkemaUnit,
  UnitKompetensi,
  UnitElemen,
  UnitKuk,
  PesertaJadwal,
  Jadwal,
  Skema,
  ProfileAsesi
} = require("../../models");

const PDFDocument=require("pdfkit");
const fs=require("fs");
const path=require("path");


/*
=================================
GET FORM
=================================
*/

exports.getFormApl02=
async(req,res)=>{

try{

const { id_skema }=
req.params;

const data=
await SkemaUnit.findAll({

where:{
id_skema
},

include:[

{

model:UnitKompetensi,

as:"unit",

include:[

{

model:UnitElemen,

as:"elemen",

include:[

{

model:UnitKuk,

as:"kuk"

}

]

}

]

}

],

order:[
["urutan","ASC"]
]

});

return res.json({

success:true,

data

});

}

catch(err){

console.error(err);

return res.status(500).json({

success:false,

message:err.message

});

}

};



/*
=================================
CREATE APL02
=================================
*/

exports.createApl02=
async(req,res)=>{

try{

const { id_peserta }=
req.body;

const peserta=
await PesertaJadwal.findOne({

where:{

id_peserta,

id_user:
req.user.id_user

}

});

if(!peserta){

return res.status(404).json({

success:false,

message:
"Peserta tidak ditemukan"

});

}

const existing=
await Apl02.findOne({

where:{
id_peserta
}

});

if(existing){

return res.json({

success:true,

data:existing

});

}

const apl02=
await Apl02.create({

id_peserta,

status:"draft"

});

return res.json({

success:true,

data:apl02

});

}

catch(err){

return res.status(500).json({

success:false,

message:err.message

});

}

};



/*
=================================
SAVE PENILAIAN
=================================
*/

exports.savePenilaian=
async(req,res)=>{

try{

const {

id_apl02,

id_unit,

id_elemen,

kompeten,

catatan

}=req.body;


const apl02=
await Apl02.findByPk(
id_apl02
);

if(!apl02){

return res.status(404).json({

success:false,

message:
"APL02 tidak ada"

});

}

if(
apl02.status!=="draft"
){

return res.status(400).json({

success:false,

message:
"APL02 sudah submit"

});

}

let detail=
await Apl02Detail.findOne({

where:{

id_apl02,

id_elemen

}

});


const payload={

id_unit,

kompeten,

catatan:
catatan || ""

};

if(detail){

await detail.update(
payload
);

}else{

detail=
await Apl02Detail.create({

id_apl02,

id_unit,

id_elemen,

...payload

});

}

return res.json({

success:true,

data:detail

});

}

catch(err){

return res.status(500).json({

success:false,

message:err.message

});

}

};



/*
=================================
UPLOAD BUKTI
=================================
*/

exports.uploadBukti=
async(req,res)=>{

try{

const {

id_detail,

jenis_portofolio,

nama_dokumen,

nomor_dokumen,

tanggal_dokumen

}=req.body;

const file=
req.files?.file_dokumen?.[0];

if(!file){

return res.status(400).json({

success:false,

message:
"File wajib"

});

}

const detail=
await Apl02Detail.findByPk(
id_detail
);

if(!detail){

return res.status(404).json({

success:false,

message:
"Detail tidak ada"

});

}

const bukti=
await Apl02Bukti.create({

id_detail,

jenis_portofolio:
jenis_portofolio || "",

nama_dokumen:
nama_dokumen || "",

nomor_dokumen:
nomor_dokumen || "",

tanggal_dokumen:
tanggal_dokumen || null,

file_path:
file.path.replace(/\\/g,"/")

});

return res.json({

success:true,

data:bukti

});

}

catch(err){

return res.status(500).json({

success:false,

message:err.message

});

}

};



/*
=================================
GET APL02
=================================
*/

exports.getApl02=
async(req,res)=>{

try{

const { id_peserta }=
req.params;

const data=
await Apl02.findOne({

where:{
id_peserta
},

include:[

{

model:Apl02Detail,

as:"detail",

include:[

{

model:UnitKompetensi,

as:"unit"

},

{

model:UnitElemen,

as:"elemen"

},

{

model:Apl02Bukti,

as:"buktiTambahan"

}

]

}

]

});

if(!data){

return res.status(404).json({

success:false,

message:
"APL02 belum ada"

});

}

const base=
`${req.protocol}://${req.get("host")}`;

data.detail.forEach(

d=>{

d.buktiTambahan.forEach(

b=>{

b.file_url=
`${base}/${b.file_path}`;

}

);

}

);

return res.json({

success:true,

data

});

}

catch(err){

return res.status(500).json({

success:false,

message:err.message

});

}

};



/*
=================================
DELETE BUKTI
=================================
*/

exports.deleteBukti=
async(req,res)=>{

try{

const bukti=
await Apl02Bukti.findByPk(
req.params.id_bukti
);

if(!bukti){

return res.status(404).json({

success:false,

message:
"Tidak ditemukan"

});

}

if(

bukti.file_path &&

fs.existsSync(

path.join(
process.cwd(),
bukti.file_path
)

)

){

fs.unlinkSync(

path.join(
process.cwd(),
bukti.file_path
)

);

}

await bukti.destroy();

return res.json({

success:true,

message:
"Berhasil"

});

}

catch(err){

return res.status(500).json({

success:false,

message:err.message

});

}

};



/*
=================================
SUBMIT
=================================
*/

exports.submitApl02=
async(req,res)=>{

try{

const apl02=
await Apl02.findByPk(
req.params.id_apl02
);

if(!apl02){

return res.status(404).json({

success:false,

message:
"APL02 tidak ada"

});

}

const total=
await Apl02Detail.count({

where:{
id_apl02:
apl02.id_apl02
}

});

if(total===0){

return res.status(400).json({

success:false,

message:
"Isi penilaian dulu"

});

}

await apl02.update({

status:"submitted",

updated_at:
new Date()

});

return res.json({

success:true,

message:
"Submit berhasil"

});

}

catch(err){

return res.status(500).json({

success:false,

message:err.message

});

}

};



/*
=================================
GENERATE PDF
=================================
*/

exports.generatePdfApl02=
async(req,res)=>{

try{

const { id_peserta }=
req.params;

const data=
await Apl02.findOne({

where:{
id_peserta
},

include:[

{

model:PesertaJadwal,

as:"peserta",

include:[

{

model:ProfileAsesi,

as:"profileAsesi"

},

{

model:Jadwal,

as:"jadwal",

include:[

{

model:Skema,

as:"skema"

}

]

}

]

},

{

model:Apl02Detail,

as:"detail",

include:[

{

model:UnitKompetensi,

as:"unit"

},

{

model:UnitElemen,

as:"elemen"

}

]

}

]

});

if(!data){

return res.status(404).json({

message:
"APL02 tidak ada"

});

}

const doc=
new PDFDocument({

margin:50

});

res.setHeader(
"Content-Type",
"application/pdf"
);

res.setHeader(
"Content-Disposition",
`inline; filename=APL02-${id_peserta}.pdf`
);

doc.pipe(res);

doc
.fontSize(18)
.text(
"FORM APL 02",
{
align:"center"
}
);

doc.moveDown();

doc.text(
`Skema : ${data.peserta.jadwal.skema.judul_skema}`
);

doc.text(
`Asesi : ${
data.peserta.profileAsesi?.nama_lengkap || "-"
}`
);

doc.moveDown();

data.detail.forEach(
(d,index)=>{

doc.fontSize(12)
.text(
`${index+1}. ${d.elemen.nama_elemen}`
);

doc.text(
`Unit : ${d.unit?.judul_unit || "-"}`
);

doc.text(
`Penilaian : ${d.kompeten}`
);

doc.text(
`Catatan : ${d.catatan || "-"}`
);

doc.moveDown();

}
);

doc.moveDown(2);

const ttd=
data.peserta
.profileAsesi
?.ttd_path;

if(ttd){

const p=
path.join(
process.cwd(),
ttd
);

if(
fs.existsSync(p)
){

doc.image(
p,
420,
doc.y,
{
width:90
}
);

}

}

doc.text(
"Asesi",
{
align:"right"
}
);

doc.end();

}

catch(err){

return res.status(500).json({

message:
err.message

});

}

};