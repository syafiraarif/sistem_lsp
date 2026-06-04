const PDFDocument = require("pdfkit");

const FrIa05 = require("../../models/frIa05.model");
const Soal = require("../../models/frIa05Soal.model");
const Opsi = require("../../models/frIa05Opsi.model");


// ===============================
// CREATE PAKET SOAL
// ===============================
exports.createPaket = async (req, res) => {

try {

const data = await FrIa05.create({

id_jadwal: req.body.id_jadwal,
id_skema: req.body.id_skema,
kode_paket: req.body.kode_paket,
judul_paket: req.body.judul_paket,
passing_grade: req.body.passing_grade || 70,

created_by: req.user.id,
created_at: new Date()

});

res.status(201).json({

message: "Paket soal berhasil dibuat",
data

});

} catch (err) {

res.status(500).json({

message: err.message

});

}

};


// ===============================
// GET PAKET BY JADWAL
// ===============================
exports.getByJadwal = async (req, res) => {

try {

const data = await FrIa05.findAll({

where: {

id_jadwal:
req.params.id_jadwal

},

order: [

["created_at","DESC"]

]

});

res.json(data);

} catch (err) {

res.status(500).json({

message: err.message

});

}

};


// ===============================
// CREATE SOAL
// ===============================
exports.createSoal = async (
req,
res
)=>{

try{

const data =
await Soal.create({

id_fr_ia_05:
req.body.id_fr_ia_05,

id_kelompok:
req.body.id_kelompok,

pertanyaan:
req.body.pertanyaan,

gambar:
req.body.gambar || null,

urutan:
req.body.urutan || 0

});


res.status(201).json({

message:
"Soal berhasil ditambahkan",

data

});

}catch(err){

res.status(500).json({

message:
err.message

});

}

};


// ===============================
// UPDATE SOAL
// ===============================
exports.updateSoal = async (
req,
res
)=>{

try{

const soal=
await Soal.findByPk(
req.params.id
);

if(!soal){

return res.status(404).json({

message:
"Soal tidak ditemukan"

});

}


await soal.update({

id_kelompok:
req.body.id_kelompok,

pertanyaan:
req.body.pertanyaan,

gambar:
req.body.gambar,

urutan:
req.body.urutan

});


res.json({

message:
"Soal berhasil diupdate"

});

}catch(err){

res.status(500).json({

message:
err.message

});

}

};


// ===============================
// DELETE SOAL
// ===============================
exports.deleteSoal = async (
req,
res
)=>{

try{

const soal=
await Soal.findByPk(
req.params.id
);

if(!soal){

return res.status(404).json({

message:
"Soal tidak ditemukan"

});

}


await soal.destroy();

res.json({

message:
"Soal berhasil dihapus"

});

}catch(err){

res.status(500).json({

message:
err.message

});

}

};


// ===============================
// CREATE OPSI
// ===============================
exports.createOpsi = async (
req,
res
)=>{

try{

const {

id_soal,
kode_opsi,
jawaban,
is_benar

}=req.body;


if(is_benar){

await Opsi.update(

{

is_benar:false

},

{

where:{
id_soal
}

}

);

}


const data=
await Opsi.create({

id_soal,

kode_opsi,

jawaban,

is_benar:
Boolean(is_benar)

});


res.status(201).json({

message:
"Opsi berhasil ditambahkan",

data

});


}catch(err){

res.status(500).json({

message:
err.message

});

}

};


// ===============================
// GET DETAIL SOAL + OPSI
// ===============================
exports.getDetail = async (
req,
res
)=>{

try{

const data=
await FrIa05.findByPk(

req.params.id,

{

include:[

{

model:Soal,
as:"soal",

include:[

{

model:Opsi,
as:"opsi"

}

]

}

]

}

);


if(!data){

return res.status(404).json({

message:
"Paket tidak ditemukan"

});

}


data.soal.sort(

(a,b)=>

(a.urutan||0)
-
(b.urutan||0)

);


res.json(data);

}catch(err){

res.status(500).json({

message:
err.message

});

}

};


// ===============================
// DOWNLOAD PDF KOMITE
// ===============================
exports.downloadPdf = async (
req,
res
)=>{

try{

const paket=
await FrIa05.findByPk(

req.params.id,

{

include:[

{

model:Soal,
as:"soal",

include:[

{

model:Opsi,
as:"opsi"

}

]

}

]

}

);


if(!paket){

return res.status(404).json({

message:
"Paket tidak ditemukan"

});

}


res.setHeader(
"Content-Type",
"application/pdf"
);

res.setHeader(

"Content-Disposition",

`attachment; filename=FRIA05-${paket.kode_paket}.pdf`

);


const doc=
new PDFDocument({

margin:40

});

doc.pipe(res);


doc
.fontSize(16)
.text(
"FR.IA.05A PERTANYAAN TERTULIS PILIHAN GANDA",
{
align:"center"
}
);

doc.moveDown();

doc.text(
`Kode Paket : ${paket.kode_paket}`
);

doc.text(
`Judul Paket : ${paket.judul_paket}`
);

doc.text(
`Passing Grade : ${paket.passing_grade}`
);

doc.moveDown();


const soalSorted=
paket.soal.sort(

(a,b)=>

(a.urutan||0)
-
(b.urutan||0)

);


soalSorted.forEach(

(soal,index)=>{

doc
.fontSize(12)
.font("Helvetica-Bold")
.text(

`${index+1}. ${soal.pertanyaan}`

);

doc.font(
"Helvetica"
);

doc.moveDown(.3);


soal.opsi.forEach(

opsi=>{

doc.text(

`${opsi.kode_opsi}. ${opsi.jawaban}`

);

}

);


const benar=

soal.opsi.find(
x=>x.is_benar
)

||

{};


doc.moveDown(.3);

doc
.font("Helvetica-Bold")
.text(

`Jawaban Benar : ${
benar.kode_opsi || "-"
}`

);

doc.font(
"Helvetica"
);

doc.moveDown();

}

);


doc.end();

}catch(err){

res.status(500).json({

message:
err.message

});

}

};