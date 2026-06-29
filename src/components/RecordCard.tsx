type RecordCardProps = {
  prueba: string;
  nombre: string;
  marca: string;
  puntosAQUA: number;
  nacimiento: number;
  lugar: string;
  fecha: string;
  isNew: boolean;
};

export default function RecordCard({
  prueba,
  nombre,
  marca,
  puntosAQUA,
  nacimiento,
  lugar,
  fecha,
  isNew,
}: RecordCardProps) {
  return (
    <article className="record-card">
      {isNew === true && (
        <span className="new-badge">NUEVO</span>
      )}

      <h3 className="record-event">{prueba}</h3>

      <div className="record-time">{marca}</div>

      <p className="record-swimmer">
        {nombre} ({nacimiento})
      </p>

      <p className="record-date">
        {fecha} · {lugar}
      </p>

      <p className="record-points">
        {puntosAQUA} puntos AQUA
      </p>
    </article>
  );
}
