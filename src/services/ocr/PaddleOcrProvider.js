import axios from 'axios';

/**
 * PaddleOCR Provider
 * Communicates with the Python/FastAPI microservice to extract CIN.
 * 
 * SOLID: Single Responsibility Principle. This class handles only the HTTP
 * communication with the OCR backend.
 */
class PaddleOcrProvider {
  /**
   * Sends the image file to the PaddleOCR backend and extracts the CIN.
   * @param {File} file - The image file to scan
   * @param {Function} onProgress - Callback for scan progress
   * @returns {Promise<string|null>} The extracted CIN or null if not found
   */
  async extractCin(file, onProgress) {
    try {
      // Because the actual processing happens on the backend, we can't track exact ML progress.
      // We simulate a loading progress bar for better UX.
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress > 90) progress = 90;
        if (onProgress) onProgress(progress);
      }, 400);

      const formData = new FormData();
      formData.append('file', file);

      // Construct the API Gateway URL for the OCR service
      // We use window.location.hostname so it works on both PC (localhost) and Mobile (192.168.x.x)
      const hostname = window.location.hostname;
      const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || `http://${hostname}:8080`;
      const ocrEndpoint = `${gatewayUrl}/api/ocr/v1/scan-cin`;

      const response = await axios.post(ocrEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      if (onProgress) onProgress(100);

      if (response.data && response.data.success) {
        return response.data.cin || null;
      }

      return null;
    } catch (error) {
      console.error('PaddleOCR Error:', error);
      
      const serverMessage = error.response?.data?.detail || error.response?.data?.error;
      throw new Error(serverMessage || 'Erreur de connexion au service d\'analyse OCR.');
    }
  }
}

export default new PaddleOcrProvider();
