import { useEffect, useState } from "react";
import RecordCard from "./components/RecordCard";
import logo from "./assets/logo-cnm.png";

type RecordType = {
  piscina: string;
  sexo: string;
  prueba: string;
  nombre: string;
  anio: number;
  club: string;
  marca: string;
  marcaFormateada: string;
  fina: number;
  fecha: string;
  competicion: string;
  lugar: string;
  isNew: boolean;
};

function App() {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [piscina, setPiscina] = useState("25");
  const [sexo, setSexo] = useState("Masculino");

  useEffect(() => {
    fetch("/records.json")
      .then((response) => response.json())
      .then((data: RecordType[]) => setRecords(data))
      .catch((error) => console.error(error));
  }, []);

  const recordsFiltrados = records.filter(
    (record) =>
      record.piscina === piscina &&
      record.sexo === sexo
  );

  const estilos = [
    "Libre",
    "Espalda",
    "Braza",
    "Mariposa",
    "Estilos",
  ];

  return (
    <main className="container">
      <header className="header">
        <img
          src={logo}
          alt="Club Natación Mediterráneo Valencia"
          className="club-logo"
        />

        <h1>ARCHIVO HISTÓRICO</h1>

        <p>Club Natación Mediterráneo Valencia</p>
      </header>

      <section className="filters">
        <div className="filter-group">
          <label>Piscina</label>

          <div className="buttons">
            <button
              className={piscina === "25" ? "active" : ""}
              onClick={() => setPiscina("25")}
            >
              25 m
            </button>

            <button
              className={piscina === "50" ? "active" : ""}
              onClick={() => setPiscina("50")}
            >
              50 m
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Sexo</label>

          <div className="buttons">
            <button
              className={sexo === "Masculino" ? "active" : ""}
              onClick={() => setSexo("Masculino")}
            >
              Masculino
            </button>

            <button
              className={sexo === "Femenino" ? "active" : ""}
              onClick={() => setSexo("Femenino")}
            >
              Femenino
            </button>
          </div>
        </div>
      </section>

      <section className="historical-archive">
        <div>
          <h2>📄 Archivo Histórico Completo</h2>
          <p>
            Consulta el ranking histórico absoluto y por edades del Club Natación Mediterráneo Valencia.
          </p>
        </div>

        <a
          className="archive-download"
          href="/Archivo_Historico_CNM.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Descargar PDF
        </a>
      </section>

      <section className="records">

        {estilos.map((estilo) => {

          const recordsEstilo = recordsFiltrados
            .filter((record) => record.prueba.includes(estilo));

          return (
            <div key={estilo} className="estilo-section">

              <h2 className="estilo-title">
                {estilo}
              </h2>

              <div className="records-grid">

                {recordsEstilo.map((record) => (
                  <RecordCard
                    key={`${record.prueba}-${record.sexo}-${record.piscina}`}
                    prueba={record.prueba}
                    nombre={record.nombre}
                    marca={record.marcaFormateada}
                    puntosAQUA={record.fina}
                    nacimiento={record.anio}
                    lugar={record.lugar}
                    fecha={record.fecha}
                    isNew={record.isNew}
                  />
                ))}

              </div>

            </div>
          );
        })}

      </section>
    </main>
  );
}

export default App;