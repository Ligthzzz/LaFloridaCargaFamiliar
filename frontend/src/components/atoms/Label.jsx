export function Label({ children, ...props }) {
  return (
    <label className="label" {...props}>
      {children}
    </label>
  )
}
