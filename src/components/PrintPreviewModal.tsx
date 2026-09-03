import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, Download, ExternalLink, X, Copy, Check, 
  FileText, AlertCircle, Info, RefreshCw 
} from 'lucide-react';
import { PrintModalData, subscribeToPrint, triggerDirectPrint } from '../utils/printService';

export const PrintPreviewModal: React.FC = () => {
  const [printData, setPrintData] = useState<PrintModalData | null>(null);
  const [copied, setCopied] = useState(false);
  const [directPrintError, setDirectPrintError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPrint((data) => {
      setPrintData(data);
      setDirectPrintError(null);
      setCopied(false);
    });
    return unsubscribe;
  }, []);

  // Generate a Blob URL for direct opening and downloading
  useEffect(() => {
    if (!printData?.htmlContent) {
      setBlobUrl('');
      return;
    }

    try {
      const blob = new Blob([printData.htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Erro ao gerar Blob URL:', e);
    }
  }, [printData?.htmlContent]);

  if (!printData || !printData.isOpen) {
    return null;
  }

  const handleClose = () => {
    setPrintData(null);
    setDirectPrintError(null);
  };

  const handleDownload = () => {
    if (!printData) return;
    try {
      const blob = new Blob([printData.htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = printData.filename || 'documento_insanos_mc.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Erro ao baixar arquivo:', e);
    }
  };

  const handleCopyText = async () => {
    if (!printData) return;
    try {
      // Extract text content from html
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = printData.htmlContent;
      const text = tempDiv.innerText || tempDiv.textContent || '';
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Erro ao copiar texto:', e);
    }
  };

  const handleDirectPrintClick = () => {
    setDirectPrintError(null);
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } else {
        triggerDirectPrint();
      }
    } catch (e: any) {
      console.warn('Impressão direta bloqueada pelo navegador no iframe:', e);
      setDirectPrintError(
        'O navegador bloqueou a janela de impressão dentro do modo embutido. Por favor, clique no botão "Abrir em Nova Guia" para imprimir com 100% de compatibilidade.'
      );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      id="print-preview-modal-container"
    >
      <div 
        className="bg-[#12151c] border border-zinc-700/80 rounded-2xl w-full max-w-5xl h-[94vh] flex flex-col shadow-2xl overflow-hidden"
        id="print-preview-modal-dialog"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#181c24] border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-950/70 border border-red-800/80 rounded-xl text-red-400">
              <Printer size={18} />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-white text-base tracking-wide flex items-center gap-2">
                <span>Central de Impressão & Exportação</span>
                <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-800">
                  Documento Oficial
                </span>
              </h3>
              <p className="text-xs text-zinc-400 truncate max-w-md sm:max-w-xl">
                {printData.title}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Fechar Visualização"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-3 bg-[#14171f] border-b border-zinc-800/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary: Open in New Tab for 100% Unrestricted Printing */}
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2"
                title="Abre o documento em uma nova aba onde o diálogo de impressão é acionado sem bloqueios de segurança."
              >
                <ExternalLink size={15} />
                <span>Abrir em Nova Guia (Imprimir / Salvar PDF)</span>
              </a>
            )}

            {/* Direct Print Attempt */}
            <button
              type="button"
              onClick={handleDirectPrintClick}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-xl text-xs transition border border-zinc-700 flex items-center gap-1.5"
              title="Tenta acionar o diálogo de impressão diretamente nesta janela"
            >
              <Printer size={15} className="text-amber-400" />
              <span>Imprimir Agora</span>
            </button>

            {/* Download File */}
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-xl text-xs transition border border-zinc-700 flex items-center gap-1.5"
              title="Baixar arquivo HTML autocontido com todas as formatações para salvar ou imprimir depois"
            >
              <Download size={15} className="text-emerald-400" />
              <span>Baixar Arquivo</span>
            </button>

            {/* Copy Content */}
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium rounded-xl text-xs transition border border-zinc-750 flex items-center gap-1.5"
              title="Copiar texto do documento para a área de transferência"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Info size={13} className="text-zinc-500" />
            <span>Formato A4 • Op. Sid</span>
          </div>
        </div>

        {/* Security Warning Notice (if direct print throws an error in iframe) */}
        {directPrintError && (
          <div className="mx-5 mt-3 p-3 bg-amber-950/70 border border-amber-800/80 rounded-xl text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-300">Aviso de Segurança do Navegador:</p>
              <p className="mt-0.5 text-zinc-300">{directPrintError}</p>
              <div className="mt-2">
                {blobUrl && (
                  <a
                    href={blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-red-400 hover:text-red-300 underline"
                  >
                    <span>Clique aqui para abrir em nova guia</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Stage */}
        <div className="flex-1 bg-[#090b0e] p-3 sm:p-6 overflow-y-auto flex justify-center">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden border border-zinc-400 flex flex-col min-h-[600px] text-black">
            <iframe
              ref={iframeRef}
              title={printData.title}
              srcDoc={printData.htmlContent}
              className="w-full flex-1 border-none min-h-[700px] bg-white"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#181c24] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="text-[11px] text-zinc-500">
            💡 Dica: Para salvar em PDF pelo navegador, escolha "Salvar como PDF" no destino da impressora.
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
