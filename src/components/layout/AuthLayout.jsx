import { Shield, BarChart3, Users } from 'lucide-react';

/**
 * AuthLayout — Split-screen design (Light Mode)
 * Left: Oriotel branding panel with decorative visuals (#111827 dark background)
 * Right: Cloud White form panel
 * Palette: Signal Blue #1428C9 | Cloud White #F9FAFB | Midnight Slate #111827
 */
const AuthLayout = ({ children, title, subtitle, isWide = false }) => {
  return (
    <div className="auth-split">

      {/* ── LEFT PANEL (Midnight Slate dark) ── */}
      <div className="auth-panel-left">
        {/* Logo */}
        <div className="auth-panel-left__logo">
          <img
            src="/logo-oriotel.svg"
            alt="Oriotel"
            className="auth-panel-left__logo-img"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="auth-panel-left__logo-fallback" style={{ display: 'none' }}>
            <span>Oriotel</span>
          </div>
        </div>

        {/* Decorative SVG — abstract telecom network */}
        <div className="auth-panel-left__art" aria-hidden="true">
          <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-panel-left__svg">
            <defs>
              <radialGradient id="gBlue" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1428C9" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#1428C9" stopOpacity="0"/>
              </radialGradient>
            </defs>
            {/* Glowing center orb */}
            <circle cx="300" cy="300" r="180" fill="url(#gBlue)" />
            {/* Arcs */}
            <path d="M60 560 Q200 180 540 60" stroke="#1428C9" strokeWidth="1.2" opacity="0.5"/>
            <path d="M80 540 Q220 200 520 80" stroke="#1428C9" strokeWidth="0.7" opacity="0.3"/>
            <path d="M100 520 Q240 220 500 100" stroke="#F9FAFB" strokeWidth="0.5" opacity="0.12"/>
            <path d="M120 560 Q300 160 560 120" stroke="#F9FAFB" strokeWidth="0.4" opacity="0.08"/>
            {/* Node dots */}
            <circle cx="120" cy="200" r="4" fill="#1428C9" opacity="0.7"/>
            <circle cx="480" cy="150" r="3" fill="#1428C9" opacity="0.55"/>
            <circle cx="350" cy="420" r="5" fill="#1428C9" opacity="0.45"/>
            <circle cx="200" cy="460" r="3" fill="#F9FAFB" opacity="0.3"/>
            <circle cx="500" cy="380" r="3.5" fill="#F9FAFB" opacity="0.25"/>
            <circle cx="260" cy="130" r="2.5" fill="#1428C9" opacity="0.4"/>
            <circle cx="420" cy="490" r="2.5" fill="#1428C9" opacity="0.4"/>
            {/* Connection lines */}
            <line x1="120" y1="200" x2="480" y2="150" stroke="#1428C9" strokeWidth="0.8" opacity="0.3"/>
            <line x1="480" y1="150" x2="350" y2="420" stroke="#1428C9" strokeWidth="0.8" opacity="0.3"/>
            <line x1="120" y1="200" x2="350" y2="420" stroke="#F9FAFB" strokeWidth="0.5" opacity="0.15"/>
            <line x1="200" y1="460" x2="500" y2="380" stroke="#1428C9" strokeWidth="0.6" opacity="0.25"/>
            <line x1="260" y1="130" x2="200" y2="460" stroke="#1428C9" strokeWidth="0.5" opacity="0.2"/>
            <line x1="420" y1="490" x2="480" y2="150" stroke="#F9FAFB" strokeWidth="0.4" opacity="0.15"/>
            {/* Grid dots */}
            {[140, 220, 300, 380, 460].map(x =>
              [140, 220, 300, 380, 460].map(y => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="#F9FAFB" opacity="0.07"/>
              ))
            )}
          </svg>
        </div>

        {/* Feature chips */}
        <div className="auth-panel-left__stats">
          <div className="auth-panel-left__stat">
            <Shield size={15} />
            <span>Accès sécurisé 2FA</span>
          </div>
          <div className="auth-panel-left__stat">
            <BarChart3 size={15} />
            <span>Tableaux de bord KPI</span>
          </div>
          <div className="auth-panel-left__stat">
            <Users size={15} />
            <span>Gestion des rôles RBAC</span>
          </div>
        </div>

        {/* Quote */}
        <div className="auth-panel-left__quote">
          <p className="auth-panel-left__quote-text">
            &ldquo;La transformation digitale de nos opérations télécom, centralisée en une seule plateforme.&rdquo;
          </p>
          <span className="auth-panel-left__quote-author">— Équipe Oriotel</span>
        </div>
      </div>

      {/* ── RIGHT PANEL (Cloud White light) ── */}
      <div className="auth-panel-right">
        {/* Scrollable content */}
        <div className="auth-panel-right__body">
          <div className={`auth-panel-right__content ${isWide ? 'auth-panel-right__content--wide' : ''}`}>
            {title && (
              <div className="auth-panel-right__header">
                <h1 className="auth-panel-right__title">{title}</h1>
                {subtitle && <p className="auth-panel-right__subtitle">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="auth-panel-right__footer">
          <p>&copy; {new Date().getFullYear()} Oriotel. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
