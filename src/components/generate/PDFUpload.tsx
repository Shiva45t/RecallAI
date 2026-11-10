import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { pdfService } from '../../services/pdf.service';
import { useUIStore } from '../../stores/ui.store';
import { UploadCloud, FileText, X, Sparkles } from 'lucide-react';

interface PDFUploadProps {
  onSubmit: (extractedText: string, count: number) => void;
  isLoading: boolean;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onSubmit, isLoading }) => {
  const { addToast } = useUIStore();
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [count, setCount] = useState(10);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      addToast('Please select a valid PDF file.', 'warning');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        addToast('Please select a valid PDF file.', 'warning');
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!file) return;
    
    setExtracting(true);
    try {
      addToast('Extracting text from PDF client-side...', 'info');
      const text = await pdfService.extractText(file);
      
      if (!text || text.length < 50) {
        throw new Error('Not enough readable text found in PDF. Make sure it is not scanned.');
      }
      
      onSubmit(text, count);
    } catch (err: any) {
      addToast(err.message || 'Failed to extract text from PDF.', 'error');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-5">
      {!file ? (
        /* Drag area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-950/10'
              : 'border-gray-200 dark:border-gray-800 hover:border-indigo-500/40 hover:bg-gray-50/50 dark:hover:bg-darkSurface/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-150 mb-1">
            Drag & Drop PDF here
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            or click to browse from device (PDF is parsed locally)
          </p>
        </div>
      ) : (
        /* Selected file banner */
        <div className="flex items-center justify-between border border-gray-200 dark:border-gray-800 p-4 rounded-xl bg-gray-50/50 dark:bg-darkSurface/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate pr-4">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            disabled={isLoading || extracting}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {file && (
        <div className="space-y-4">
          {/* Card Count selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-707 dark:text-gray-305">
              Number of Cards
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCount(num)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-all active:scale-[0.98] ${
                    count === num
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-white dark:bg-darkSurface border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isLoading || extracting}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            className="w-full gap-2"
            isLoading={isLoading || extracting}
          >
            <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
            {extracting ? 'Extracting text...' : 'Generate AI Cards'}
          </Button>
        </div>
      )}
    </div>
  );
};
