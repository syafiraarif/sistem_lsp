const {
  Presensi,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi,
  JadwalAsesor,
  ProfileAsesor
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");


/*
=====================================
CREATE PRESENSI
=====================================
*/

exports.createPresensi = async (req,res)=>{

try{

const { id_peserta }=req.body;

if(!id_peserta){

return res.status(400).json({
message:"id_peserta wajib diisi"
});

}

const file=
req.files?.ttd_presensi?.[0];

if(!file){

return res.status(400).json({
message:"TTD wajib upload"
});

}

const peserta=
await PesertaJadwal.findOne({

where:{
id_peserta,
id_user:req.user.id_user
},

include:[

{

model:Jadwal,
as:"jadwal"

}

]

});

if(!peserta){

return res.status(404).json({
message:"Peserta tidak ditemukan"
});

}

if(!peserta.jadwal){

return res.status(400).json({
message:"Jadwal tidak ditemukan"
});

}

if(
!["open","ongoing"]
.includes(
peserta.jadwal.status
)
){

return res.status(400).json({
message:"Jadwal belum aktif"
});

}

const now=
new Date();

const mulai=
new Date(
`${peserta.jadwal.tgl_awal} 00:00:00`
);

const selesai=
new Date(
`${peserta.jadwal.tgl_akhir} 23:59:59`
);

if(

now < mulai ||

now > selesai

){

return res.status(400).json({

message:
"Presensi belum dibuka / sudah selesai"

});

}

const existing=
await Presensi.findOne({

where:{
id_peserta
}

});

if(existing){

return res.status(400).json({

message:
"Sudah presensi"

});

}

const presensi=
await Presensi.create({

id_peserta,

ttd_asesi_path:
file.path.replace(/\\/g,"/"),

waktu_presensi:
new Date()

});

return res.status(201).json({

message:
"Presensi berhasil",

status:
"hadir",

data:
presensi

});

}

catch(err){

console.error(err);

return res.status(500).json({

message:
"Gagal presensi",

error:
err.message

});

}

};



/*
=====================================
STATUS PRESENSI
=====================================
*/

exports.getStatusPresensi=
async(req,res)=>{

try{

const presensi=
await Presensi.findOne({

where:{
id_peserta:
req.params.id_peserta
}

});

return res.json({

status:

presensi ?

"hadir"

:

"belum_presensi",

data:
presensi || null

});

}

catch(err){

return res.status(500).json({

message:
err.message

});

}

};



/*
=====================================
DETAIL PRESENSI
=====================================
*/

exports.getDetailPresensi=
async(req,res)=>{

try{

const data=
await Presensi.findOne({

where:{

id_peserta:
req.params.id_peserta

},

include:[

{

model:PesertaJadwal,

as:"peserta",

include:[

{

model:Jadwal,

as:"jadwal",

include:[

{

model:Skema,
as:"skema"

},

{

model:Tuk,
as:"tuk"

}

]

},

{

model:ProfileAsesi,

as:"asesi",

attributes:[

"id_user",
"nama_lengkap",
"ttd_path"

]

}

]

}

]

});

if(!data){

return res.status(404).json({

message:
"Belum presensi"

});

}


const asesor=
await JadwalAsesor.findAll({

where:{

id_jadwal:
data.peserta.id_jadwal,

jenis_tugas:
"asesor_penguji",

status:
"aktif"

},

include:[

{

model:ProfileAsesor,

as:"profileAsesor"

}

]

});


const base=
`${req.protocol}://${req.get("host")}`;

data.dataValues.ttd_url=
`${base}/${data.ttd_asesi_path}`;


return res.json({

status:"hadir",

data,

asesor

});

}

catch(err){

console.error(err);

return res.status(500).json({

message:
err.message

});

}

};



/*
=====================================
GENERATE PDF PRESENSI
=====================================
*/

exports.generatePdfPresensi=
async(req,res)=>{

try{

const data=
await Presensi.findOne({

where:{

id_peserta:
req.params.id_peserta

},

include:[

{

model:PesertaJadwal,

as:"peserta",

include:[

{

model:Jadwal,

as:"jadwal",

include:[

{

model:Skema,
as:"skema"

},

{

model:Tuk,
as:"tuk"

}

]

},

{

model:ProfileAsesi,

as:"asesi"

}

]

}

]

});


if(!data){

return res.status(404).json({

message:
"Belum presensi"

});

}


const asesor=
await JadwalAsesor.findAll({

where:{

id_jadwal:
data.peserta.id_jadwal,

jenis_tugas:
"asesor_penguji",

status:
"aktif"

},

include:[

{

model:ProfileAsesor,

as:"profileAsesor"

}

]

});


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
`attachment; filename=presensi-${req.params.id_peserta}.pdf`
);


doc.pipe(res);


doc
.fontSize(18)
.text(
"FORM PRESENSI ASESMEN",
{
align:"center"
}
);

doc.moveDown();

doc.fontSize(12);

doc.text(
`Nama Peserta : ${
data.peserta.asesi?.nama_lengkap || "-"
}`
);

doc.text(
`Skema : ${
data.peserta.jadwal?.skema?.judul_skema || "-"
}`
);

doc.text(
`TUK : ${
data.peserta.jadwal?.tuk?.nama_tuk || "-"
}`
);

doc.text(
`Tanggal Presensi : ${
new Date(
data.waktu_presensi
).toLocaleString()
}`
);

doc.moveDown();

doc.text(
"Asesor Penguji:"
);

asesor.forEach((a,i)=>{

doc.text(

`${i+1}. ${
a.profileAsesor?.nama_lengkap || "-"
}`

);

});

doc.moveDown(2);

const ttd=
path.join(
process.cwd(),
data.ttd_asesi_path
);

if(
fs.existsSync(ttd)
){

doc.image(
ttd,
420,
doc.y,
{
width:100
}
);

}

doc.moveDown(4);

doc.text(
"Asesi",
{
align:"right"
}
);

doc.end();

}

catch(err){

console.error(err);

return res.status(500).json({

message:
err.message

});

}

};