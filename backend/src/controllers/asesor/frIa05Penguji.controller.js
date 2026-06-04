const PDFDocument=require("pdfkit");

const Jawaban=require("../../models/frIa05Jawaban.model");
const Penilaian=require("../../models/frIa05Penilaian.model");
const Soal=require("../../models/frIa05Soal.model");
const Opsi=require("../../models/frIa05Opsi.model");



/* =======================================
SAVE / UPDATE JAWABAN ASESI
======================================= */

exports.saveJawabanAsesi=
async(req,res)=>{

try{

const{

id_peserta,
id_soal,
id_opsi,
id_fr_ia_05

}=req.body;



const submitted=
await Penilaian.findOne({

where:{

id_peserta,
id_fr_ia_05,

submitted:true

}

});


if(submitted){

return res.status(400).json({

message:
"FR IA05 sudah disubmit dan tidak dapat diubah"

});

}



const opsi=
await Opsi.findByPk(
id_opsi
);

if(!opsi){

return res.status(404).json({

message:
"Opsi tidak ditemukan"

});

}



const existing=
await Jawaban.findOne({

where:{

id_peserta,
id_soal

}

});



if(existing){

await existing.update({

id_opsi,

is_benar:
opsi.is_benar

});


return res.json({

message:
"Jawaban berhasil diupdate"

});

}



await Jawaban.create({

id_peserta,

id_soal,

id_opsi,

is_benar:
opsi.is_benar,

created_at:
new Date()

});


res.status(201).json({

message:
"Jawaban berhasil disimpan"

});

}catch(err){

res.status(500).json({

message:
err.message

});

}

};



/* =======================================
SUBMIT FINAL
======================================= */

exports.submitFinal=
async(req,res)=>{

try{

const{

id_peserta,
id_fr_ia_05

}=req.body;



const existing=
await Penilaian.findOne({

where:{

id_peserta,
id_fr_ia_05

}

});



if(existing?.submitted){

return res.status(400).json({

message:
"FR IA05 sudah disubmit"

});

}



if(existing){

await existing.update({

submitted:true,

tanggal_penilaian:
new Date()

});

}else{

await Penilaian.create({

id_peserta,

id_fr_ia_05,

submitted:true,

tanggal_penilaian:
new Date()

});

}



res.json({

message:
"FR IA05 berhasil disubmit"

});

}catch(err){

res.status(500).json({

message:
err.message

});

}

};



/* =======================================
LIHAT HASIL ASESI
======================================= */

exports.getHasilAsesi=
async(req,res)=>{

try{

const data=
await Jawaban.findAll({

where:{

id_peserta:
req.params.id_peserta

},

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

},

{

model:Opsi,
as:"opsi"

}

],

order:[

["id_soal","ASC"]

]

});


res.json(data);

}catch(err){

res.status(500).json({

message:
err.message

});

}

};



/* =======================================
HITUNG NILAI
======================================= */

exports.hitungNilai=
async(req,res)=>{

try{

const jawaban=
await Jawaban.findAll({

where:{

id_peserta:
req.params.id_peserta

}

});


const total=
jawaban.length;

const benar=
jawaban.filter(
x=>x.is_benar
).length;

const salah=
total-benar;

const nilai=
total>0

?

Number(

(
(benar/total)
*100

).toFixed(2)

)

:

0;


res.json({

total,
benar,
salah,
nilai

});

}catch(err){

res.status(500).json({

message:
err.message

});

}

};



/* =======================================
SIMPAN PENILAIAN
======================================= */

exports.simpanPenilaian=
async(req,res)=>{

try{

const existing=
await Penilaian.findOne({

where:{

id_peserta:
req.body.id_peserta,

id_fr_ia_05:
req.body.id_fr_ia_05

}

});


if(existing){

await existing.update({

...req.body,

tanggal_penilaian:
new Date()

});

return res.json({

message:
"Penilaian berhasil diupdate"

});

}



const data=
await Penilaian.create({

...req.body,

tanggal_penilaian:
new Date()

});


res.status(201).json({

message:
"Penilaian berhasil disimpan",

data

});

}catch(err){

res.status(500).json({

message:
err.message

});

}

};



