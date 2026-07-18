export function ComentariosThread({ comentarios }) {
  if (!comentarios || comentarios.length === 0) {
    return <p>Sin comentarios todavía.</p>
  }

  return (
    <ul className="comentarios-thread">
      {comentarios.map((comentario) => (
        <li key={comentario.id} className="comentario">
          <div className="comentario-header">
            <strong>{comentario.autor?.nombre}</strong>
            <span>
              {new Date(comentario.createdAt).toLocaleString('es-CL')}
            </span>
          </div>
          <p>{comentario.mensaje}</p>
        </li>
      ))}
    </ul>
  )
}
