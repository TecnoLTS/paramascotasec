"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [now, setNow] = useState("");

  useEffect(() => {
    const date = new Date();
    setNow(date.toLocaleString());
  }, []);

  return (
    <main className="page">
      <section className="card">
        <p className="pill">example.com</p>
        <h1>Ejemplo Next.js</h1>
        <p>
          Este sitio está servido por el mismo gateway Nginx pero es una app
          distinta. Úsalo como plantilla para agregar más dominios.
        </p>
        <p className="muted">Hora local: {now || "cargando..."}</p>
      </section>
    </main>
  );
}
