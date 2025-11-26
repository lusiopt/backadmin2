"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ServiceWithRelations } from "@/lib/types";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Send,
  Loader2
} from "lucide-react";

interface LawyerActionsProps {
  service: ServiceWithRelations;
  onAction: (action: string, data: any) => void;
}

export function LawyerActions({ service, onAction }: LawyerActionsProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [approveData, setApproveData] = useState({
    processNumber: "",
    entity: "",
    reference: "",
    notes: ""
  });

  const [refuseData, setRefuseData] = useState({
    justification: "",
    documentsList: [] as string[]
  });

  const [almostData, setAlmostData] = useState({
    justification: "",
    missingDocs: [] as string[]
  });

  const handleSubmit = async (action: string) => {
    setIsSubmitting(true);

    // Simular chamada API
    setTimeout(() => {
      let data = {};

      if (action === 'approve') {
        data = approveData;
      } else if (action === 'refuse') {
        data = refuseData;
      } else if (action === 'almost') {
        data = almostData;
      }

      onAction(action, data);
      setIsSubmitting(false);
      setActiveAction(null);

      // Reset forms
      setApproveData({ processNumber: "", entity: "", reference: "", notes: "" });
      setRefuseData({ justification: "", documentsList: [] });
      setAlmostData({ justification: "", missingDocs: [] });
    }, 1500);
  };

  const canTakeAction =
    service.status === "Passo 7 Esperando" ||
    service.status === "Passo 7" ||
    service.status === "Passo 7 Quase" ||
    service.status === "Passo 7 Recusado";

  if (!canTakeAction) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">Nenhuma ação disponível</p>
          <p className="text-sm mt-1">
            Este processo não está na fase de análise do advogado
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ações do Advogado</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveAction('approve')}
            disabled={isSubmitting}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeAction === 'approve'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
            }`}
          >
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-green-700">Aprovar</p>
            <p className="text-xs text-gray-600 mt-1">
              Documentação completa
            </p>
          </button>

          <button
            onClick={() => setActiveAction('almost')}
            disabled={isSubmitting}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeAction === 'almost'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50'
            }`}
          >
            <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="font-medium text-yellow-700">Quase Completo</p>
            <p className="text-xs text-gray-600 mt-1">
              Faltam documentos
            </p>
          </button>

          <button
            onClick={() => setActiveAction('refuse')}
            disabled={isSubmitting}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeAction === 'refuse'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
            }`}
          >
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="font-medium text-red-700">Recusar</p>
            <p className="text-xs text-gray-600 mt-1">
              Documentação inadequada
            </p>
          </button>
        </div>
      </Card>

      {/* Approve Form */}
      {activeAction === 'approve' && (
        <Card className="p-6 border-green-200 bg-green-50/30">
          <h4 className="font-semibold text-green-700 mb-4">
            Aprovar Processo
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do Processo (IRN) *
              </label>
              <Input
                value={approveData.processNumber}
                onChange={(e) => setApproveData({
                  ...approveData,
                  processNumber: e.target.value
                })}
                placeholder="PT2025123456"
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entidade *
                </label>
                <Input
                  value={approveData.entity}
                  onChange={(e) => setApproveData({
                    ...approveData,
                    entity: e.target.value
                  })}
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referência *
                </label>
                <Input
                  value={approveData.reference}
                  onChange={(e) => setApproveData({
                    ...approveData,
                    reference: e.target.value
                  })}
                  placeholder="123 456 789"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={approveData.notes}
                onChange={(e) => setApproveData({
                  ...approveData,
                  notes: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit('approve')}
                disabled={!approveData.processNumber || !approveData.entity || !approveData.reference || isSubmitting}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Aprovar e Enviar para Cliente
              </button>
              <button
                onClick={() => setActiveAction(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Almost Form */}
      {activeAction === 'almost' && (
        <Card className="p-6 border-yellow-200 bg-yellow-50/30">
          <h4 className="font-semibold text-yellow-700 mb-4">
            Marcar como Quase Completo
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documentos Faltantes *
              </label>
              <div className="space-y-2">
                {[
                  "Certidão de Nascimento",
                  "Antecedentes Criminais",
                  "Comprovante de Residência",
                  "Certidão de Casamento",
                  "Título de Residência",
                  "Outros"
                ].map(doc => (
                  <label key={doc} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={almostData.missingDocs.includes(doc)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAlmostData({
                            ...almostData,
                            missingDocs: [...almostData.missingDocs, doc]
                          });
                        } else {
                          setAlmostData({
                            ...almostData,
                            missingDocs: almostData.missingDocs.filter(d => d !== doc)
                          });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{doc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justificação Detalhada *
              </label>
              <textarea
                value={almostData.justification}
                onChange={(e) => setAlmostData({
                  ...almostData,
                  justification: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Explique quais documentos faltam e como obtê-los..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit('almost')}
                disabled={almostData.missingDocs.length === 0 || !almostData.justification || isSubmitting}
                className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar Solicitação ao Cliente
              </button>
              <button
                onClick={() => setActiveAction(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Refuse Form */}
      {activeAction === 'refuse' && (
        <Card className="p-6 border-red-200 bg-red-50/30">
          <h4 className="font-semibold text-red-700 mb-4">
            Recusar Processo
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo da Recusa *
              </label>
              <textarea
                value={refuseData.justification}
                onChange={(e) => setRefuseData({
                  ...refuseData,
                  justification: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={5}
                placeholder="Explique detalhadamente o motivo da recusa e o que o cliente precisa fazer..."
              />
            </div>

            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
              <p className="text-sm text-red-700">
                <strong>Atenção:</strong> Esta ação irá notificar o cliente que o processo foi recusado.
                Certifique-se de fornecer instruções claras sobre como proceder.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit('refuse')}
                disabled={!refuseData.justification || isSubmitting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Confirmar Recusa
              </button>
              <button
                onClick={() => setActiveAction(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}