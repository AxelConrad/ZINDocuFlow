import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle } from "lucide-react";

export default function FileUploadZone({ onFileSelect, selectedFile }) {
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  }, [onFileSelect]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const openFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInput}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
      />
      
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive 
            ? "border-blue-400 bg-blue-50" 
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        {!selectedFile ? (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Datei hierher ziehen oder auswählen
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              PDF, Word, oder Bilddateien werden unterstützt
            </p>
            <Button 
              type="button"
              onClick={openFileBrowser}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Datei auswählen
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Datei ausgewählt
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-slate-500" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-sm text-slate-600">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            </div>
            <Button 
              type="button"
              variant="outline"
              onClick={openFileBrowser}
            >
              Andere Datei auswählen
            </Button>
          </>
        )}
      </div>
    </div>
  );
}