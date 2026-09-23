import Swal from "sweetalert2";

const baseClass = {
  popup: "rounded-lg border border-slate-200 bg-white p-5 shadow-lg",
  title: "px-3 pt-2 text-[22px] font-bold text-[#071E3D]",
  htmlContainer: "px-3 text-[14px] font-medium leading-relaxed text-slate-500",
  actions: "gap-2 px-3 pb-2",
  confirmButton:
    "m-0 min-w-[100px] rounded-md bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#A8561F]",
  cancelButton:
    "m-0 min-w-[90px] rounded-md border border-slate-300 bg-white px-5 py-2.5 text-[13px] font-bold text-[#071E3D] transition-colors hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white",
  denyButton:
    "m-0 min-w-[100px] rounded-md bg-red-500 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-red-600",
  closeButton:
    "text-slate-400 transition-colors hover:text-red-500",
  icon: "mt-2",
};

const modal = Swal.mixin({
  buttonsStyling: false,
  customClass: baseClass,
  showCloseButton: false,
  allowOutsideClick: true,
  allowEscapeKey: true,
  focusConfirm: false,
});

const notifikasi = {
  sukses(
    title = "Berhasil",
    text = "Proses berhasil dilakukan."
  ) {
    return modal.fire({
      title,
      text,
      icon: "success",
      confirmButtonText: "Mengerti",
      confirmButtonColor: "#CC6B27",
      timer: 1800,
      timerProgressBar: true,
    });
  },

  gagal(
    title = "Gagal",
    text = "Terjadi kesalahan saat memproses data."
  ) {
    return modal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "Mengerti",
      confirmButtonColor: "#CC6B27",
    });
  },

  peringatan(
    title = "Peringatan",
    text = "Periksa kembali data yang dimasukkan."
  ) {
    return modal.fire({
      title,
      text,
      icon: "warning",
      confirmButtonText: "Mengerti",
      confirmButtonColor: "#CC6B27",
    });
  },

  info(
    title = "Informasi",
    text = "Informasi sistem."
  ) {
    return modal.fire({
      title,
      text,
      icon: "info",
      confirmButtonText: "Mengerti",
      confirmButtonColor: "#CC6B27",
    });
  },

  konfirmasi(
    title = "Konfirmasi",
    text = "Apakah Anda yakin?",
    confirmButtonText = "Ya, Lanjutkan",
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
            : baseClass.confirmButton,
      },
    });
  },
};

export { notifikasi };
export default notifikasi;