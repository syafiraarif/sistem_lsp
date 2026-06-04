const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HasilKeputusanAsesmen =
sequelize.define(

"hasil_keputusan_asesmen",

{

id_keputusan:{

type:
DataTypes.INTEGER,

primaryKey:true,

autoIncrement:true

},

id_peserta:{

type:
DataTypes.INTEGER,

allowNull:false

},

id_jadwal:{

type:
DataTypes.INTEGER,

allowNull:false

},

id_asesor:{

type:
DataTypes.INTEGER,

allowNull:false

},

hasil:{

type:
DataTypes.ENUM(

"kompeten",

"belum_kompeten"

),

allowNull:false

},

catatan_asesor:{

type:
DataTypes.TEXT,

allowNull:true

},

tanggal_keputusan:{

type:
DataTypes.DATE,

defaultValue:
DataTypes.NOW

},

created_at:{

type:
DataTypes.DATE,

defaultValue:
DataTypes.NOW

},

updated_at:{

type:
DataTypes.DATE,

defaultValue:
DataTypes.NOW

}

},

{

tableName:
"hasil_keputusan_asesmen",

timestamps:false

}

);

module.exports=
HasilKeputusanAsesmen;