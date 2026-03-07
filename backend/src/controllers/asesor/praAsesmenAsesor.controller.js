const { PresensiPraAsesmen, User, JadwalAsesor, Jadwal, Skema, Tuk, ProfileAsesi, ProfileAsesor, PesertaJadwal } = require("../../models");
const response = require("../../utils/response.util");
const PDFDocument = require('pdfkit');
const path = require('path');

exports.getFormData = async (req, res) => {
    try {
        const { id_user: id_asesi } = req.params;
        const id_user_asesor = req.user.id_user;

        const jadwalAsesor = await JadwalAsesor.findOne({
            where: { id_user: id_user_asesor, jenis_tugas: 'asesor_penguji', status: 'aktif' },
            include: [{ model: Jadwal, as: 'jadwal', where: { status: 'ongoing' }, include: [{ model: Skema, as: 'skema' }, { model: Tuk, as: 'tuk' }] }]
        });
        if (!jadwalAsesor) return response.error(res, "Tidak ada jadwal aktif", 403);

        const peserta = await PesertaJadwal.findOne({
            where: { id_jadwal: jadwalAsesor.id_jadwal, id_user: id_asesi },
            include: [{ model: User, as: 'user', include: [{ model: ProfileAsesi, as: 'profileAsesi' }] }]
        });
        if (!peserta) return response.error(res, "Asesi tidak terdaftar di jadwal ini", 404);

        const [asesiProfile, asesorProfile, allAsesors, presensi] = await Promise.all([
            ProfileAsesi.findOne({ where: { id_user: id_asesi } }),
            ProfileAsesor.findOne({ where: { id_user: id_user_asesor } }),
            JadwalAsesor.findAll({ where: { id_jadwal: jadwalAsesor.id_jadwal, status: 'aktif' }, include: [{ model: User, as: 'user', include: [{ model: ProfileAsesor, as: 'profileAsesor' }] }] }),
            PresensiPraAsesmen.findOne({ where: { id_peserta: peserta.id_peserta } })
        ]);

        const namaAsesorList = allAsesors.map(a => {
            const p = a.user?.profileAsesor;
            return p?.gelar_depan ? `${p.gelar_depan} ${p.nama_lengkap}` : (p?.nama_lengkap || a.user?.username);
        }).join('; ');

        const tglPra = jadwalAsesor.jadwal.tgl_pra_asesmen 
            ? new Date(jadwalAsesor.jadwal.tgl_pra_asesmen).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-';

        response.success(res, "Data form berhasil diambil", {
            id_peserta: peserta.id_peserta,
            id_jadwal: jadwalAsesor.id_jadwal,
            skema_sertifikasi: { jenis: jadwalAsesor.jadwal.skema.jenis_skema, judul: jadwalAsesor.jadwal.skema.judul_skema, nomor: jadwalAsesor.jadwal.skema.kode_skema },
            tuk: { jenis: jadwalAsesor.jadwal.tuk.jenis_tuk, nama: jadwalAsesor.jadwal.tuk.nama_tuk },
            nama_asesor: namaAsesorList,
            nama_asesi: peserta.user.profileAsesi?.nama_lengkap || peserta.user.username,
            jadwal_pelaksanaan: { hari_tanggal: tglPra, tempat: jadwalAsesor.jadwal.tuk.nama_tuk },
            ttd_asesor_ready: !!asesorProfile?.ttd_path,
            ttd_asesi_ready: !!asesiProfile?.ttd_path,
            is_submitted: !!presensi,
            current_data: presensi || null
        });
    } catch (err) { response.error(res, err.message); }
};

exports.submitForm = async (req, res) => {
    try {
        const { id_peserta, catatan } = req.body;
        const id_user_asesor = req.user.id_user;
        if (!id_peserta) return response.error(res, "ID Peserta wajib diisi", 400);

        const jadwalAsesor = await JadwalAsesor.findOne({ where: { id_user: id_user_asesor, status: 'aktif', jenis_tugas: 'asesor_penguji' } });
        if (!jadwalAsesor) return response.error(res, "Anda tidak berhak", 403);

        const peserta = await PesertaJadwal.findOne({ where: { id_peserta, id_jadwal: jadwalAsesor.id_jadwal } });
        if (!peserta) return response.error(res, "Peserta tidak ditemukan", 404);

        const asesorProfile = await ProfileAsesor.findOne({ where: { id_user: id_user_asesor } });
        if (!asesorProfile?.ttd_path) return response.error(res, "Profile Asesor belum punya TTD", 400);

        const [presensi] = await PresensiPraAsesmen.upsert({
            id_peserta, ttd_asesor_status: 'ditandatangani', ttd_asesor_tanggal: new Date(), catatan: catatan || 'Hadir'
        }, { where: { id_peserta }, defaults: {} });

        if (peserta.status_asesmen === 'terdaftar') {
            await PesertaJadwal.update({ status_asesmen: 'pra_asesmen' }, { where: { id_peserta } });
        }

        response.success(res, "Presensi berhasil disimpan", presensi);
    } catch (err) { response.error(res, err.message); }
};

