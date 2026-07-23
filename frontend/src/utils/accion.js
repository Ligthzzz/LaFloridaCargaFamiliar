export const ACCIONES = [
  { value: 'ALTA', label: 'Agregar carga' },
  { value: 'MODIFICACION', label: 'Actualizar carga' },
  { value: 'BAJA', label: 'Eliminar carga' },
]

export const ACCION_LABEL = Object.fromEntries(
  ACCIONES.map((accion) => [accion.value, accion.label]),
)
