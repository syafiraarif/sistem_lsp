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
ProfileAsesi,
PesertaJadwal
} = require("../../models");

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
      {
        model: KelompokPekerjaan,
        as: "kelompok",
      },
    ],
      order: [["urutan", "ASC"]],
    });

    const unit = mapping.map((item) => ({
      id_unit: item.unit.id_unit,
      kode_unit: item.unit.kode_unit,
      judul_unit: item.unit.judul_unit,
      id_kelompok: item.id_kelompok,
      nama_kelompok: item.kelompok?.nama_kelompok,
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

// =============================
// AUTO CREATE HEADER FRIA03
// =============================

const existingFrIa03 = await FrIa03.findOne({
    where: {
        id_jadwal: cek.id_jadwal
    }
});

if (!existingFrIa03) {

    try {

        console.log("CREATE HEADER FRIA03 DARI UPDATE");

        await FrIa03.create({

            id_jadwal: cek.id_jadwal,
            id_skema: cek.id_skema,
            id_tuk: cek.id_tuk,
            id_asesor: cek.id_asesor,
            id_asesi: cek.id_asesi,
            tanggal: cek.tanggal,
            created_by: cek.created_by

        });

        console.log("HEADER FRIA03 BERHASIL");

    } catch (err) {

        console.error("GAGAL CREATE HEADER FRIA03");
        console.error(err);

    }

}

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

const getPengujiContext = async (req, idJadwal, idPeserta) => {
  const assessorId = req.user.id_user || req.user.id;
  const assignment = await JadwalAsesor.findOne({
    where: {
      id_jadwal: idJadwal,
      id_user: assessorId,
      jenis_tugas: "asesor_penguji",
      status: "aktif"
    }
  });

  if (!assignment) {
    const error = new Error("Anda bukan asesor penguji pada jadwal ini");
    error.status = 403;
    throw error;
  }

  const peserta = await PesertaJadwal.findOne({
    where: {
      id_peserta: idPeserta,
      id_jadwal: idJadwal
    }
  });

  if (!peserta) {
    const error = new Error("Peserta tidak ditemukan pada jadwal ini");
    error.status = 404;
    throw error;
  }

  return { assessorId, peserta };
};

const findCommitteeSource = async (idJadwal, idUserAsesi) => {
  const committeeAssignments = await JadwalAsesor.findAll({
    where: {
      id_jadwal: idJadwal,
      jenis_tugas: "komite_teknis",
      status: "aktif"
    },
    attributes: ["id_user"]
  });

  const committeeIds = committeeAssignments.map((item) => item.id_user);

  if (!committeeIds.length) {
    return null;
  }

  return FrIa02.findOne({
    where: {
      id_jadwal: idJadwal,
      id_asesi: idUserAsesi,
      id_asesor: committeeIds
    },
    include: [
      {
        model: FrIa02Detail,
        as: "detail",
        include: [{ model: KelompokPekerjaan, as: "kelompok" }]
      },
      {
        model: FrIa02Validator,
        as: "validator",
        include: [{
          model: ProfileAsesor,
          as: "asesor",
          attributes: ["id_user", "nama_lengkap", "no_lisensi", "ttd_path"]
        }]
      }
    ],
    order: [["created_at", "DESC"]]
  });
};

const findPengujiRecord = async (idJadwal, idUserAsesi, assessorId) => {
  return FrIa02.findOne({
    where: {
      id_jadwal: idJadwal,
      id_asesi: idUserAsesi,
      id_asesor: assessorId
    },
    include: [
      {
        model: FrIa02Detail,
        as: "detail",
        include: [{ model: KelompokPekerjaan, as: "kelompok" }]
      },
      {
        model: FrIa02Validator,
        as: "validator",
        include: [{
          model: ProfileAsesor,
          as: "asesor",
          attributes: ["id_user", "nama_lengkap", "no_lisensi", "ttd_path"]
        }]
      }
    ],
    order: [["created_at", "DESC"]]
  });
};

const formatFrIa02Penguji = async (record, idJadwal, idUserAsesi, assessorId, approved) => {
  if (!record) {
    return null;
  }

  const jadwal = await Jadwal.findByPk(idJadwal, {
    include: [
      { model: Skema, as: "skema" },
      { model: Tuk, as: "tuk" }
    ]
  });

  const asesor = await ProfileAsesor.findByPk(assessorId, {
    attributes: ["id_user", "nama_lengkap", "no_reg_asesor", "ttd_path"]
  });

  const asesi = await ProfileAsesi.findByPk(idUserAsesi, {
    attributes: ["id_user", "nama_lengkap", "ttd_path"]
  });

  const groups = [];
  const groupIndex = new Map();

  for (const item of record.detail || []) {
    const key = String(item.id_kelompok);

    if (!groupIndex.has(key)) {
      const group = {
        id_kelompok: item.id_kelompok,
        kelompok_pekerjaan: item.kelompok?.nama_kelompok || "-",
        units: [],
        skenario_tugas: item.skenario || "",
        langkah_kerja: item.langkah_kerja || "",
        perlengkapan_peralatan: item.peralatan || "",
        waktu: item.durasi || ""
      };
      groupIndex.set(key, groups.length);
      groups.push(group);
    }

    const group = groups[groupIndex.get(key)];
    group.units.push({
      kode_unit: item.kode_unit || "",
      judul_unit: item.judul_unit || "",
      urutan: item.urutan || group.units.length + 1
    });

    if (!group.skenario_tugas) group.skenario_tugas = item.skenario || "";
    if (!group.langkah_kerja) group.langkah_kerja = item.langkah_kerja || "";
    if (!group.perlengkapan_peralatan) group.perlengkapan_peralatan = item.peralatan || "";
    if (!group.waktu) group.waktu = item.durasi || "";
  }

  const penyusun = [];
  const validator = [];

  for (const item of record.validator || []) {
    const reviewer = {
      id_user: item.id_asesor,
      nama: item.asesor?.nama_lengkap || "",
      nomor_met: item.asesor?.no_lisensi || "",
      ttd: item.asesor?.ttd_path || "",
      tanggal: record.tanggal || ""
    };

    if (item.peran === "penyusun") {
      penyusun.push(reviewer);
    } else {
      validator.push(reviewer);
    }
  }

  return {
    id_fr_ia_02: record.id_fr_ia_02,
    approved,
    tanggal: record.tanggal || "",
    skema: jadwal?.skema || {},
    tuk: jadwal?.tuk?.nama_tuk || jadwal?.tuk?.nama || "",
    nama_asesor: asesor?.nama_lengkap || "",
    no_reg_asesor: asesor?.no_reg_asesor || "",
    ttd_asesor: asesor?.ttd_path || "",
    nama_asesi: asesi?.nama_lengkap || "",
    ttd_asesi: asesi?.ttd_path || "",
    kelompok: groups,
    penyusun,
    validator
  };
};

exports.getFrIa02Penguji = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.params;
    const { assessorId, peserta } = await getPengujiContext(req, id_jadwal, id_peserta);

    let record = await findPengujiRecord(id_jadwal, peserta.id_user, assessorId);
    let approved = Boolean(record);

    if (!record) {
      record = await findCommitteeSource(id_jadwal, peserta.id_user);
      approved = false;
    }

    if (!record) {
      return res.status(404).json({
        message: "FR.IA.02 dari Komite Teknis belum tersedia untuk peserta ini"
      });
    }

    const result = await formatFrIa02Penguji(
      record,
      id_jadwal,
      peserta.id_user,
      assessorId,
      approved
    );

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Gagal memuat FR.IA.02 Penguji"
    });
  }
};

