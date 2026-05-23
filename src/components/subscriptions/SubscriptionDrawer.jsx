import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Globe, Zap, Smartphone, Check, ScanLine, AlertCircle, CheckCircle2, FileImage, Camera, FileText, ImageIcon, RotateCcw } from 'lucide-react';
import OcrService from '../../services/ocr/OcrService';

// ─── Shared OCR drop zone ─────────────────────────────────────────────────────
const DropZone = ({ label, accept, onFile, ocrState, small = false }) => {
  const ref = useRef(null);
  const { loading, success, error, file } = ocrState;

  const bg =
    loading ? 'border-blue-300 bg-blue-50/40 pointer-events-none' :
    success  ? 'border-emerald-300 bg-emerald-50/30' :
    error    ? 'border-orange-300 bg-orange-50/20' :
               'border-slate-100 bg-slate-50/30 hover:bg-blue-50/30 hover:border-blue-200';

  const iconBg =
    loading ? 'bg-blue-100 text-blue-600 animate-pulse' :
    success  ? 'bg-emerald-100 text-emerald-600' :
    error    ? 'bg-orange-50 text-orange-500' :
               'bg-white text-slate-400 group-hover:text-blue-600';

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="w-full">
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div
        className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${small ? 'p-5' : 'p-8'} ${bg}`}
        onClick={() => ref.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <div className={`${small ? 'w-10 h-10' : 'w-14 h-14'} rounded-2xl flex items-center justify-center mb-3 shadow-sm transition-all ${iconBg}`}>
          {loading ? <ScanLine size={small ? 18 : 24} /> :
           success  ? <CheckCircle2 size={small ? 18 : 24} /> :
           error    ? <AlertCircle size={small ? 18 : 24} /> :
                      <Upload size={small ? 18 : 24} />}
        </div>
        <div className={`font-black text-slate-800 text-center ${small ? 'text-xs' : 'text-sm'}`}>
          {loading ? 'Analysing…' : success ? 'Done' : error ? 'Retry' : label}
        </div>
        {file && !loading && (
          <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-100">
            <FileImage size={10} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-500 max-w-[100px] truncate">{file.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Camera panel ─────────────────────────────────────────────────────────────
const CameraPanel = ({ onCapture }) => {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const [active, setActive]   = useState(false);
  const [preview, setPreview] = useState(null);
  const [err, setErr]         = useState(null);

  const start = async () => {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setActive(true);
    } catch {
      setErr('Camera not available. Use file upload instead.');
    }
  };

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setActive(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const capture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob(blob => {
      const url  = URL.createObjectURL(blob);
      const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
      setPreview(url);
      stop();
      onCapture(file);
    }, 'image/jpeg', 0.95);
  };

  const reset = () => { setPreview(null); setActive(false); };

  return (
    <div className="rounded-2xl border-2 border-slate-100 overflow-hidden bg-slate-900 relative" style={{ minHeight: 220 }}>
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} className={`w-full object-cover ${active ? 'block' : 'hidden'}`} style={{ maxHeight: 220 }} playsInline muted />

      {preview && (
        <img src={preview} alt="capture" className="w-full object-cover" style={{ maxHeight: 220 }} />
      )}

      {!active && !preview && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <Camera size={24} />
          </div>
          {err ? (
            <p className="text-[11px] font-bold text-orange-400 text-center px-4">{err}</p>
          ) : (
            <button
              onClick={start}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-500 transition-all shadow-lg"
            >
              Activate Camera
            </button>
          )}
        </div>
      )}

      {active && (
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
          <button onClick={stop}
            className="px-4 py-2 rounded-xl bg-white/20 text-white text-xs font-black backdrop-blur hover:bg-white/30 transition-all">
            Cancel
          </button>
          <button onClick={capture}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black shadow-lg hover:bg-blue-500 transition-all flex items-center gap-2">
            <Camera size={14} /> Capture
          </button>
        </div>
      )}

      {preview && (
        <button onClick={reset}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all backdrop-blur">
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  );
};

// ─── Main Drawer ──────────────────────────────────────────────────────────────
const MODES = [
  { id: 'images', label: 'Images',  icon: <ImageIcon size={14} /> },
  { id: 'camera', label: 'Camera',  icon: <Camera size={14} /> },
];

const emptyOcr = () => ({ loading: false, progress: 0, error: null, success: false, file: null });

const SubscriptionDrawer = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [selectedOperator, setSelectedOperator] = useState('Orange');
  const [selectedPlan,     setSelectedPlan]     = useState('FTTH');
  const [selectedSegment,  setSelectedSegment]  = useState('B2C Individual');
  const [uploadMode,       setUploadMode]       = useState('images');

  // Form values
  const [cinValue, setCinValue] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [address, setAddress] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');

  // Per-mode OCR states
  const [rectoOcr, setRectoOcr] = useState(emptyOcr());
  const [versoOcr, setVersoOcr] = useState(emptyOcr());

  // Captured file objects (for upload)
  const [cinRectoFile, setCinRectoFile] = useState(null);
  const [cinVersoFile, setCinVersoFile] = useState(null);

  // Camera sequential step: 'recto' | 'verso'
  const [cameraStep, setCameraStep] = useState('recto');

  // Extracted CINs to compare
  const [rectoCin, setRectoCin] = useState('');
  const [versoCin, setVersoCin] = useState('');
  const [cinError, setCinError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAll = () => {
    setCinValue('');
    setNom('');
    setPrenom('');
    setTelephone('');
    setAddress('');
    setDateNaissance('');
    setRectoCin('');
    setVersoCin('');
    setCinError('');
    setRectoOcr(emptyOcr());
    setVersoOcr(emptyOcr());
    setCinRectoFile(null);
    setCinVersoFile(null);
    setCameraStep('recto');
  };

  useEffect(() => {
    resetAll();
    if (initialData) {
      setSelectedOperator(initialData.operator?.name || 'Orange');
      setSelectedPlan(
        (initialData.operator?.type || '').includes('Fibre') ? 'FTTH' :
        (initialData.operator?.type || '').includes('Mobile') ? 'Mobile' : 'ADSL'
      );
      setCinValue(initialData.contact?.cin || '');
      setTelephone(initialData.contact?.phone && initialData.contact.phone !== '—' ? initialData.contact.phone : '');
      
      // Parse name
      setPrenom(initialData.rawPrenom || '');
      setNom(initialData.rawNom || '');
      setAddress(initialData.address || '');
      setDateNaissance(initialData.dateNaissance || '');
    } else {
      setSelectedOperator('Orange');
      setSelectedPlan('FTTH');
      setSelectedSegment('B2C Individual');
    }
  }, [initialData, isOpen]);

  useEffect(() => {
      // Validate Recto vs Verso
      if (rectoCin && versoCin && rectoCin !== versoCin) {
          setCinError('Erreur : Les CIN extraits du Recto et du Verso sont différents.');
      } else {
          setCinError('');
      }
  }, [rectoCin, versoCin]);

  if (!isOpen) return null;

  // ── Shared OCR runner ──
  const runOcr = async (file, setter, side = null) => {
    // Check max file size (5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      setter(s => ({ ...s, loading: false, success: false, file, error: 'La taille de l\'image ne doit pas dépasser 5MB.', progress: 0 }));
      return;
    }

    // Save the raw File object for upload
    if (side === 'recto') setCinRectoFile(file);
    if (side === 'verso') setCinVersoFile(file);

    setter(s => ({ ...s, loading: true, error: null, success: false, file, progress: 0 }));
    try {
      const data = await OcrService.extractCin(file, p => setter(s => ({ ...s, progress: p })));
      if (data && (data.cin || data.nom || data.adresse)) {
        if (side === 'recto') {
            if (data.cin) { setRectoCin(data.cin); setCinValue(data.cin); }
            if (data.nom) setNom(data.nom);
            if (data.prenom) setPrenom(data.prenom);
            if (data.date_naissance) setDateNaissance(data.date_naissance);
        } else if (side === 'verso') {
            if (data.cin) setVersoCin(data.cin);
            if (data.adresse) setAddress(data.adresse);
        } else {
            if (data.cin) setCinValue(data.cin);
            if (data.nom) setNom(data.nom);
            if (data.prenom) setPrenom(data.prenom);
            if (data.date_naissance) setDateNaissance(data.date_naissance);
            if (data.adresse) setAddress(data.adresse);
        }
        setter(s => ({ ...s, loading: false, success: true, progress: 100 }));
      } else {
        setter(s => ({ ...s, loading: false, error: 'Informations non détectées.' }));
      }
    } catch (err) {
      setter(s => ({ ...s, loading: false, error: err.message || 'OCR error.' }));
    }
  };


  const ocrLoading = rectoOcr.loading || versoOcr.loading;
  const ocrSuccess = rectoOcr.success || versoOcr.success;

  const handleSubmit = async (isDraft = false) => {
    try {
      setIsSubmitting(true);
      await onSubmit({ 
        operator: selectedOperator, 
        plan: selectedPlan, 
        segment: selectedSegment, 
        cin: cinValue,
        telephone,
        nom,
        prenom,
        adresse: address,
        date_naissance: dateNaissance,
        is_draft: isDraft,
        cinRectoFile,
        cinVersoFile,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-accent-line blue"></div>
          <div className="drawer-header-row">
            <div>
              <h2 className="drawer-title">{initialData ? 'Éditer le Dossier' : 'Nouveau Dossier'}</h2>
              <p className="drawer-sub">{initialData ? 'Mise à jour du contrat opérateur' : 'Création d\'un nouveau contrat'}</p>
            </div>
            <button className="drawer-close" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div className="drawer-body">

          {/* ── Identity Verification ── */}
          <div className="mb-10">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 block">
              Identity Verification
            </span>

            {/* Mode tabs */}
            <div className="flex gap-2 mb-5 p-1 bg-slate-50 rounded-2xl">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setUploadMode(m.id); resetAll(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all
                    ${uploadMode === m.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {/* ── Images mode (recto / verso) ── */}
            {uploadMode === 'images' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recto (Front) ✦</p>
                  <DropZone
                    label="Upload Front"
                    accept="image/png,image/jpeg,image/jpg"
                    onFile={f => runOcr(f, setRectoOcr, 'recto')}
                    ocrState={rectoOcr}
                    small
                  />
                  {rectoOcr.loading && (
                    <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${rectoOcr.progress}%` }} />
                    </div>
                  )}
                  {rectoOcr.error && <p className="mt-1 text-[10px] font-bold text-orange-500">{rectoOcr.error}</p>}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verso (Back)</p>
                  <DropZone
                    label="Upload Back"
                    accept="image/png,image/jpeg,image/jpg"
                    onFile={f => runOcr(f, setVersoOcr, 'verso')}
                    ocrState={versoOcr}
                    small
                  />
                  {versoOcr.loading && (
                    <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${versoOcr.progress}%` }} />
                    </div>
                  )}
                  {versoOcr.error && <p className="mt-1 text-[10px] font-bold text-orange-500">{versoOcr.error}</p>}
                </div>
              </div>
            )}

            {/* ── Camera mode (sequential: recto → verso) ── */}
            {uploadMode === 'camera' && (
              <div>
                {/* Step indicator */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setCameraStep('recto')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                      cameraStep === 'recto'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : rectoOcr.success
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    {rectoOcr.success ? '✓ ' : '① '}Recto (Face avant)
                  </button>
                  <button
                    onClick={() => { if (rectoOcr.success) setCameraStep('verso'); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                      cameraStep === 'verso'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : versoOcr.success
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {versoOcr.success ? '✓ ' : '② '}Verso (Face arrière)
                  </button>
                </div>

                {/* Single camera panel */}
                {cameraStep === 'recto' && (
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">📷 Photographier le RECTO de la CIN</p>
                    <CameraPanel onCapture={f => { runOcr(f, setRectoOcr, 'recto'); setCameraStep('verso'); }} />
                    {rectoOcr.loading && (
                      <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${rectoOcr.progress}%` }} />
                      </div>
                    )}
                    {rectoOcr.error && <p className="mt-1 text-[10px] font-bold text-orange-500">{rectoOcr.error}</p>}
                    {rectoOcr.success && (
                      <p className="mt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Recto capturé — passez au Verso →
                      </p>
                    )}
                  </div>
                )}

                {cameraStep === 'verso' && (
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">📷 Photographier le VERSO de la CIN</p>
                    <CameraPanel onCapture={f => runOcr(f, setVersoOcr, 'verso')} />
                    {versoOcr.loading && (
                      <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${versoOcr.progress}%` }} />
                      </div>
                    )}
                    {versoOcr.error && <p className="mt-1 text-[10px] font-bold text-orange-500">{versoOcr.error}</p>}
                    {versoOcr.success && (
                      <p className="mt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Les deux faces ont été capturées !
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {cinError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-600">{cinError}</p>
              </div>
            )}

            {/* CIN field — always visible */}
            <div className="mt-5">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mb-2 block">
                CIN Number (Auto-extracted)
              </label>
              <input
                type="text"
                value={cinValue}
                readOnly
                placeholder="e.g. AB123456"
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-black text-slate-900 outline-none transition-all
                  ${ocrSuccess ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-100 bg-slate-50 opacity-70'}
                `}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mb-2 block">
                  Nom
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  placeholder="Nom"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:border-blue-300 focus:bg-white text-sm font-black text-slate-900 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mb-2 block">
                  Prénom
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={e => setPrenom(e.target.value)}
                  placeholder="Prénom"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:border-blue-300 focus:bg-white text-sm font-black text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mb-2 block">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={e => setDateNaissance(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:border-blue-300 focus:bg-white text-sm font-black text-slate-900 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mb-2 block">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  placeholder="e.g. 0612345678"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:border-blue-300 focus:bg-white text-sm font-black text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mb-2 block">
                Adresse
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Adresse"
                className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:border-blue-300 focus:bg-white text-sm font-black text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* ── Select Operator ── */}
          <div className="mb-10">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-5 block">Select Operator</span>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'IAM',    color: '#EE1D23' },
                { name: 'Orange', color: '#FF6600' },
                { name: 'Inwi',   color: '#722E85' },
              ].map(op => (
                <div
                  key={op.name}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 group ${selectedOperator === op.name ? 'border-blue-600 bg-blue-50/20 shadow-lg shadow-blue-100/50' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                  onClick={() => setSelectedOperator(op.name)}
                >
                  <div className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm p-2 overflow-hidden transition-all group-hover:scale-105">
                    <img
                      src={`/logo-${op.name.toLowerCase()}.svg`}
                      alt={op.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className={`text-xs font-black uppercase tracking-widest ${selectedOperator === op.name ? 'text-blue-700' : 'text-slate-600'}`}>{op.name}</div>
                  <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedOperator === op.name ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                    {selectedOperator === op.name && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Objective & Segment ── */}
          <div className="mb-10">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-5 block">Objective & Segment</span>
            <div className="space-y-4">
              {[
                { id: 'ADSL',   name: 'ADSL Connection',    icon: <Globe size={20} /> },
                { id: 'FTTH',   name: 'FTTH (Fiber Optic)', icon: <Zap size={20} /> },
                { id: 'Mobile', name: 'Forfait Mobile',      icon: <Smartphone size={20} /> },
              ].map(plan => (
                <div
                  key={plan.id}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === plan.id ? 'border-blue-600 bg-blue-50/10' : 'border-slate-50 bg-white hover:border-slate-100'}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 flex items-center justify-center rounded-sm border-2 transition-all ${selectedPlan === plan.id ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white'}`}>
                        {selectedPlan === plan.id && <Check size={12} className="text-white" strokeWidth={4} />}
                      </div>
                      <div className="text-sm font-black text-slate-900">{plan.name}</div>
                    </div>
                    <div className={selectedPlan === plan.id ? 'text-blue-600' : 'text-slate-300'}>{plan.icon}</div>
                  </div>
                  {selectedPlan === plan.id && (
                      <div className="flex gap-3 mt-4 animate-in slide-in-from-top-2 duration-300">
                      {['B2C Individual', 'B2B Professional'].map(segment => (
                        <button
                          key={segment}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedSegment === segment ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'}`}
                          onClick={e => { e.stopPropagation(); setSelectedSegment(segment); }}
                        >
                          {segment}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          {!initialData ? (
            <div style={{display:'flex',gap:'.75rem'}}>
              <button
                className="btn-cta-outline"
                onClick={() => handleSubmit(true)}
                disabled={ocrLoading || isSubmitting}
              >
                {isSubmitting ? '...' : 'Brouillon'}
              </button>
              <button
                className="btn-cta-primary blue"
                onClick={() => handleSubmit(false)}
                disabled={ocrLoading || !!cinError || isSubmitting}
                style={{flex:2}}
              >
                {isSubmitting ? 'Enregistrement...' : 'Soumettre le Dossier'}
              </button>
            </div>
          ) : (
            <button
              className="btn-cta-primary blue"
              onClick={() => handleSubmit(false)}
              disabled={ocrLoading || !!cinError || isSubmitting}
            >
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          )}
          <button className="btn-cta-ghost" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDrawer;
