const { PresensiPraAsesmen, User, JadwalAsesor, Jadwal, Skema, Tuk, ProfileAsesi, ProfileAsesor, PesertaJadwal } = require("../../models");
const response = require("../../utils/response.util");
const PDFDocument = require('pdfkit');
const path = require('path');

// 1. Ambil Data Form (Asesi)
exports.getFormData = async (req, res) => {
    try {
        const id_user_asesi = req.user.id_user;

        const peserta = await PesertaJadwal.findOne({
            where: { id_user: id_user_asesi },
            include: [
                { model: Jadwal, as: 'jadwal', where: { status: 'ongoing' }, include: [{ model: Skema, as: 'skema' }, { model: Tuk, as: 'tuk' }] },
                { model: User, as: 'user', include: [{ model: ProfileAsesi, as: 'profileAsesi' }] }
            ]
        });
        if (!peserta) return response.error(res, "Anda tidak memiliki jadwal aktif", 404);

        const presensi = await PresensiPraAsesmen.findOne({ where: { id_peserta: peserta.id_peserta } });
        const asesiProfile = await ProfileAsesi.findOne({ where: { id_user: id_user_asesi } });

        // Ambil semua asesor di jadwal ini (untuk ditampilkan di form)
        const allAsesors = await JadwalAsesor.findAll({
            where: { id_jadwal: peserta.id_jadwal, status: 'aktif' },
            include: [{ model: User, as: 'user', include: [{ model: ProfileAsesor, as: 'profileAsesor' }] }]
        });

        const namaAsesorList = allAsesors.map(a => a.user?.profileAsesor?.nama_lengkap || a.user?.username).join('; ');

        response.success(res, "Data form berhasil diambil", {
            id_peserta: peserta.id_peserta,
            id_jadwal: peserta.id_jadwal,
            skema_sertifikasi: { jenis: peserta.jadwal.skema.jenis_skema, judul: peserta.jadwal.skema.judul_skema, nomor: peserta.jadwal.skema.kode_skema },
            tuk: { jenis: peserta.jadwal.tuk.jenis_tuk, nama: peserta.jadwal.tuk.nama_tuk },
            nama_asesor: namaAsesorList,
            nama_asesi: peserta.user.profileAsesi?.nama_lengkap || peserta.user.username,
            jadwal_pelaksanaan: {
                hari_tanggal: peserta.jadwal.tgl_pra_asesmen ? new Date(peserta.jadwal.tgl_pra_asesmen).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-',
                tempat: peserta.jadwal.tuk.nama_tuk
            },
            ttd_asesi_ready: !!asesiProfile?.ttd_path,
            is_submitted: !!presensi,
            current_data: presensi || null
        });
    } catch (err) { response.error(res, err.message); }
};

// 2. Submit Form (Asesi TTD dari Profile)
exports.submitForm = async (req, res) => {
    try {
        const id_user_asesi = req.user.id_user;
        const { id_peserta, catatan } = req.body;
        if (!id_peserta) return response.error(res, "ID Peserta wajib diisi", 400);

        const peserta = await PesertaJadwal.findOne({ where: { id_peserta, id_user: id_user_asesi } });
        if (!peserta) return response.error(res, "Peserta tidak ditemukan", 404);

        const asesiProfile = await ProfileAsesi.findOne({ where: { id_user: id_user_asesi } });
        if (!asesiProfile?.ttd_path) return response.error(res, "Profile Asesi belum punya TTD", 400);

        const [presensi] = await PresensiPraAsesmen.upsert({
            id_peserta,
            ttd_asesi_status: 'ditandatangani',
            ttd_asesi_tanggal: new Date(),
            catatan: catatan || 'Hadir'
        }, { where: { id_peserta }, defaults: {} });

        if (peserta.status_asesmen === 'terdaftar') {
            await PesertaJadwal.update({ status_asesmen: 'pra_asesmen' }, { where: { id_peserta } });
        }

        response.success(res, "Presensi berhasil disimpan", presensi);
    } catch (err) { response.error(res, err.message); }
};

// 3. Download PDF (TTD Asesor di Jadwal + TTD Asesi Sendiri)
exports.downloadPdf = async (req, res) => {
    try {
        const id_user_asesi = req.user.id_user;

        const peserta = await PesertaJadwal.findOne({
            where: { id_user: id_user_asesi },
            include: [{ model: Jadwal, as: 'jadwal', include: [{ model: Skema, as: 'skema' }, { model: Tuk, as: 'tuk' }] }]
        });
        if (!peserta) return response.error(res, "Tidak ada jadwal aktif", 404);

        const presensi = await PresensiPraAsesmen.findOne({ where: { id_peserta: peserta.id_peserta } });
        const asesiProfile = await ProfileAsesi.findOne({ where: { id_user: id_user_asesi } });

        // Ambil semua asesor di jadwal yang sama (untuk TTD)
        const allAsesors = await JadwalAsesor.findAll({
            where: { id_jadwal: peserta.id_jadwal, status: 'aktif' },
            include: [{ model: User, as: 'user', include: [{ model: ProfileAsesor, as: 'profileAsesor' }] }]
        });

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Form-Pra-Asesmen.pdf"');
        doc.pipe(res);

        // Header
        doc.fontSize(14).text('FORMULIR PRESENSI PRA ASESMEN', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(10);
        doc.text(`Skema Sertifikasi: ${peserta.jadwal.skema.jenis_skema} - ${peserta.jadwal.skema.judul_skema}`);
        doc.text(`Nomor: ${peserta.jadwal.skema.kode_skema}`);
        doc.text(`TUK: ${peserta.jadwal.tuk.jenis_tuk} - ${peserta.jadwal.tuk.nama_tuk}`);
        
        const namaAsesor = allAsesors.map(a => a.user?.profileAsesor?.nama_lengkap || a.user?.username).join('; ');
        doc.text(`Nama Asesor: ${namaAsesor}`);
        doc.text(`Nama Asesi: ${asesiProfile?.nama_lengkap || req.user.username}`);
        doc.text(`Jadwal Pelaksanaan: ${new Date(peserta.jadwal.tgl_pra_asesmen).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`);
        if(presensi?.catatan) doc.text(`Keterangan: ${presensi.catatan}`);

        doc.moveDown(2);

        // TTD Asesor (Kiri)
        doc.text('Tanda Tangan Asesor:', 50, doc.y);
        const ttdAsesorPath = allAsesors.find(a => a.user?.profileAsesor?.ttd_path)?.user?.profileAsesor?.ttd_path;
        if (ttdAsesorPath) doc.image(path.join(__dirname, '../../uploads', ttdAsesorPath), 50, doc.y + 10, { width: 100, height: 50 });
        else doc.text('(Belum Ada TTD)', 50, doc.y + 20);

        // TTD Asesi (Kanan)
        doc.text('Tanda Tangan Asesi:', 350, doc.y - 70);
        if (asesiProfile?.ttd_path) doc.image(path.join(__dirname, '../../uploads', asesiProfile.ttd_path), 350, doc.y - 60, { width: 100, height: 50 });
        else doc.text('(Belum Ada TTD)', 350, doc.y - 60);

        doc.end();
    } catch (err) { response.error(res, err.message); }
};