exports.accFrIa02Penguji = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.params;
    const { assessorId, peserta } = await getPengujiContext(req, id_jadwal, id_peserta);
    const source = await findCommitteeSource(id_jadwal, peserta.id_user);

    if (!source) {
      return res.status(404).json({
        message: "FR.IA.02 Komite Teknis belum tersedia untuk peserta ini"
      });
    }

    let target = await findPengujiRecord(id_jadwal, peserta.id_user, assessorId);

    if (!target) {
      target = await FrIa02.create({
        id_jadwal: Number(id_jadwal),
        id_skema: source.id_skema,
        id_tuk: source.id_tuk,
        id_asesor: assessorId,
        id_asesi: peserta.id_user,
        tanggal: source.tanggal,
        created_by: assessorId
      });
    } else {
      await target.update({
        id_skema: source.id_skema,
        id_tuk: source.id_tuk,
        tanggal: source.tanggal,
        updated_at: new Date()
      });
    }

    await FrIa02Detail.destroy({
      where: { id_fr_ia_02: target.id_fr_ia_02 }
    });

    await FrIa02Validator.destroy({
      where: { id_fr_ia_02: target.id_fr_ia_02 }
    });

    if ((source.detail || []).length) {
      await FrIa02Detail.bulkCreate(
        source.detail.map((item) => ({
          id_fr_ia_02: target.id_fr_ia_02,
          id_kelompok: item.id_kelompok,
          kode_unit: item.kode_unit,
          judul_unit: item.judul_unit,
          urutan: item.urutan,
          skenario: item.skenario,
          langkah_kerja: item.langkah_kerja,
          peralatan: item.peralatan,
          durasi: item.durasi
        }))
      );
    }

    if ((source.validator || []).length) {
      await FrIa02Validator.bulkCreate(
        source.validator.map((item) => ({
          id_fr_ia_02: target.id_fr_ia_02,
          id_asesor: item.id_asesor,
          peran: item.peran,
          urutan: item.urutan
        }))
      );
    }

    const result = await formatFrIa02Penguji(
      target,
      id_jadwal,
      peserta.id_user,
      assessorId,
      true
    );

    res.json({
      message: "FR.IA.02 berhasil di-ACC",
      data: result
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Gagal melakukan ACC FR.IA.02"
    });
  }
};

