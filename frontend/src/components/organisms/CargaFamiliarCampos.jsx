import { TIPOS_CARGA, camposArchivoParaTipoCarga } from '../../utils/documentosRequeridos'
import { FormField } from '../molecules/FormField'
import { FileDropSlot } from '../molecules/FileDropSlot'
import { Select } from '../atoms/Select'

export function CargaFamiliarCampos({
  idPrefix,
  tipoCarga,
  observaciones,
  archivos,
  errores,
  onCambiarTipoCarga,
  onCambiarObservaciones,
  onCambiarArchivo,
  deshabilitado = false,
}) {
  const documentosDelTipo = camposArchivoParaTipoCarga(tipoCarga)

  return (
    <>
      <FormField id={`${idPrefix}-tipoCarga`} label="Parentesco con el funcionario">
        <Select
          id={`${idPrefix}-tipoCarga`}
          value={tipoCarga}
          onChange={(e) => onCambiarTipoCarga(e.target.value)}
          disabled={deshabilitado}
        >
          {TIPOS_CARGA.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id={`${idPrefix}-observaciones`} label="Observaciones (opcional)">
        <textarea
          id={`${idPrefix}-observaciones`}
          className="textarea"
          rows={2}
          value={observaciones}
          disabled={deshabilitado}
          onChange={(e) => onCambiarObservaciones(e.target.value)}
        />
      </FormField>

      <p className="documentos-intro">
        Descarga cada formulario, complétalo a mano con los datos de la
        carga familiar, fírmalo y súbelo aquí como PDF o foto (JPG/PNG).
      </p>

      {documentosDelTipo.map(({ campo, label, plantillaUrl }) => (
        <FileDropSlot
          key={campo}
          id={`${idPrefix}-${campo}`}
          label={label}
          plantillaUrl={plantillaUrl}
          file={archivos[campo]}
          error={errores[campo]}
          disabled={deshabilitado}
          onChange={(archivo, error) => onCambiarArchivo(campo, archivo, error)}
        />
      ))}
    </>
  )
}
