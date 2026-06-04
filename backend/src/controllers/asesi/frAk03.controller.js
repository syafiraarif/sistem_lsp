const FrAk03 = require("../../models/frAk03.model");
const FrAk03Detail = require("../../models/frAk03Detail.model");
const PesertaJadwal = require("../../models/pesertaJadwal.model");
const Jadwal = require("../../models/jadwal.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const ProfileAsesi = require("../../models/profileAsesi.model");

const PDFDocument = require("pdfkit");

/*
====================================
PERTANYAAN FIXED FR.AK.03
====================================
*/

const QUESTIONS=[

" Saya mendapatkan penjelasan yang cukup memadai mengenai proses asesmen/uji kompetensi",

" Saya diberikan kesempatan untuk mempelajari standar kompetensi yang akan diujikan dan menilai diri sendiri terhadap pencapaiannya",

" Asesor memberikan kesempatan untuk mendiskusikan/menegosiasikan metoda, instrumen dan sumber asesmen serta jadwal asesmen",

" Asesor berusaha menggali seluruh bukti pendukung yang sesuai dengan latar belakang pelatihan dan pengalaman yang saya miliki",

" Saya sepenuhnya diberikan kesempatan untuk mendemonstrasikan kompetensi yang saya miliki selama asesmen",

" Saya mendapatkan penjelasan yang memadai mengenai keputusan asesmen",

" Asesor memberikan umpan balik yang mendukung setelah asesmen serta tindak lanjutnya",

" Asesor bersama saya mempelajari semua dokumen asesmen serta menandatanganinya",

" Saya mendapatkan jaminan kerahasiaan hasil asesmen serta penjelasan penanganan dokumen asesmen",

" Asesor menggunakan keterampilan komunikasi yang efektif selama asesmen"

];


/*
====================================
GET FORM FR.AK.03
====================================
*/

exports.getFormFrAk03=
async(req,res)=>{

try{

const idUser=
req.user.id_user ||
req.user.id;


const peserta=
await PesertaJadwal.findOne({

where:{
id_user:idUser
},

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

}

]

});


if(!peserta){

return res.status(404).json({

message:
"Peserta tidak ditemukan"

});

}


res.json({

id_peserta:
peserta.id_peserta,

skema:
peserta.jadwal.skema,

tuk:
peserta.jadwal.tuk,

tanggal:
peserta.jadwal.tgl_akhir,

questions:
QUESTIONS

});


}catch(err){

res.status(500).json({

message:
err.message

});

}

};



/*
====================================
CREATE FR.AK.03
====================================
*/

exports.createFrAk03=
async(req,res)=>{

try{

const{

jawaban,
catatan_lainnya

}=req.body;


const idUser=
req.user.id_user ||
req.user.id;


const peserta=
await PesertaJadwal.findOne({

where:{
id_user:idUser
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

message:
"Peserta tidak ditemukan"

});

}


const existing=
await FrAk03.findOne({

where:{
id_peserta:
peserta.id_peserta
}

});


if(existing){

return res.status(400).json({

message:
"FR.AK.03 sudah pernah diisi"

});

}


if(

!Array.isArray(jawaban)

||

jawaban.length!==QUESTIONS.length

){

return res.status(400).json({

message:
"Jawaban tidak lengkap"

});

}


const fr=
await FrAk03.create({

id_peserta:
peserta.id_peserta,

id_jadwal:
peserta.id_jadwal,

id_skema:
peserta.jadwal.id_skema,

id_tuk:
peserta.jadwal.id_tuk,

tanggal_asesmen:
new Date(),

catatan_lainnya

});


await FrAk03Detail.bulkCreate(

jawaban.map(

(item,index)=>({

id_fr_ak03:
fr.id_fr_ak03,

kode_pertanyaan:
`Q${index+1}`,

pertanyaan:
QUESTIONS[index],

jawaban:
item.jawaban,

catatan:
item.catatan || null

})

)

);


res.json({

message:
"FR.AK.03 berhasil disimpan"

});


}catch(err){

console.error(err);

res.status(500).json({

message:
err.message

});

}

};



/*
====================================
GET DETAIL FR.AK.03
====================================
*/

exports.getFrAk03ByPeserta=
async(req,res)=>{

try{

const data=
await FrAk03.findOne({

where:{
id_peserta:
req.params.id_peserta
},

include:[

{

model:FrAk03Detail,
as:"detailAk03"

},

{

model:PesertaJadwal,
as:"peserta",

include:[

{

model:ProfileAsesi,
as:"profileAsesi"

}

]

},

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

}

]

});


if(!data){

return res.status(404).json({

message:
"FR.AK03 tidak ditemukan"

});

}


res.json(data);


}catch(err){

res.status(500).json({

message:
err.message

});

}

};



/*
====================================
GENERATE PDF
====================================
*/

exports.generatePdfFrAk03=
async(req,res)=>{

try{

const data=
await FrAk03.findOne({

where:{
id_peserta:
req.params.id_peserta
},

include:[

{

model:FrAk03Detail,
as:"detailAk03"

},

{

model:PesertaJadwal,
as:"peserta",

include:[

{

model:ProfileAsesi,
as:"profileAsesi"

}

]

},

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

}

]

});


if(!data){

return res.status(404).json({

message:
"Data tidak ditemukan"

});

}


const doc=
new PDFDocument({

margin:40

});


res.setHeader(
"Content-Type",
"application/pdf"
);

doc.pipe(res);


doc
.fontSize(16)
.text(
"FR.AK.03 UMPAN BALIK DAN CATATAN ASESMEN",
{
align:"center"
}
);

doc.moveDown();


doc.text(

`Nama Asesi : ${
data.peserta.profileAsesi.nama_lengkap
}`

);

doc.text(

`Skema : ${
data.jadwal.skema.judul_skema
}`

);

doc.text(

`TUK : ${
data.jadwal.tuk.nama_tuk
}`

);

doc.moveDown();


data.detailAk03.forEach(

(item,index)=>{

doc.text(

`${index+1}. ${item.pertanyaan}`

);

doc.text(

`Jawaban : ${item.jawaban}`

);

doc.text(

`Catatan : ${
item.catatan || "-"
}`

);

doc.moveDown();

}

);


doc.text(
"Catatan Lainnya:"
);

doc.text(

data.catatan_lainnya || "-"

);


doc.end();


}catch(err){

res.status(500).json({

message:
err.message

});

}

};