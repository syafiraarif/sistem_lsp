const {
FrIa01,FrIa01Detail,Jadwal,PesertaJadwal,
ProfileAsesor,UnitKompetensi,
UnitElemen,UnitKuk,SkemaUnit
}=require("../../models");
const PDFDocument=require("pdfkit");

exports.getTugasAsesor=async(req,res)=>{
  try{
    const data=await PesertaJadwal.findAll({
      where:{
        id_asesor:req.user.id
      },
      
      include:[
        {model:Jadwal,as:"jadwal"}
      ],
      
      order:[
        ["id_peserta","DESC"]
      ]
    });
    
    res.json(data);
  }catch(err){
    res.status(500).json({
      error:err.message
    });
  }
};

exports.getByPeserta=async(req,res)=>{
  try{
    const {
      id_jadwal,
      id_peserta
    }=req.query;
    
    const existing=await FrIa01.findOne({
      where:{
        id_jadwal,
        id_peserta,
        id_asesor:req.user.id_user || req.user.id
      },
      
      include:[{
        model:FrIa01Detail,
        as:"detail",
        include:[
          {model:UnitKompetensi,as:"unit"},
          {model:UnitElemen,as:"elemen"},
          {model:UnitKuk,as:"kuk"}
        ]
      }]
    });
    
    if(existing){
      return res.json(existing);
    }
    
    const jadwal=await Jadwal.findByPk(id_jadwal);
    if(!jadwal){
      return res.status(404).json({
        message:"Jadwal tidak ditemukan"
      });}
      
      const skemaUnit=await SkemaUnit.findAll({
        where:{
          id_skema:jadwal.id_skema
        },
        order:[
          ["urutan","ASC"]
        ]
      });

      const unitIds=skemaUnit.map(
        x=>x.id_unit
      );
      const units=await UnitKompetensi.findAll({
        where:{
          id_unit:unitIds
        },
        include:[{
          model:UnitElemen,
          as:"elemen",
          include:[{
            model:UnitKuk,
            as:"kuk"
          }]
        }]
      });
    
      const generated=[];
      for(const unit of units){
        for(const elemen of unit.elemen){
          for(const kuk of elemen.kuk){
            generated.push({
              id_unit:unit.id_unit,
              kode_unit:unit.kode_unit,
              judul_unit:unit.judul_unit,
              id_elemen:elemen.id_elemen,
              nama_elemen:elemen.nama_elemen,
              id_kuk:kuk.id_kuk,
              kuk:kuk.kuk,
              standar_industri:null,
              pencapaian:null,
              penilaian_lanjut:null});
            }
          }
        }
        res.json({
          generated:true,
          detail:generated
        });
      }catch(err){
        res.status(500).json({
          error:err.message
        });
      }
};



exports.create=async(req,res)=>{
try{

const {

id_jadwal,
id_peserta,
umpan_balik,
rekomendasi,
catatan_rekomendasi,
ttd_asesor,
detail

}=req.body;


const peserta=await PesertaJadwal.findOne({

where:{

id_peserta,

id_jadwal,

id_asesor:req.user.id_user || req.user.id

}

});


if(!peserta){

return res.status(404).json({

message:"Peserta bukan milik assessor"

});

}


const existing=await FrIa01.findOne({

where:{

id_jadwal,

id_peserta,

id_asesor:req.user.id_user || req.user.id

}

});


if(existing){

return res.status(400).json({

message:"FRIA01 sudah dibuat"

});

}


const header=await FrIa01.create({

id_jadwal,

id_peserta,

id_asesor:req.user.id_user || req.user.id,

umpan_balik,

rekomendasi,

catatan_rekomendasi,

ttd_asesor

});


await FrIa01Detail.bulkCreate(

detail.map(x=>({

id_fr_ia_01:header.id_fr_ia_01,

id_unit:x.id_unit,

id_elemen:x.id_elemen,

id_kuk:x.id_kuk,

standar_industri:x.standar_industri,

pencapaian:x.pencapaian,

penilaian_lanjut:x.penilaian_lanjut

}))

);


res.json({

message:"FRIA01 berhasil dibuat",

data:header

});

}catch(err){

res.status(500).json({

error:err.message

});

}

};



