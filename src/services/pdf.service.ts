import * as pdfjsLib from 'pdfjs-dist';

// Configure CDN worker for client-side processing
const pdfjsVersion = pdfjsLib.version;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

export const pdfService = {
  /**
   * Extracts raw text contents from a PDF File in the browser.
   * 
   * @param file PDF File object from a drag-and-drop or file input
   * @returns extracted text string
   */
  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
        disableFontFace: true
      });
      
      const pdf = await loadingTask.promise;
      let extractedText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
          
        extractedText += `${pageText}\n`;
      }

      return extractedText.trim();
    } catch (err: any) {
      console.error('PDF text extraction failure:', err);
      throw new Error(`Failed to extract text from PDF: ${err.message || 'Invalid format'}`);
    }
  }
};
