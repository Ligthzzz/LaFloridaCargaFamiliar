import { Label } from '../atoms/Label'
import { ErrorText } from '../atoms/ErrorText'

const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png']
const TAMANIO_MAXIMO = 5 * 1024 * 1024

export function FileDropSlot({ id, label, file, onChange, error, plantillaUrl }) {
  function handleChange(event) {
    const nuevoArchivo = event.target.files[0] ?? null
    if (!nuevoArchivo) {
      onChange(null, '')
      return
    }
    if (!TIPOS_PERMITIDOS.includes(nuevoArchivo.type)) {
      onChange(null, 'Solo se permiten archivos PDF, JPG o PNG')
      return
    }
    if (nuevoArchivo.size > TAMANIO_MAXIMO) {
      onChange(null, 'El archivo no puede superar los 5MB')
      return
    }
    onChange(nuevoArchivo, '')
  }

  return (
    <div className="form-row file-drop-slot">
      <Label htmlFor={id}>{label}</Label>
      {plantillaUrl && (
        <a href={plantillaUrl} target="_blank" rel="noopener noreferrer" download>
          Descargar formulario en blanco
        </a>
      )}
      <input
        id={id}
        type="file"
        accept={TIPOS_PERMITIDOS.join(',')}
        onChange={handleChange}
      />
      {file && <p className="file-name">{file.name}</p>}
      <p className="file-size-aviso">
        Formatos permitidos: PDF, JPG o PNG. Tamaño máximo: 5MB.
      </p>
      <ErrorText>{error}</ErrorText>
    </div>
  )
}