exports.update=async(req,res)=>{
try{

const id=req.params.id;

const current=await FrIa01.findOne({

where:{

id_fr_ia_01:id,

id_asesor:req.user.id_user || req.user.id

}

});


if(!current){

return res.status(404).json({

message:"FRIA01 tidak ditemukan"

});

}


const {

umpan_balik,
rekomendasi,
catatan_rekomendasi,
ttd_asesor,
detail

}=req.body;


await FrIa01.update({

umpan_balik,

rekomendasi,

catatan_rekomendasi,

ttd_asesor,

updated_at:new Date()

},

{

where:{

id_fr_ia_01:id,

id_asesor:req.user.id_user || req.user.id

}

}

);


await FrIa01Detail.destroy({

where:{
id_fr_ia_01:id
}

});


await FrIa01Detail.bulkCreate(

detail.map(x=>({

id_fr_ia_01:id,

id_unit:x.id_unit,

id_elemen:x.id_elemen,

id_kuk:x.id_kuk,

standar_industri:x.standar_industri,

pencapaian:x.pencapaian,

penilaian_lanjut:x.penilaian_lanjut

}))

);


res.json({

message:"updated"

});

}catch(err){

res.status(500).json({

error:err.message

});

}

};



exports.getById=async(req,res)=>{
try{

const data=await FrIa01.findByPk(

req.params.id,

{

include:[

{

model:FrIa01Detail,

as:"detail",

include:[

{model:UnitKompetensi,as:"unit"},

{model:UnitElemen,as:"elemen"},

{model:UnitKuk,as:"kuk"}

]

},

{model:Jadwal,as:"jadwal"},

{model:PesertaJadwal,as:"peserta"},

{model:ProfileAsesor,as:"asesor"}

]

}

);


if(!data){

return res.status(404).json({

message:"Data tidak ditemukan"

});

}


res.json(data);

}catch(err){

res.status(500).json({

error:err.message

});

}

};



exports.downloadPdf=async(req,res)=>{
try{

const data=await FrIa01.findByPk(

req.params.id,

{

include:[

{

model:FrIa01Detail,

as:"detail",

include:[

{model:UnitKompetensi,as:"unit"},

{model:UnitElemen,as:"elemen"},

{model:UnitKuk,as:"kuk"}

]

},

{model:ProfileAsesor,as:"asesor"},

{model:Jadwal,as:"jadwal"},

{model:PesertaJadwal,as:"peserta"}

]

}

);


if(!data){

return res.status(404).json({

message:"FRIA01 tidak ditemukan"

});

}


const doc=new PDFDocument({

margin:30,

size:"A4"

});


res.setHeader(
"Content-Type",
"application/pdf"
);

res.setHeader(
"Content-Disposition",
`inline; filename=FRIA01-${data.id_fr_ia_01}.pdf`
);


doc.pipe(res);


doc.fontSize(15)

.text("FR.IA.01 CL",{align:"center"})

.text("CEKLIS OBSERVASI",{align:"center"});


doc.moveDown();

doc.text(`Assessor : ${data.asesor?.nama_lengkap||"-"}`);

doc.text(`Peserta : ${data.peserta?.nomor_peserta||"-"}`);

doc.text(`Jadwal : ${data.jadwal?.nama_kegiatan||"-"}`);

doc.moveDown();


let currentUnit=null;


data.detail.forEach((x,i)=>{

if(currentUnit!==x.id_unit){

currentUnit=x.id_unit;

doc.moveDown()

.text(

`${x.unit?.kode_unit||""} - ${x.unit?.judul_unit||""}`

);

}


doc.fontSize(9)

.text(`${i+1}. ${x.elemen?.nama_elemen||"-"}`)

.text(x.kuk?.kuk||"-")

.text(`Standar : ${x.standar_industri||"-"}`)

.text(`Pencapaian : ${x.pencapaian||"-"}`)

.text(`Lanjut : ${x.penilaian_lanjut||"-"}`);

});


doc.moveDown()

.text(`Feedback : ${data.umpan_balik||"-"}`)

.text(`Rekomendasi : ${data.rekomendasi||"-"}`)

.text(data.asesor?.nama_lengkap||"-");


doc.end();

}catch(err){

res.status(500).json({

error:err.message

});

}

};