import React, { useState } from 'react';
import { X, Paperclip, Clock, ZoomIn, FileText, Image } from 'lucide-react';

const STORAGE_BASE = 'http://localhost:8080/storage';

const ImageCard = ({ path, label }) => {
  const [lightbox, setLightbox] = useState(false);
  if (!path) return (
    <div className="upload-zone" style={{padding:'1rem'}}>
      <Image size={20} className="upload-icon" style={{margin:'0 auto .5rem',background:'transparent',width:'auto',height:'auto'}} />
      <div className="upload-hint">{label} non fourni</div>
    </div>
  );
  const url = `${STORAGE_BASE}/${path}`;
  return (
    <>
      <div className="attachment-card cursor-zoom-in" onClick={() => setLightbox(true)}>
        <div className="attachment-thumb overflow-hidden">
          <img src={url} alt={label} style={{width:'100%',height:'100%',objectFit:'cover'}} />
        </div>
        <div className="attachment-name flex items-center gap-1">
          <ZoomIn size={12} color="var(--primary-light)" /> {label}
        </div>
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <img src={url} alt={label} className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl" />
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
};

const ContractCard = ({ path }) => {
  if (!path) return (
    <div className="upload-zone" style={{padding:'1rem'}}>
      <FileText size={20} className="upload-icon" style={{margin:'0 auto .5rem',background:'transparent',width:'auto',height:'auto'}} />
      <div className="upload-hint">Contrat non fourni</div>
    </div>
  );
  const url = `${STORAGE_BASE}/${path}`;
  const filename = path.split('/').pop();
  return (
    <a href={url} target="_blank" rel="noreferrer" className="attachment-card block" style={{textDecoration:'none'}}>
      <div className="attachment-thumb" style={{background:'var(--primary-bg)'}}>
        <FileText size={24} color="var(--primary-light)" />
      </div>
      <div className="attachment-name text-center truncate" style={{color:'var(--primary)'}}>
        Ouvrir le contrat ↗
      </div>
    </a>
  );
};

const SubscriptionDetailsDrawer = ({ isOpen, onClose, data, showActions, onValidate, onRefuse }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-accent-line blue"></div>
          <div className="drawer-header-row">
            <div>
              <h2 className="drawer-title">Détails du dossier</h2>
              <p className="drawer-sub">ID: {data.id}</p>
            </div>
            <button className="drawer-close" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div className="drawer-body">
          <div className="client-cell" style={{marginBottom:'2rem'}}>
            <div className="client-avatar" style={{width:54,height:54,fontSize:'1.2rem'}}>{data.client.avatar}</div>
            <div>
              <h3 className="drawer-title">{data.client.name}</h3>
              <p className="drawer-sub">CIN: <span style={{fontFamily:'monospace',fontWeight:800}}>{data.contact.cin}</span></p>
              <p className="drawer-sub" style={{fontSize:'.65rem',marginTop:2}}>Créé le {data.date}</p>
            </div>
          </div>

          <div className="details-user-card" style={{marginBottom:'2rem'}}>
            <div className="info-row">
              <span className="info-key">Téléphone</span>
              <span className="info-value">{data.contact.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-key">Adresse</span>
              <span className="info-value" style={{fontWeight:600}}>{data.address}</span>
            </div>
            <div className="info-row">
              <span className="info-key">Opérateur</span>
              <span className="info-value">{data.operator?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-key">Type / Offre</span>
              <span className="info-value"><span className="plan-badge">{data.operator?.type}</span></span>
            </div>
          </div>

          <div style={{marginBottom:'2rem'}}>
            <span className="drawer-section-label"><Paperclip size={12}/> Pièces Jointes</span>
            <div className="attachment-grid">
              <ImageCard path={data.cinRectoPath} label="CIN Recto" />
              <ImageCard path={data.cinVersoPath} label="CIN Verso" />
            </div>
            {data.contratPath && (
              <div style={{marginTop:'.75rem'}}>
                <ContractCard path={data.contratPath} />
              </div>
            )}
          </div>

          <div style={{marginBottom:'2rem'}}>
            <span className="drawer-section-label"><Clock size={12}/> Historique & Statut</span>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot" style={{borderColor: data.status==='Validé'?'var(--success)':data.status==='Refusé'?'var(--danger)':'var(--warning)',background: data.status==='Validé'?'var(--success)':data.status==='Refusé'?'var(--danger)':'var(--warning)'}} />
                <div className="timeline-content">
                  <span className="timeline-title">{data.status}</span>
                  <span className="timeline-date">Dernière mise à jour</span>
                </div>
              </div>
              <div className="timeline-item" style={{paddingBottom:0}}>
                <div className="timeline-dot" style={{borderColor:'var(--primary-light)',background:'var(--primary-bg)'}} />
                <div className="timeline-content">
                  <span className="timeline-title" style={{color:'var(--ink-secondary)'}}>Dossier créé</span>
                  <span className="timeline-date">{data.date}</span>
                </div>
              </div>
            </div>
          </div>

          {data.status === 'Refusé' && data.refusalReason && (
            <div className="warning-banner">
              <div>
                <span style={{fontSize:'.65rem',fontWeight:900,color:'#991b1b',textTransform:'uppercase',letterSpacing:'.05em',display:'block',marginBottom:4}}>Motif du refus</span>
                <p>{data.refusalReason}</p>
              </div>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          {showActions ? (
            <div style={{display:'flex',gap:'.75rem'}}>
              <button className="btn-cta-outline" onClick={() => onRefuse(data)} style={{color:'var(--danger)',borderColor:'#fecaca',background:'var(--danger-bg)'}}>Refuser</button>
              <button className="btn-cta-primary green" onClick={() => onValidate(data)} style={{flex:2}}>Valider</button>
            </div>
          ) : (
            <button className="btn-cta-ghost" onClick={onClose} style={{background:'#f8fafc',borderRadius:'.75rem'}}>Fermer</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetailsDrawer;
