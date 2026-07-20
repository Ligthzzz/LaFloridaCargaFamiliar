export function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <img
        src="/logo-mdlf.png"
        alt="Municipalidad de La Florida"
        className="auth-layout-logo"
      />
      <div className="auth-layout-content">{children}</div>
    </div>
  )
}
