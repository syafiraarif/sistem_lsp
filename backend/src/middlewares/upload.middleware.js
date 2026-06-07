const multer = require("multer");
const path = require("path");
const fs = require("fs");


/*
=====================================
CREATE DIRECTORY
=====================================
*/

const ensureDir = (dir) => {

if(!fs.existsSync(dir)){

fs.mkdirSync(
dir,
{
recursive:true
}
);

}

};



/*
=====================================
STORAGE CONFIG
=====================================
*/

const storage =
multer.diskStorage({

destination:
(req,file,cb)=>{

const field =
file.fieldname;

let folder =
"uploads";

switch(field){

/*
=====================
TTD
=====================
*/

case "ttd":

case "ttd_presensi":

folder=

req.user?.role==="asesor"

? path.join(
"uploads",
"asesor",
"ttd"
)

: path.join(
"uploads",
"asesi",
"ttd"
);

break;


/*
=====================
FOTO PROFIL
=====================
*/

case "foto_profil":

folder=

req.user?.role==="asesor"

? path.join(
"uploads",
"asesor",
"foto_profil"
)

: path.join(
"uploads",
"asesi",
"dokumen",
"foto_profil"
);

break;


/*
=====================
APL01
=====================
*/

case "file_dokumen_apl01":

folder=

path.join(

"uploads",

"asesi",

"apl01",

"dokumen",

`apl01_${
req.body.id_apl01
|| "umum"
}`

);

break;


/*
=====================
APL02
=====================
*/

case "file_bukti":

folder=

path.join(

"uploads",

"asesi",

"apl02",

"bukti",

`detail_${
req.body.id_detail
|| "umum"
}`

);

break;


/*
=====================
TUK
=====================
*/

case "foto":

folder=
path.join(
"uploads",
"tuk",
"foto_profile"
);

break;

case "surat_keputusan":

folder=
path.join(
"uploads",
"tuk",
"dokumen"
);

break;

default:

folder=
"uploads";

}

ensureDir(
folder
);

cb(
null,
folder
);

},



filename:
(req,file,cb)=>{

const ext=

path.extname(
file.originalname
);

const timestamp=
Date.now();

let filename=

`${timestamp}_${file.originalname.replace(/\s+/g,"_")}`;


/*
APL01 custom name
*/

if(
file.fieldname===
"file_dokumen_apl01"
){

filename=

`apl01_${
req.body.id_apl01
|| "x"
}_${timestamp}${ext}`;

}


/*
APL02 custom name
*/

if(
file.fieldname===
"file_bukti"
){

filename=

`apl02_${
req.body.id_detail
|| "x"
}_${timestamp}${ext}`;

}

cb(
null,
filename
);

}

});



/*
=====================================
UPLOAD CONFIG
=====================================
*/

const upload =
multer({

storage,

limits:{

fileSize:
10 * 1024 * 1024,

files:
10

},

fileFilter:
(req,file,cb)=>{

const allowedMime=[

"application/pdf",

"image/jpeg",

"image/jpg",

"image/png"

];

const allowedExt=[

".pdf",

".jpg",

".jpeg",

".png"

];

const ext=
path.extname(
file.originalname
).toLowerCase();

if(

allowedMime.includes(
file.mimetype
)

&&

allowedExt.includes(
ext
)

){

return cb(
null,
true
);

}

return cb(

new Error(

"Hanya PDF, JPG, JPEG, PNG yang diperbolehkan"

)

);

}

});



/*
=====================================
FIELDS CONFIG
=====================================
*/

const uploadMiddleware =
upload.fields([

{
name:"file_dokumen",
maxCount:1
},

{
name:"file_dokumen_apl01",
maxCount:1
},

{
name:"file_bukti",
maxCount:1
},

{
name:"file_pendukung",
maxCount:1
},

{
name:"dokumen_tambahan",
maxCount:10
},

{
name:"tanda_tangan",
maxCount:1
},

{
name:"bukti_bayar",
maxCount:1
},

{
name:"ttd",
maxCount:1
},

{
name:"ttd_presensi",
maxCount:1
},

{
name:"foto_profil",
maxCount:1
},

{
name:"foto",
maxCount:1
},

{
name:"surat_keputusan",
maxCount:1
}

]);


module.exports =
uploadMiddleware;