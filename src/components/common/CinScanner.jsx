import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import OcrService from '@/services/ocr/OcrService';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

/**
 * CinScanner Component
 * 
 * A UI component dedicated to capturing an image and processing it via the OcrService.
 * Follows Single Responsibility: It handles the UI state for scanning, not the business logic.
 */
const CinScanner = ({ onCinExtracted }) => {
  const fileInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setProgress(0);
    setError(null);

    try {
      const cin = await OcrService.extractCin(file, setProgress);
      if (cin) {
        onCinExtracted(cin);
      } else {
        setError("Impossible de détecter le numéro de CIN. Veuillez prendre une photo plus claire (de préférence le verso avec le code-barres).");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'analyse.");
    } finally {
      setIsScanning(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3" />}
      
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        fullWidth
        className="flex items-center justify-center gap-2"
        style={{ marginTop: '0.5rem', marginBottom: '1rem', borderStyle: 'dashed', borderWidth: '2px' }}
      >
        {isScanning ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Analyse intelligente en cours... {progress}%
          </>
        ) : (
          <>
            <Camera size={18} />
            Scanner ma CIN automatiquement
          </>
        )}
      </Button>
    </div>
  );
};

export default CinScanner;
