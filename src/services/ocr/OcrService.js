// import TesseractProvider from './TesseractProvider';
import PaddleOcrProvider from './PaddleOcrProvider';

/**
 * OCR Service Facade
 * 
 * SOLID: Dependency Inversion. The components interact with this service, 
 * not the concrete implementations (Tesseract or Google Cloud).
 * To switch the module in the future, simply change the provider here.
 */
class OcrService {
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Extracts a CIN number from an image file
   * @param {File} file - The image file
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<string|null>}
   */
  async extractCin(file, onProgress) {
    return await this.provider.extractCin(file, onProgress);
  }
}

// Inject the desired provider here. 
// We are now using PaddleOcrProvider (Backend Python) instead of Tesseract (Browser).
export default new OcrService(PaddleOcrProvider);
