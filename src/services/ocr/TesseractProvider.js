import Tesseract from 'tesseract.js';

/**
 * Tesseract OCR Provider
 * Implements the OCR reading logic entirely in the browser using WebAssembly.
 * 
 * SOLID: This class has the Single Responsibility of communicating with Tesseract.js.
 */
class TesseractProvider {
  /**
   * Extracts text and finds the CIN number from an image file.
   * @param {File} file - The image file to scan
   * @param {Function} onProgress - Callback for scan progress (0-100)
   * @returns {Promise<string|null>} The extracted CIN or null if not found
   */
  async extractCin(file, onProgress) {
    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'fra', // French language model handles standard latin characters well
        {
          logger: (m) => {
            if (m.status === 'recognizing text' && onProgress) {
              onProgress(Math.round(m.progress * 100));
            }
          }
        }
      );
      
      // Clean up the text (remove spaces, newlines, etc. just for regex matching if needed)
      // The Moroccan CIN format: 1 or 2 uppercase letters followed by 4 to 6 digits.
      // Example: AB123456 or A12345
      const match = text.match(/[A-Z]{1,2}\d{4,6}/);
      
      return match ? match[0] : null;
    } catch (error) {
      console.error('Tesseract Error:', error);
      throw new Error('Erreur lors de la lecture de l\'image.');
    }
  }
}

export default new TesseractProvider();
