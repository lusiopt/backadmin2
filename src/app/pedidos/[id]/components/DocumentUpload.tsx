"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import {
  Upload,
  File,
  X,
  Check,
  AlertCircle,
  FileText,
  Image,
  Download,
  Trash2,
  Eye,
  Loader2
} from "lucide-react";
import { Document, DocumentType } from "@/lib/types";

interface DocumentUploadProps {
  serviceId: string;
  existingDocuments: Document[];
  onUpload: (files: File[]) => void;
  onDelete: (documentId: string) => void;
}

export function DocumentUpload({
  serviceId,
  existingDocuments,
  onUpload,
  onDelete
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentCategories = [
    { type: DocumentType.IDENTITY, label: "Documento de Identidade", required: true },
    { type: DocumentType.BIRTH_CERTIFICATE, label: "Certidão de Nascimento", required: true },
    { type: DocumentType.CRIMINAL_RECORD, label: "Antecedentes Criminais", required: true },
    { type: DocumentType.RESIDENCE_TITLE, label: "Título de Residência", required: false },
    { type: DocumentType.MARRIAGE_CERTIFICATE, label: "Certidão de Casamento", required: false },
    { type: DocumentType.OTHER, label: "Outros Documentos", required: false },
  ];

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    // Filtrar apenas arquivos válidos
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Tipo de arquivo não permitido`);
        return false;
      }

      if (file.size > maxSize) {
        alert(`${file.name}: Arquivo muito grande (máx 10MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setUploadingFiles(validFiles);
      simulateUpload(validFiles);
    }
  };

  const simulateUpload = (files: File[]) => {
    files.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: progress
        }));

        if (progress >= 100) {
          clearInterval(interval);

          // Simular conclusão do upload após 500ms
          setTimeout(() => {
            setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
            onUpload([file]);
          }, 500);
        }
      }, 200);
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('image')) return <Image className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upload de Documentos</h3>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

          <p className="text-gray-600 mb-2">
            Arraste e solte arquivos aqui ou
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              handleFiles(files);
            }}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Selecionar Arquivos
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Formatos aceitos: PDF, JPG, PNG • Máximo: 10MB por arquivo
          </p>
        </div>

        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadingFiles.map(file => (
              <div key={file.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress[file.name] || 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {uploadProgress[file.name] || 0}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Document Categories */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Documentos por Categoria</h3>

        <div className="space-y-4">
          {documentCategories.map(category => {
            const docs = existingDocuments.filter(d => d.type === category.type);
            const hasDocuments = docs.length > 0;

            return (
              <div
                key={category.type}
                className={`p-4 rounded-lg border ${
                  hasDocuments
                    ? 'border-green-200 bg-green-50/50'
                    : category.required
                    ? 'border-red-200 bg-red-50/50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {hasDocuments ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : category.required ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                    )}
                    <h4 className="font-medium">
                      {category.label}
                      {category.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h4>
                  </div>
                  <span className="text-sm text-gray-500">
                    {docs.length} arquivo{docs.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {docs.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {docs.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.url)}
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.size && formatFileSize(doc.size)} •
                              {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                            title="Baixar"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(doc.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!hasDocuments && (
                  <p className="text-sm text-gray-500 mt-2">
                    Nenhum documento enviado
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}