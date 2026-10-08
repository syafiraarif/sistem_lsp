import React, { useState } from "react";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";

export default function JadwalKomiteTeknis() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="min-h-screen lg:ml-24" />
    </div>
  );
}
