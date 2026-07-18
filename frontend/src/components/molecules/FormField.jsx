import { Label } from '../atoms/Label'
import { ErrorText } from '../atoms/ErrorText'

export function FormField({ id, label, error, children }) {
  return (
    <div className="form-row">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <ErrorText>{error}</ErrorText>
    </div>
  )
}
