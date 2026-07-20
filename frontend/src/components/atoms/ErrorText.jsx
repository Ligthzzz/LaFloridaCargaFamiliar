export function ErrorText({ children }) {
  const mensajes = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean)

  if (mensajes.length === 0) return null
  if (mensajes.length === 1) return <p className="error-text">{mensajes[0]}</p>

  return (
    <ul className="error-text error-list">
      {mensajes.map((mensaje, indice) => (
        <li key={indice}>{mensaje}</li>
      ))}
    </ul>
  )
}
