const {

sequelize,

HasilKeputusanAsesmen,

PesertaJadwal,

ProfileAsesor,

Jadwal,

ProfileAsesi,

Presensi,

Apl01Asesmen,

Apl02,

FrIa05Penilaian,

FrAk03,

FrAk04

}=require("../../models");



/* =======================================
SUBMIT HASIL KEPUTUSAN ASESMEN
======================================= */

exports.submitKeputusan=
async(req,res)=>{

const t=
await sequelize.transaction();

try{

const{

id_peserta,
id_jadwal,
hasil,
catatan_asesor,
nilai_akhir

}=req.body;



const id_asesor=
req.user.id_user ||
req.user.id;



const existing=
await HasilKeputusanAsesmen.findOne({

where:{

id_peserta,
id_jadwal

},

transaction:t

});



if(existing){

await existing.update({

hasil,

catatan_asesor,

id_asesor,

tanggal_keputusan:
new Date()

},

{

transaction:t

});

}else{

await HasilKeputusanAsesmen.create({

id_peserta,

id_jadwal,

id_asesor,

hasil,

catatan_asesor,

tanggal_keputusan:
new Date()

},

{

transaction:t

});

}



await PesertaJadwal.update(

{

status_asesmen:
hasil,

nilai_akhir,

keterangan:
catatan_asesor,

waktu_selesai:
new Date()

},

{

where:{

id_peserta

},

transaction:t

}

);



await t.commit();



res.json({

message:
"Keputusan asesmen berhasil disimpan",

hasil

});

}catch(err){

await t.rollback();

res.status(500).json({

message:
err.message

});

}

};



/* =======================================
GET KEPUTUSAN ASESMEN
======================================= */

exports.getKeputusan=
async(req,res)=>{

try{

const data=
await HasilKeputusanAsesmen.findOne({

where:{

id_peserta:
req.params.id_peserta

},

include:[

{

model:
ProfileAsesor,

as:
"asesor"

},

{

model:
PesertaJadwal,

as:
"peserta",

include:[

{

model:
ProfileAsesi,

as:
"asesi"

}

]

},

{

model:
Jadwal,

as:
"jadwal"

}

]

});


if(!data){

return res.status(404).json({

message:
"Keputusan belum tersedia"

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



/* =======================================
HASIL AKHIR UNTUK ASESI
======================================= */

exports.getHasilAkhir=
async(req,res)=>{

try{

const peserta=
req.params.id_peserta;



const keputusan=
await HasilKeputusanAsesmen.findOne({

where:{

id_peserta:
peserta

}

});


if(!keputusan){

return res.status(404).json({

message:
"Hasil belum tersedia"

});

}



/*
BELUM KOMPETEN
*/

if(

keputusan.hasil
==="belum_kompeten"

){

return res.json({

status:
"belum_kompeten",

redirect:[

"FRAK03",

"FRAK04"

]

});

}



/*
KOMPETEN
*/

const presensi=
await Presensi.findOne({

where:{

id_peserta:
peserta

}

});


const apl01=
await Apl01Asesmen.findOne({

where:{

id_peserta:
peserta

}

});


const apl02=
await Apl02.findOne({

where:{

id_peserta:
peserta

}

});


const fria05=
await FrIa05Penilaian.findAll({

where:{

id_peserta:
peserta

}

});


res.json({

status:
"kompeten",

hasil:{

presensi,

apl01,

apl02,

fria05

}

});

}catch(err){

res.status(500).json({

message:
err.message

});

}

};