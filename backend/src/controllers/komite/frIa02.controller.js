const {
FrIa02,
FrIa02Detail,
FrIa02Validator,
FrIa03,   
Jadwal,
JadwalAsesor,
Skema,
Tuk,
KelompokPekerjaan,
ProfileAsesor,
ProfileAsesi
}=require("../../models");

const PDFDocument = require("pdfkit");
const {
  UnitKompetensi,
  SkemaUnit,
} = require("../../models");

exports.getTugasKomite=async(req,res)=>{
try{

const assessorId=req.user.id_user||req.user.id;

const data=await JadwalAsesor.findAll({

where:{
id_user:assessorId,
jenis_tugas:"komite_teknis",
status:"aktif"
},

include:[{
model:Jadwal,
include:[
{model:Skema,as:"skema"},
{model:Tuk,as:"tuk"}
]
}]

});

res.json(
data.map(x=>x.Jadwal).filter(Boolean)
);

}catch(err){

res.status(500).json({error:err.message});

}
};



exports.getDetail=async(req,res)=>{
try{

const {id_jadwal}=req.query;

const assessorId=
req.user.id_user||
req.user.id;

const existing=
await FrIa02.findOne({

where:{
id_jadwal,
id_asesor:assessorId
},

include:[
    {
        model:FrIa02Detail,
        as:"detail",
        include:[
            {
                model:KelompokPekerjaan,
                as:"kelompok"
            }
        ]
    },

    {
        model:FrIa02Validator,
        as:"validator",
        include:[
            {
                model:ProfileAsesor,
                as:"asesor"
            }
        ]
    },

    {
        model:ProfileAsesor,
        as:"asesor",
        attributes:[
            "id_user",
            "nama_lengkap",
            "no_reg_asesor",
            "ttd_path"
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

});

if (existing) {
  return res.json({
    ...existing.toJSON(),

    nama_asesor: existing.asesor?.nama_lengkap,
    no_reg_asesor: existing.asesor?.no_reg_asesor,
    ttd_asesor: existing.asesor?.ttd_path,

    nama_asesi: existing.asesi?.nama_lengkap,
    ttd_asesi: existing.asesi?.ttd_path,
  });
}

const jadwal=
await Jadwal.findByPk(id_jadwal);

if(!jadwal){

return res.status(404).json({
message:"jadwal tidak ditemukan"
});

}

const kelompok=
await KelompokPekerjaan.findAll({


where:{
id_skema:jadwal.id_skema
},

order:[
["urutan","ASC"]
]

});

console.log("ID SKEMA :", jadwal.id_skema);

console.log(
    "KELOMPOK",
    kelompok.map(x => x.toJSON())
);

res.json({

generated:true,

jadwal,

detail:kelompok.map(x=>({

id_kelompok:x.id_kelompok,

nama_kelompok:x.nama_kelompok,

skenario:null,

langkah_kerja:null,

peralatan:null,

durasi:null

}))

});

}catch(err){

res.status(500).json({error:err.message});

}

};

exports.getUnitBySkema = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const jadwal = await Jadwal.findByPk(id_jadwal);

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan",
      });
    }

    const mapping = await SkemaUnit.findAll({
      where: {
        id_skema: jadwal.id_skema,
      },
      include: [
        {
          model: UnitKompetensi,
          as: "unit",
        },
      ],
      order: [["urutan", "ASC"]],
    });

    const unit = mapping.map((item) => ({
      id_unit: item.unit.id_unit,
      kode_unit: item.unit.kode_unit,
      judul_unit: item.unit.judul_unit,
      id_kelompok: item.id_kelompok,
      urutan: item.urutan,
    }));

    res.json(unit);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.createFrIa02=async(req,res)=>{
try{

const {
id_jadwal,
id_asesi,
tanggal,
details=[],
validators=[]
}=req.body;

const assessorId=
req.user.id_user||
req.user.id;

const cek=
await JadwalAsesor.findOne({

where:{
id_jadwal,
id_user:assessorId,
jenis_tugas:"komite_teknis",
status:"aktif"
}

});

if(!cek){

return res.status(403).json({
message:"anda bukan komite teknis"
});

}

const jadwal=
await Jadwal.findByPk(id_jadwal);

if(!jadwal){

return res.status(404).json({
message:"jadwal tidak ditemukan"
});

}

const fr=
await FrIa02.create({

id_jadwal,
id_skema:jadwal.id_skema,
id_tuk:jadwal.id_tuk,
id_asesor:assessorId,
id_asesi,
tanggal,
created_by:assessorId

});

if(details.length){

await FrIa02Detail.bulkCreate(
  details.map((d) => ({
    id_fr_ia_02: fr.id_fr_ia_02,
    id_kelompok: d.id_kelompok,

    kode_unit: d.kode_unit,
    judul_unit: d.judul_unit,
    urutan: d.urutan,

    skenario: d.skenario,
    langkah_kerja: d.langkah_kerja,   // tetap ada
    peralatan: d.peralatan,
    durasi: d.durasi,
  }))
);

}

if (validators.length) {

    await FrIa02Validator.bulkCreate(
        validators.map(v => ({
            id_fr_ia_02: fr.id_fr_ia_02,
            id_asesor: v.id_asesor,
            peran: v.peran,
            urutan: v.urutan
        }))
    );

}


// =============================
// Buat Header FR.IA.03 Otomatis
// =============================

const existingFrIa03 = await FrIa03.findOne({
    where: {
        id_jadwal
    }
});

if (!existingFrIa03) {
    try {
        await FrIa03.create({
            id_jadwal,
            id_skema: jadwal.id_skema,
            id_tuk: jadwal.id_tuk,
            id_asesor: assessorId,
            id_asesi,
            tanggal,
            created_by: assessorId
        });

        console.log("FRIA03 BERHASIL DIBUAT");
    } catch (err) {
        console.error("GAGAL CREATE FRIA03");
        console.error(err);
    }
}

res.json(fr);

}catch(err){

res.status(500).json({error:err.message});

}

};



