const {
sequelize,
FrMapa02,
FrMapa02Unit,
FrMapa02Muk,
FrMapa01,
SkemaUnit,
UnitKompetensi,
KelompokPekerjaan

}=require("../../models");

const PDFDocument=
require("pdfkit");



/* =====================================
MASTER MUK
HANYA YANG DIPAKAI
===================================== */

const MASTER_MUK=[

{

kode:"FR.IA.01",
nama:"Ceklis Observasi"

},

{

kode:"FR.IA.02",
nama:"Tugas Praktik Demonstrasi"

},

{

kode:"FR.IA.03",
nama:"Pertanyaan Pendukung Observasi"

},

{

kode:"FR.IA.05",
nama:"Pertanyaan Tertulis Pilihan Ganda"

}

];



/* =====================================
GENERATE MAPA02
===================================== */

const generateMapa02=
async(req,res)=>{

const t=
await sequelize.transaction();

try{

const id_user=
req.user.id_user;

const{
id_jadwal

}=req.body;



const mapa01=
await FrMapa01.findOne({

where:{

id_jadwal,

id_asesor:
id_user

},

transaction:t

});


if(!mapa01){

await t.rollback();

return res.status(404).json({

message:
"FR MAPA01 belum dibuat"

});

}



const existing=
await FrMapa02.findOne({

where:{

id_jadwal,

id_asesor:
id_user

},

transaction:t

});


if(existing){

await t.rollback();

return res.status(400).json({

message:
"FR MAPA02 sudah ada"

});

}



const mapa02=
await FrMapa02.create({

id_jadwal,

id_skema:
mapa01.id_skema,

id_asesor:
id_user,

id_mapa01:
mapa01.id_mapa01

},

{

transaction:t

});



const units=
await SkemaUnit.findAll({

where:{

id_skema:
mapa01.id_skema

},

include:[

{

model:
UnitKompetensi,

as:"unit"

},

{

model:
KelompokPekerjaan,

as:"kelompok"

}

],

order:[

["urutan","ASC"]

],

transaction:t

});



for(const u of units){

const unit=
await FrMapa02Unit.create({

id_mapa02:
mapa02.id_mapa02,

id_unit:
u.id_unit,

id_kelompok:
u.id_kelompok,

urutan:
u.urutan

},

{

transaction:t

});



const muk=
MASTER_MUK.map(

m=>({

id_mapa02_unit:
unit.id_mapa02_unit,

kode_muk:
m.kode,

nama_muk:
m.nama,

dipilih:true

})

);



await FrMapa02Muk.bulkCreate(

muk,

{

transaction:t

}

);

}



await t.commit();


res.status(201).json({

message:
"FR MAPA02 berhasil dibuat",

data:
mapa02

});


}catch(err){

await t.rollback();

res.status(500).json({

message:
err.message

});

}

};



/* =====================================
GET MAPA02
===================================== */

const getMapa02=
async(req,res)=>{

try{

const id_user=
req.user.id_user;

const{
id_jadwal

}=req.query;



const data=
await FrMapa02.findOne({

where:{

id_jadwal,

id_asesor:
id_user

},

include:[

{

model:
FrMapa02Unit,

as:"unit",

include:[

{

model:
FrMapa02Muk,

as:"muk"

}

]

}

]

});


res.json({

data

});


}catch(err){

res.status(500).json({

message:
err.message

});

}

};



/* =====================================
UPDATE CHECKBOX
===================================== */

const updateMapa02=
async(req,res)=>{

const t=
await sequelize.transaction();

try{

const{

muk

}=req.body;



for(const item of muk){

await FrMapa02Muk.update(

{

dipilih:
item.dipilih

},

{

where:{

id_muk:
item.id_muk

},

transaction:t

}

);

}



await t.commit();

res.json({

message:
"MAPA02 berhasil diupdate"

});

}catch(err){

await t.rollback();

res.status(500).json({

message:
err.message

});

}

};



/* =====================================
PDF
===================================== */

const downloadPdfMapa02=
async(req,res)=>{

try{

const data=
await FrMapa02.findByPk(

req.params.id,

{

include:[

{

model:
FrMapa02Unit,

as:"unit",

include:[

{

model:
FrMapa02Muk,

as:"muk"

}

]

}

]

}

);


if(!data){

return res.status(404).json({

message:
"Data tidak ditemukan"

});

}



res.setHeader(
"Content-Type",
"application/pdf"
);

res.setHeader(

"Content-Disposition",

`inline; filename=FRMAPA02-${data.id_mapa02}.pdf`

);



const doc=
new PDFDocument({

margin:40

});

doc.pipe(res);



doc
.fontSize(16)
.text(
"FR.MAPA.02",
{
align:"center"
}
);

doc.moveDown();

doc.text(
`Jadwal : ${data.id_jadwal}`
);

doc.moveDown();



data.unit.forEach(

(unit,index)=>{

doc
.fontSize(12)
.text(

`${index+1}. Unit ${unit.id_unit}`

);

doc.moveDown(.3);



unit.muk

.filter(
m=>m.dipilih
)

.forEach(

m=>{

doc.text(

`• ${m.kode_muk} - ${m.nama_muk}`

);

}

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



module.exports={

generateMapa02,

getMapa02,

updateMapa02,

downloadPdfMapa02

};