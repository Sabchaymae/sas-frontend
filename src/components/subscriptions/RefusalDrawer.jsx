import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const REFUSAL_REASONS = [
  'Justificatif de domicile expiré (plus de 3 mois)',
  'CIN non valide ou illisible',
  'Dossier incomplet — pièces manquantes',
  'Informations incohérentes avec les documents',
  'Client déjà inscrit avec un autre dossier',
  'Zone non couverte par l\'opérateur sélectionné',
  'Autre motif (voir commentaire)',
];

const RefusalDrawer = ({ isOpen, onClose, data, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !data) return null;

  const handleSubmit = async () => {
    if (!selectedReason || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onConfirm(selectedReason + (comment ? ` — ${comment}` : ''));
      setSelectedReason('');
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-accent-line red"></div>
          <div className="drawer-header-row">
            <div>
              <h2 className="drawer-title">Refus du dossier</h2>
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

          <div className="warning-banner">
            <AlertTriangle size={16} color="var(--danger)" style={{marginTop:2}} />
            <div>
              <p>Cette action est irréversible. Le dossier sera marqué comme <strong>refusé</strong> et l'animateur sera notifié pour correction si nécessaire.</p>
            </div>
          </div>

          <div style={{marginBottom:'2rem'}}>
            <label className="field-label">Motif de refus *</label>
            <div>
              {REFUSAL_REASONS.map((reason, i) => (
                <button
                  key={i}
                  className={`reason-chip ${selectedReason === reason ? 'selected' : ''}`}
                  onClick={() => setSelectedReason(reason)}
                >
                  <div className="reason-radio">
                    {selectedReason === reason && <div className="reason-radio-dot" />}
                  </div>
                  <span className="reason-text">{reason}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Commentaire additionnel (Optionnel)</label>
            <textarea
              className="field-input"
              placeholder="Précisez ici si nécessaire..."
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{resize:'none'}}
            />
          </div>
        </div>

        <div className="drawer-footer">
          <button
            className="btn-cta-primary red"
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? 'Refus en cours...' : 'Confirmer le refus'}
          </button>
          <button className="btn-cta-ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefusalDrawer;
