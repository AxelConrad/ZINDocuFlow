
import React, { useState, useEffect, useCallback } from "react";
import { Document } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, LayoutGrid, List } from "lucide-react";

import DocumentGrid from "../components/documents/DocumentGrid";
import DocumentTable from "../components/documents/DocumentTable";
import DocumentFilters from "../components/documents/DocumentFilters";
import DocumentEditModal from "../components/documents/DocumentEditModal";
import DocumentPreviewModal from "../components/documents/DocumentPreviewModal";
import DeleteConfirmModal from "../components/documents/DeleteConfirmModal";
import DocumentVersionHistoryModal from "../components/documents/DocumentVersionHistoryModal";
import BulkEditModal from "../components/documents/BulkEditModal";
import BulkDeleteModal from "../components/documents/BulkDeleteModal";
import NewVersionConfirmModal from "../components/documents/NewVersionConfirmModal";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [deleteDocument, setDeleteDocument] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [versionHistoryDocument, setVersionHistoryDocument] = useState(null);
  const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    dokumentart: "all",
    hersteller: "all",
    gehoert_zu: "all"
  });
  const [viewMode, setViewMode] = useState("grid");

  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [newVersionDocument, setNewVersionDocument] = useState(null);
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);

  const navigate = useNavigate();

  const applyFilters = useCallback(() => {
    let filtered = documents;

    // Suchfilter
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(lowercasedSearchTerm) ||
        (doc.hersteller && doc.hersteller.toLowerCase().includes(lowercasedSearchTerm)) ||
        (doc.produkt && doc.produkt.toLowerCase().includes(lowercasedSearchTerm)) ||
        (doc.gehoert_zu && doc.gehoert_zu.toLowerCase().includes(lowercasedSearchTerm))
      );
    }

    // Kategorie-Filter
    if (filters.dokumentart !== "all") {
      filtered = filtered.filter(doc => doc.dokumentart === filters.dokumentart);
    }

    if (filters.hersteller !== "all") {
      filtered = filtered.filter(doc => doc.hersteller === filters.hersteller);
    }

    if (filters.gehoert_zu !== "all") {
      filtered = filtered.filter(doc => doc.gehoert_zu === filters.gehoert_zu);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, filters]);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const allDocs = await Document.list(); // Alle Dokumente laden

      // Nur die jeweils neueste Version jedes Dokuments herausfiltern
      const latestVersionsMap = new Map();
      allDocs.forEach(doc => {
        // Use a unique identifier for the document family, e.g., file_name or original_doc_id
        // Assuming file_name is sufficient to group versions of the same logical document.
        if (!latestVersionsMap.has(doc.file_name) || doc.version_number > latestVersionsMap.get(doc.file_name).version_number) {
          latestVersionsMap.set(doc.file_name, doc);
        }
      });
      
      const uniqueLatestDocs = Array.from(latestVersionsMap.values());
      const sortedDocs = uniqueLatestDocs.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));

      setDocuments(sortedDocs);
    } catch (error) {
      console.error("Fehler beim Laden der Dokumente:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditDocument = (document) => {
    setSelectedDocument(document);
    setIsEditModalOpen(true);
  };

  const handlePreviewDocument = (document) => {
    setPreviewDocument(document);
    setIsPreviewModalOpen(true);
  };

  const handleDeleteDocument = (document) => {
    setDeleteDocument(document);
    setIsDeleteModalOpen(true);
  };

  const handleShowVersionHistory = (document) => {
    setVersionHistoryDocument(document);
    setIsVersionHistoryModalOpen(true);
  };

  const handlePreviewVersion = (versionDocument) => {
    setPreviewDocument(versionDocument);
    setIsPreviewModalOpen(true);
    setIsVersionHistoryModalOpen(false);
  };

  const handleNewVersion = (document) => {
    setNewVersionDocument(document);
    setIsNewVersionModalOpen(true);
  };

  const handleNewVersionConfirm = (document) => {
    setIsNewVersionModalOpen(false); // Close the modal first
    navigate(createPageUrl(`Upload?updateFor=${document.id}`));
  };

  const handleConfirmDelete = async () => {
    if (!deleteDocument) return;

    setIsDeleting(true);
    try {
      await Document.delete(deleteDocument.id);
      setIsDeleteModalOpen(false);
      setDeleteDocument(null);
      await loadDocuments();
    } catch (error) {
      console.error("Fehler beim Löschen des Dokuments:", error);
    }
    setIsDeleting(false);
  };

  const handleUpdateDocument = async (updatedData) => {
    if (!selectedDocument) return;
    await Document.update(selectedDocument.id, updatedData);
    setIsEditModalOpen(false);
    setSelectedDocument(null);
    await loadDocuments();
  };

  const getUniqueValues = (field) => {
    return [...new Set(documents.map(doc => doc[field]))].filter(Boolean);
  };

  const handleSelectDocument = (documentId) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleBulkEdit = () => {
    setIsBulkEditModalOpen(true);
  };

  const handleBulkEditUpdate = async (updateData) => {
    try {
      await Promise.all(selectedDocuments.map(docId => 
        Document.update(docId, updateData)
      ));
      
      setIsBulkEditModalOpen(false);
      setSelectedDocuments([]);
      await loadDocuments();
    } catch (error) {
      console.error("Fehler beim Bulk-Update:", error);
    }
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteModalOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedDocuments.map(docId => 
        Document.delete(docId)
      ));
      
      setIsBulkDeleteModalOpen(false);
      setSelectedDocuments([]);
      await loadDocuments();
    } catch (error) {
      console.error("Fehler beim Bulk-Delete:", error);
    }
    setIsBulkDeleting(false);
  };

  const getSelectedDocuments = () => {
    return documents.filter(doc => selectedDocuments.includes(doc.id));
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dokumenten-Verwaltung</h1>
            <p className="text-slate-600">
              {filteredDocuments.length} von {documents.length} Dokumenten angezeigt
            </p>
          </div>
          <Link to={createPageUrl("Upload")}>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Neues Dokument
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Dokumente durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <DocumentFilters 
                filters={filters}
                setFilters={setFilters}
                availableTypes={getUniqueValues("dokumentart")}
                availableManufacturers={getUniqueValues("hersteller")}
                availableGehoertZu={getUniqueValues("gehoert_zu")}
              />
            </div>
            <div className="flex items-center gap-2 mt-4 lg:mt-0">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Document Grid or Table */}
        {viewMode === "grid" ? (
          <DocumentGrid 
            documents={filteredDocuments}
            isLoading={isLoading}
            onEditDocument={handleEditDocument}
            onPreviewDocument={handlePreviewDocument}
            onDeleteDocument={handleDeleteDocument}
            onShowVersionHistory={handleShowVersionHistory}
            onNewVersion={handleNewVersion}
          />
        ) : (
          <DocumentTable
            documents={filteredDocuments}
            isLoading={isLoading}
            onEditDocument={handleEditDocument}
            onPreviewDocument={handlePreviewDocument}
            onDeleteDocument={handleDeleteDocument}
            onShowVersionHistory={handleShowVersionHistory}
            onNewVersion={handleNewVersion}
            selectedDocuments={selectedDocuments}
            onSelectDocument={handleSelectDocument}
            onSelectAll={handleSelectAll}
            onBulkDelete={handleBulkDelete}
            onBulkEdit={handleBulkEdit}
          />
        )}

        {/* Edit Modal */}
        <DocumentEditModal
          document={selectedDocument}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateDocument}
        />

        {/* Preview Modal */}
        <DocumentPreviewModal
          document={previewDocument}
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          document={deleteDocument}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />

        {/* Version History Modal */}
        <DocumentVersionHistoryModal
          document={versionHistoryDocument}
          isOpen={isVersionHistoryModalOpen}
          onClose={() => setIsVersionHistoryModalOpen(false)}
          onPreviewVersion={handlePreviewVersion}
        />

        {/* Bulk Edit Modal */}
        <BulkEditModal
          documents={getSelectedDocuments()}
          isOpen={isBulkEditModalOpen}
          onClose={() => setIsBulkEditModalOpen(false)}
          onUpdate={handleBulkEditUpdate}
        />

        {/* Bulk Delete Modal */}
        <BulkDeleteModal
          documents={getSelectedDocuments()}
          isOpen={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          onConfirm={handleBulkDeleteConfirm}
          isDeleting={isBulkDeleting}
        />

        {/* New Version Confirm Modal */}
        <NewVersionConfirmModal
          document={newVersionDocument}
          isOpen={isNewVersionModalOpen}
          onClose={() => setIsNewVersionModalOpen(false)}
          onConfirm={handleNewVersionConfirm}
        />
      </div>
    </div>
  );
}