exports.downloadPdf = async (req, res) => {
    try {
        const { id_user: id_asesi } = req.params;
        const id_user_asesor = req.user.id_user;

        const jadwalAsesor = await JadwalAsesor.findOne({
            where: { id_user: id_user_asesor, status: 'aktif', jenis_tugas: 'asesor_penguji' },
            include: [{ model: Jadwal, as: 'jadwal', include: [{ model: Skema, as: 'skema' }, { model: Tuk, as: 'tuk' }] }]
        });
        if (!jadwalAsesor) return response.error(res, "Jadwal tidak ditemukan", 404);

        const peserta = await PesertaJadwal.findOne({
            where: { id_jadwal: jadwalAsesor.id_jadwal, id_user: id_asesi },
            include: [{ model: User, as: 'user', include: [{ model: ProfileAsesi, as: 'profileAsesi' }] }]
        });
        if (!peserta) return response.error(res, "Peserta tidak ditemukan", 404);

        const presensi = await PresensiPraAsesmen.findOne({ where: { id_peserta: peserta.id_peserta } });
        
        const allAsesors = await JadwalAsesor.findAll({
            where: { id_jadwal: jadwalAsesor.id_jadwal, status: 'aktif' },
            include: [{ model: User, as: 'user', include: [{ model: ProfileAsesor, as: 'profileAsesor' }] }]
        });

        const asesiProfile = await ProfileAsesi.findOne({ where: { id_user: id_asesi } });
        
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Form-Pra-Asesmen.pdf"');
        doc.pipe(res);
        doc.fontSize(14).text('FORMULIR PRESENSI PRA ASESMEN', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(10);
        doc.text(`Skema Sertifikasi: ${jadwalAsesor.jadwal.skema.jenis_skema} - ${jadwalAsesor.jadwal.skema.judul_skema}`);
        doc.text(`Nomor: ${jadwalAsesor.jadwal.skema.kode_skema}`);
        doc.text(`TUK: ${jadwalAsesor.jadwal.tuk.jenis_tuk} - ${jadwalAsesor.jadwal.tuk.nama_tuk}`);
        const namaAsesor = allAsesors.map(a => a.user?.profileAsesor?.nama_lengkap || a.user?.username).join('; ');
        doc.text(`Nama Asesor: ${namaAsesor}`);
        doc.text(`Nama Asesi: ${peserta.user.profileAsesi?.nama_lengkap || peserta.user.username}`);
        doc.text(`Jadwal Pelaksanaan: ${new Date(jadwalAsesor.jadwal.tgl_pra_asesmen).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`);
        if(presensi?.catatan) doc.text(`Keterangan: ${presensi.catatan}`);

        doc.moveDown(2);

        doc.text('Tanda Tangan Asesi:', 50, doc.y);
        if (asesiProfile?.ttd_path) doc.image(path.join(__dirname, '../../uploads', asesiProfile.ttd_path), 50, doc.y + 10, { width: 100, height: 50 });
        else doc.text('(Belum Ada TTD)', 50, doc.y + 20);
        const ttdAsesorPath = allAsesors.find(a => a.user?.profileAsesor?.ttd_path)?.user?.profileAsesor?.ttd_path;
        doc.text('Tanda Tangan Asesor:', 350, doc.y - 70);
        if (ttdAsesorPath) doc.image(path.join(__dirname, '../../uploads', ttdAsesorPath), 350, doc.y - 60, { width: 100, height: 50 });
        else doc.text('(Belum Ada TTD)', 350, doc.y - 60);

        doc.end();
    } catch (err) { response.error(res, err.message); }
};