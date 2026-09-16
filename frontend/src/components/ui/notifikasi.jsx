import Swal from "sweetalert2";

const baseClass = {
  popup: "rounded-[30px] border border-slate-100 bg-white p-2 shadow-2xl",
  title: "px-5 pt-4 text-2xl font-black text-[#071E3D]",
  htmlContainer: "px-5 text-sm font-medium leading-relaxed text-slate-500",
  actions: "gap-3 px-5 pb-5",
  confirmButton: "m-0 min-w-[130px] rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]",
  cancelButton: "m-0 min-w-[110px] rounded-2xl bg-[#071E3D] px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800",
  denyButton: "m-0 min-w-[130px] rounded-2xl bg-red-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600",
  closeButton: "text-slate-400 hover:text-red-500"
};

const modal = Swal.mixin({
  buttonsStyling: false,
  customClass: baseClass,
  showCloseButton: true,
  allowOutsideClick: true,
  allowEscapeKey: true
});

const notifikasi = {
  sukses(title = "Berhasil", text = "Proses berhasil dilakukan.") {
    return modal.fire({
      title,
      text,
      icon: "success",
      confirmButtonText: "Mengerti",
      timer: 1800,
      timerProgressBar: true
    });
  },
  gagal(title = "Gagal", text = "Terjadi kesalahan saat memproses data.") {
    return modal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "Mengerti"
    });
  },
  peringatan(title = "Peringatan", text = "Periksa kembali data yang dimasukkan.") {
    return modal.fire({
      title,
      text,
      icon: "warning",
      confirmButtonText: "Mengerti"
    });
  },
  info(title = "Informasi", text = "Informasi sistem.") {
    return modal.fire({
      title,
      text,
      icon: "info",
      confirmButtonText: "Mengerti"
    });
  },
  konfirmasi(
    title = "Konfirmasi",
    text = "Apakah Anda yakin?",
    confirmButtonText = "Ya, Lanjutkan!",
    cancelButtonText = "Batal",
    icon = "question",
    variant = "primary"
  ) {
    return modal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
      customClass: {
        ...baseClass,
        confirmButton:
          variant === "danger"
            ? baseClass.denyButton
            : baseClass.confirmButton
      }
    });
  }
};

export { notifikasi };
export default notifikasi;