exports.updateFrIa02=async(req,res)=>{
try{

const id=req.params.id;

console.log("UPDATE BODY", req.body);
await FrIa02.update({

id_asesi:req.body.id_asesi,

tanggal:req.body.tanggal,

updated_at:new Date()

},

{

where:{
id_fr_ia_02:id
}

}

);

const cek = await FrIa02.findByPk(id);

console.log("SETELAH UPDATE");
console.log(cek.toJSON());

await FrIa02Detail.destroy({

where:{
id_fr_ia_02:id
}

});

await FrIa02Validator.destroy({

where:{
id_fr_ia_02:id
}

});

if(req.body.details?.length){

await FrIa02Detail.bulkCreate(
  req.body.details.map((x) => ({
    id_fr_ia_02: id,
    id_kelompok: x.id_kelompok,
    kode_unit: x.kode_unit,
    judul_unit: x.judul_unit,
    urutan: x.urutan,
    skenario: x.skenario,
    langkah_kerja: x.langkah_kerja,
    peralatan: x.peralatan,
    durasi: x.durasi,
  }))
);

}

if(req.body.validators?.length){

await FrIa02Validator.bulkCreate(
req.body.validators.map(x=>({

id_fr_ia_02:id,

id_asesor:x.id_asesor,

peran:x.peran,

urutan:x.urutan

}))
);

}

res.json({
message:"updated"
});

}catch(err){

res.status(500).json({error:err.message});

}

};



exports.getByJadwal=async(req,res)=>{
try{

const data=
await FrIa02.findAll({

where:{
id_jadwal:req.params.id_jadwal
}

});

res.json(data);

}catch(err){

res.status(500).json({
error:err.message
});

}

};



exports.downloadPdf=async(req,res)=>{
try{

const data=
await FrIa02.findByPk(

req.params.id,

{

include:[

{
model:FrIa02Detail,
as:"detail",
include:[{
model:KelompokPekerjaan,
as:"kelompok"
}]
},

{
model:FrIa02Validator,
as:"validator",
include:[{
model:ProfileAsesor,
as:"asesor"
}]
},

{model:Skema,as:"skema"},
{model:Tuk,as:"tuk"},
{model:ProfileAsesor,as:"asesor"},
{model:ProfileAsesi,as:"asesi"}

]

}

);

if(!data){

return res.status(404).json({
message:"data tidak ditemukan"
});

}

const doc=new PDFDocument({
margin:40
});

res.setHeader(
"Content-Type",
"application/pdf"
);

res.setHeader(
"Content-Disposition",
`attachment; filename=FRIA02-${data.id_fr_ia_02}.pdf`
);

doc.pipe(res);

doc.fontSize(15)
.text(
"FR.IA.02 TUGAS PRAKTIK DEMONSTRASI",
{align:"center"}
);

doc.moveDown();

doc.text(`Skema : ${data.skema?.judul_skema||"-"}`);
doc.text(`TUK : ${data.tuk?.nama_tuk||"-"}`);
doc.text(`Asesor : ${data.asesor?.nama_lengkap||"-"}`);

(data.detail||[]).forEach((x,i)=>{

doc.moveDown();

doc.text(
`${i+1}. ${x.kelompok?.nama_kelompok||"-"}`
);

doc.text(
`Skenario : ${x.skenario||"-"}`
);

doc.text(
`Langkah : ${x.langkah_kerja||"-"}`
);

doc.text(
`Peralatan : ${x.peralatan||"-"}`
);

doc.text(
`Durasi : ${x.durasi||0}`
);

});

doc.end();

}catch(err){

res.status(500).json({
error:err.message
});

}

};



exports.deleteFrIa02=async(req,res)=>{
try{

const id=req.params.id;

await FrIa02Detail.destroy({
where:{id_fr_ia_02:id}
});

await FrIa02Validator.destroy({
where:{id_fr_ia_02:id}
});

await FrIa02.destroy({
where:{id_fr_ia_02:id}
});

res.json({
message:"deleted"
});

}catch(err){

res.status(500).json({
error:err.message
});

}

};