/* =======================================
GET PENILAIAN
======================================= */

exports.getPenilaian=
async(req,res)=>{

try{

const data=
await Penilaian.findOne({

where:{

id_peserta:
req.params.id_peserta

}

});


res.json(data);

}catch(err){

res.status(500).json({

message:
err.message

});

}

};



/* =======================================
DOWNLOAD PDF
======================================= */

exports.downloadPdf =
async(req,res)=>{

try{

const hasil=
await Jawaban.findAll({

where:{

id_peserta:
req.params.id_peserta

},

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

},

{

model:Opsi,
as:"opsi"

}

],

order:[

["id_soal","ASC"]

]

});


const penilaian=
await Penilaian.findOne({

where:{

id_peserta:
req.params.id_peserta

}

});


res.setHeader(
"Content-Type",
"application/pdf"
);

res.setHeader(

"Content-Disposition",

`attachment; filename=FRIA05-HASIL-${req.params.id_peserta}.pdf`

);


const doc=
new PDFDocument({

margin:40

});

doc.pipe(res);



/* HEADER */

doc
.fontSize(16)
.font("Helvetica-Bold")
.text(

"FR.IA.05A HASIL ASESMEN PILIHAN GANDA",

{

align:"center"

}

);

doc.moveDown();

doc
.font("Helvetica")
.fontSize(11);


doc.text(
`Peserta : ${req.params.id_peserta}`
);

if(penilaian){

doc.text(
`Nilai : ${penilaian.nilai ?? "-"}`
);

doc.text(
`Hasil : ${penilaian.hasil ?? "-"}`
);

doc.text(
`Jumlah Benar : ${
penilaian.jumlah_benar ?? 0
}`
);

doc.text(
`Jumlah Salah : ${
penilaian.jumlah_salah ?? 0
}`
);

doc.text(
`Status Submit : ${
penilaian.submitted
?
"SUDAH SUBMIT"
:
"BELUM SUBMIT"
}`
);

}

doc.moveDown();



/* SOAL */

hasil.forEach(

(row,index)=>{

doc
.font(
"Helvetica-Bold"
)
.fontSize(12)
.text(

`${index+1}. ${
row.soal?.pertanyaan
||
"-"
}`

);


doc.font(
"Helvetica"
);

doc.moveDown(.3);



/* OPSI */

if(
row.soal &&
row.soal.opsi
){

row.soal.opsi.forEach(

(o)=>{

let prefix="";

if(
row.opsi &&
row.opsi.id_opsi===o.id_opsi
){

prefix="[X] ";

}else{

prefix="[ ] ";

}


doc.text(

`${prefix}${o.kode_opsi}. ${o.jawaban}`

);

}

);

}



const jawabanBenar=

row.soal?.opsi?.find(
x=>x.is_benar
)

||

{};


doc.moveDown(.3);

doc.text(

`Jawaban Asesi : ${
row.opsi?.kode_opsi
||
"-"
}`

);


doc.text(

`Jawaban Benar : ${
jawabanBenar.kode_opsi
||
"-"
}`

);


doc.text(

`Status : ${
row.is_benar
?

"BENAR"

:

"SALAH"

}`

);

doc.moveDown();

doc.moveTo(
40,
doc.y
)
.lineTo(
550,
doc.y
)
.stroke();

doc.moveDown();

}

);



/* FEEDBACK */

if(penilaian){

doc.moveDown();

doc
.font(
"Helvetica-Bold"
)
.text(
"Feedback Asesor"
);

doc.font(
"Helvetica"
);

doc.text(

penilaian.umpan_balik
||
"-"

);

doc.moveDown();

doc
.font(
"Helvetica-Bold"
)
.text(
"Catatan"
);

doc.font(
"Helvetica");

doc.text(

penilaian.catatan
||
"-"

);

}



doc.end();

}catch(err){

res.status(500).json({

message:
err.message

});

}

};