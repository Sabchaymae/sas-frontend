/**
 * Auth Header component — Oriotel branding for auth pages
 */
const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="auth-header">
      <div className="auth-header-logo">
        <img
          src="/images/logo.png"
          alt="Oriotel"
          className="auth-header-logo-img"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="auth-header-logo-fallback" style={{ display: 'none' }}>
          <span className="auth-header-logo-text">O</span>
        </div>
      </div>
      <h1 className="auth-header-title">{title}</h1>
      {subtitle && <p className="auth-header-subtitle">{subtitle}</p>}
    </div>
  );
};

export default AuthHeader;
