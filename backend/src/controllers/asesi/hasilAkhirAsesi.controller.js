const {

HasilKeputusanAsesmen,

PesertaJadwal,

Presensi,

Apl01Asesmen,

Apl02,

FrIa05Penilaian,

ProfileAsesi,

FrAk03,

FrAk04

}=require("../../models");



/* =======================================
GET STATUS HASIL SAYA
======================================= */

exports.getStatusSaya=
async(req,res)=>{

try{

const id_user=
req.user.id_user ||
req.user.id;



const peserta=
await PesertaJadwal.findOne({

where:{

id_user

}

});


if(!peserta){

return res.status(404).json({

message:
"Peserta tidak ditemukan"

});

}



const keputusan=
await HasilKeputusanAsesmen.findOne({

where:{

id_peserta:
peserta.id_peserta

}

});


if(!keputusan){

return res.status(404).json({

message:
"Hasil asesmen belum tersedia"

});

}



if(
keputusan.hasil
==="belum_kompeten"
){

return res.json({

status:
"belum_kompeten",

next_step:[

"FRAK03",

"FRAK04"

]

});

}



return res.json({

status:
"kompeten"

});

}catch(err){

res.status(500).json({

message:
err.message

});

}

};



/* =======================================
GET HASIL LENGKAP ASESI
======================================= */

exports.getHasilSaya=
async(req,res)=>{

try{

const id_user=
req.user.id_user ||
req.user.id;



const peserta=
await PesertaJadwal.findOne({

where:{

id_user

}

});


if(!peserta){

return res.status(404).json({

message:
"Peserta tidak ditemukan"

});

}



const keputusan=
await HasilKeputusanAsesmen.findOne({

where:{

id_peserta:
peserta.id_peserta

}

});


if(!keputusan){

return res.status(404).json({

message:
"Hasil belum tersedia"

});

}



if(
keputusan.hasil
!=="kompeten"
){

return res.status(400).json({

message:
"Belum kompeten",

redirect:[

"FRAK03",

"FRAK04"

]

});

}



/* ======================
AMBIL SEMUA HASIL
====================== */

const presensi=
await Presensi.findOne({

where:{

id_peserta:
peserta.id_peserta

}

});


const apl01=
await Apl01Asesmen.findOne({

where:{

id_peserta:
peserta.id_peserta

}

});


const apl02=
await Apl02.findOne({

where:{

id_peserta:
peserta.id_peserta

}

});


const fria05=
await FrIa05Penilaian.findAll({

where:{

id_peserta:
peserta.id_peserta

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

},

keputusan

});

}catch(err){

res.status(500).json({

message:
err.message

});

}

};