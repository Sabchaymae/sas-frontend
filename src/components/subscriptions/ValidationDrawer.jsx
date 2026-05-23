import React, { useState } from 'react';
import { X, Phone, Upload, Info } from 'lucide-react';

const ValidationDrawer = ({ isOpen, onClose, data, onConfirm }) => {
  const [fixedNumber, setFixedNumber] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !data) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onConfirm({
        ...data,
        fixedNumber,
        uploadedFile
      });
      setFixedNumber('');
      setUploadedFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-accent-line green"></div>
          <div className="drawer-header-row">
            <div>
              <h2 className="drawer-title">Validation Finale</h2>
              <p className="drawer-sub">ID: {data.id}</p>
            </div>
            <button className="drawer-close" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div className="drawer-body">
          <div className="client-cell" style={{marginBottom:'2rem'}}>
            <div className="client-avatar" style={{width:48,height:48,fontSize:'1.1rem'}}>{data.client.avatar}</div>
            <div>
              <h3 className="drawer-title">{data.client.name}</h3>
              <p className="drawer-sub">CIN: <span style={{fontFamily:'monospace',fontWeight:800}}>{data.contact.cin}</span></p>
            </div>
          </div>

          <div className="warning-banner" style={{background:'var(--primary-bg)',borderColor:'#bfdbfe'}}>
            <Info size={16} color="var(--primary)" style={{marginTop:2}} />
            <div>
              <p style={{color:'var(--primary)',fontWeight:600}}>Vous êtes sur le point de valider ce dossier. Veuillez vérifier toutes les informations avant de confirmer.</p>
            </div>
          </div>

          <div style={{marginBottom:'1.5rem'}}>
            <label className="field-label"><Phone size={10} style={{display:'inline',marginRight:4}}/> Numéro Fixe (Optionnel)</label>
            <input
              type="text"
              className="field-input"
              placeholder="Ex: 0522..."
              value={fixedNumber}
              onChange={e => setFixedNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label"><Upload size={10} style={{display:'inline',marginRight:4}}/> Contrat Signé (PDF/Image)</label>
            <div
              className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploadedFile ? 'has-file' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('contract-upload').click()}
            >
              <input
                type="file"
                id="contract-upload"
                className="hidden"
                style={{display:'none'}}
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              {uploadedFile ? (
                <>
                  <div style={{color:'var(--success)',marginBottom:'.5rem'}}><Upload size={24} style={{margin:'0 auto'}}/></div>
                  <div style={{fontWeight:800,fontSize:'.82rem',color:'var(--ink)'}}>{uploadedFile.name}</div>
                  <div style={{fontSize:'.7rem',color:'var(--ink-muted)',marginTop:'.2rem'}}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </>
              ) : (
                <>
                  <div style={{color:'var(--ink-muted)',marginBottom:'.5rem'}}><Upload size={24} style={{margin:'0 auto'}}/></div>
                  <div style={{fontWeight:800,fontSize:'.82rem',color:'var(--ink)'}}>Cliquez ou glissez le contrat ici</div>
                  <div style={{fontSize:'.7rem',color:'var(--ink-muted)',marginTop:'.2rem'}}>PDF, JPG ou PNG jusqu'à 10MB</div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button
            className="btn-cta-primary green"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Validation en cours...' : 'Confirmer la validation'}
          </button>
          <button className="btn-cta-ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationDrawer;
