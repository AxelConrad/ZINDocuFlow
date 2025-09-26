
import React, { useState, useEffect } from "react";
import { Document } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload as UploadIcon, FileText, Check, GitBranchPlus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

import FileUploadZone from "../components/upload/FileUploadZone";
import ExistingVersionConfirmModal from "../components/upload/ExistingVersionConfirmModal"; // ADDED

const DOCUMENT_TYPES = [
  "Handbuch",
  "Datenblatt", 
  "Zertifikat",
  "Spezifikation",
  "Anleitung",
  "Sonstiges"
];

export default function Upload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Aktuelles Datum als Standard setzen
  const getTodayDate = () => {
    const today = new Date();
    // Format to YYYY-MM-DD for input type="date"
    return today.toISOString().split('T')[0];
  };

  const [metadata, setMetadata] = useState({
    name: "",
    hersteller: "",
    produkt: "",
    gehoert_zu: "", // Added new field
    dokumentart: "",
    datum: getTodayDate() // Aktuelles Datum vorausfüllen
  });
  const [updatingDocument, setUpdatingDocument] = useState(null);
  const [isExistingVersionModalOpen, setIsExistingVersionModalOpen] = useState(false); // ADDED
  const [conflictingDocument, setConflictingDocument] = useState(null); // ADDED

  useEffect(() => {
    const docIdToUpdate = searchParams.get("updateFor");
    if (docIdToUpdate) {
      const fetchDocument = async () => {
        try {
          const doc = await Document.get(docIdToUpdate);
          setUpdatingDocument(doc);
          setMetadata({
            name: doc.name,
            hersteller: doc.hersteller,
            produkt: doc.produkt,
            gehoert_zu: doc.gehoert_zu || "", // Populate new field from document, default to empty string
            dokumentart: doc.dokumentart,
            datum: doc.datum // Bei Updates das originale Datum beibehalten
          });
        } catch (err) {
          console.error("Error fetching document to update:", err);
          setError("Das zu aktualisierende Dokument konnte nicht gefunden werden.");
        }
      };
      fetchDocument();
    } else {
      // Bei neuen Dokumenten das aktuelle Datum setzen, falls die URL von update zu neu wechselt
      // oder wenn der Component mountet und kein updateFor Parameter vorhanden ist.
      setMetadata(prev => ({
        ...prev,
        datum: getTodayDate()
      }));
    }
  }, [searchParams]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    // Auto-fill name only if it's a new document
    if (!updatingDocument) {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setMetadata(prev => ({
        ...prev,
        name: fileName
      }));
    }
    setError("");
  };

  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Removed checkForExistingDocument as its logic is now integrated into startUploadProcess and handleUpload
  // const checkForExistingDocument = async (fileName) => {
  //   const existingDocs = await Document.filter({ file_name: fileName });
  //   return existingDocs.length > 0 ? Math.max(...existingDocs.map(doc => doc.version_number)) + 1 : 1;
  // };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Bitte wählen Sie eine neue Datei aus");
      return;
    }

    // Wenn wir explizit eine neue Version erstellen (updatingDocument ist gesetzt), die Prüfung überspringen
    if (!updatingDocument) {
      const existingDocs = await Document.filter({ file_name: selectedFile.name });
      if (existingDocs.length > 0) {
        // Die neuste Version des existierenden Dokuments finden
        const latestVersion = existingDocs.sort((a,b) => b.version_number - a.version_number)[0];
        setConflictingDocument(latestVersion);
        setIsExistingVersionModalOpen(true);
        return; // Upload stoppen und auf User-Input warten
      }
    }

    // Wenn alle Felder ausgefüllt sind, den Upload-Prozess starten
    if (!metadata.name || !metadata.hersteller || !metadata.produkt || !metadata.dokumentart || !metadata.datum) {
      setError("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    await startUploadProcess();
  };

  const startUploadProcess = async (useConflictingDocMetadata = false) => {
    setIsUploading(true);
    setError("");
    setIsExistingVersionModalOpen(false); // Ensure modal is closed when starting upload

    try {
      // 1. Upload new file
      const { file_url } = await UploadFile({ file: selectedFile });
      
      // 2. Determine file name for versioning
      // If useConflictingDocMetadata is true, use data from conflictingDocument.
      // Otherwise, if updatingDocument is set, use its data.
      // If neither, it's a completely new file, so base version is 0.
      const docToUseForMetadata = useConflictingDocMetadata ? conflictingDocument : updatingDocument;
      const versioningFileName = docToUseForMetadata ? docToUseForMetadata.file_name : selectedFile.name;
      const currentVersion = docToUseForMetadata ? docToUseForMetadata.version_number : 0;

      // 3. Create data payload based on whether to use conflicting doc's metadata
      const dataToCreate = useConflictingDocMetadata
        ? {
            name: conflictingDocument.name,
            hersteller: conflictingDocument.hersteller,
            produkt: conflictingDocument.produkt,
            gehoert_zu: conflictingDocument.gehoert_zu,
            dokumentart: conflictingDocument.dokumentart,
            datum: getTodayDate(), // Datum auf heute setzen for new version
          }
        : metadata; // Use current form metadata

      // 4. Create new document record
      await Document.create({
        ...dataToCreate,
        file_url,
        file_name: versioningFileName,
        version_number: currentVersion + 1, // Increment version number
        file_size: selectedFile.size
      });

      setUploadSuccess(true);
      
      // Reset form after 2 seconds and navigate to dashboard
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);

    } catch (error) {
      setError("Fehler beim Hochladen. Bitte versuchen Sie es erneut.");
      console.error("Upload error:", error);
    }
    
    setIsUploading(false);
  };
  
  const handleConfirmNewVersionFromConflict = () => {
    setIsExistingVersionModalOpen(false);
    startUploadProcess(true); // Pass true to use conflicting document's metadata
  };

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {updatingDocument ? "Version erfolgreich erstellt!" : "Upload erfolgreich!"}
            </h2>
            <p className="text-slate-600">Das Dokument wurde erfolgreich gespeichert.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pageTitle = updatingDocument ? "Neue Version erstellen" : "Dokument hochladen";
  const pageDescription = updatingDocument 
    ? `Laden Sie eine neue Datei für "${updatingDocument.name}" hoch.`
    : "Laden Sie ein neues Dokument mit Metadaten hoch";

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{pageTitle}</h1>
            <p className="text-slate-600 mt-1">{pageDescription}</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* File Upload */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="w-5 h-5 text-blue-600" />
                Neue Datei auswählen *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
              />
            </CardContent>
          </Card>

          {/* Metadata Form */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Dokumenten-Informationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={metadata.name}
                  onChange={(e) => handleMetadataChange("name", e.target.value)}
                  placeholder="Name des Dokuments"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="hersteller">Hersteller *</Label>
                <Input
                  id="hersteller"
                  value={metadata.hersteller}
                  onChange={(e) => handleMetadataChange("hersteller", e.target.value)}
                  placeholder="Hersteller"
                  className="mt-1"
                  disabled={!!updatingDocument}
                  aria-disabled={!!updatingDocument}
                />
              </div>

              <div>
                <Label htmlFor="produkt">Produkt *</Label>
                <Input
                  id="produkt"
                  value={metadata.produkt}
                  onChange={(e) => handleMetadataChange("produkt", e.target.value)}
                  placeholder="Produktname"
                  className="mt-1"
                  disabled={!!updatingDocument}
                  aria-disabled={!!updatingDocument}
                />
              </div>

              {/* New 'gehoert_zu' field */}
              <div>
                <Label htmlFor="gehoert_zu">Gehört zu</Label>
                <Input
                  id="gehoert_zu"
                  value={metadata.gehoert_zu}
                  onChange={(e) => handleMetadataChange("gehoert_zu", e.target.value)}
                  placeholder="Weitere Kategorisierung"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="dokumentart">Dokumentart *</Label>
                <Select 
                  value={metadata.dokumentart} 
                  onValueChange={(value) => handleMetadataChange("dokumentart", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Dokumentart auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="datum">Datum *</Label>
                <Input
                  id="datum"
                  type="date"
                  value={metadata.datum}
                  onChange={(e) => handleMetadataChange("datum", e.target.value)}
                  className="mt-1"
                />
                {!updatingDocument && (
                  <p className="text-sm text-slate-500 mt-1">
                    Standardmäßig auf heutiges Datum gesetzt
                  </p>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                {updatingDocument ? <GitBranchPlus className="w-4 h-4 mr-2" /> : <UploadIcon className="w-4 h-4 mr-2" />}
                {isUploading ? "Wird hochgeladen..." : (updatingDocument ? "Neue Version speichern" : "Dokument speichern")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ExistingVersionConfirmModal
        isOpen={isExistingVersionModalOpen}
        onClose={() => {
          setIsExistingVersionModalOpen(false);
          setError(""); // Clear any previous error state
          setConflictingDocument(null); // Clear conflicting document
        }}
        onConfirm={handleConfirmNewVersionFromConflict}
        existingDocument={conflictingDocument}
        newFileName={selectedFile?.name}
      />
    </div>
  );
}
