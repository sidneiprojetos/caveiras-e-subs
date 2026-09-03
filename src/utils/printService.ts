import { Member, Divisao, ActivityLog } from '../types';
import { formatDateBR } from './dateUtils';

export interface PrintModalData {
  isOpen: boolean;
  title: string;
  htmlContent: string;
  rawText?: string;
  filename: string;
}

type PrintListener = (data: PrintModalData) => void;
const listeners: Set<PrintListener> = new Set();

export function subscribeToPrint(listener: PrintListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function triggerDirectPrint() {
  try {
    window.print();
  } catch (e) {
    console.warn('Erro ao chamar window.print():', e);
  }
}

/**
 * Builds the complete, standalone HTML document with embedded CSS, fonts and responsive print layouts.
 */
export function buildDocumentHtml(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} • Gestão Operacional Sidnei</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Teko:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    @page {
      size: A4;
      margin: 12mm 15mm 15mm 15mm;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111111;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
    }
    h1, h2, h3, .font-cinzel {
      font-family: 'Cinzel', serif;
      letter-spacing: 0.5px;
    }
    .font-teko {
      font-family: 'Teko', sans-serif;
      letter-spacing: 1px;
    }

    /* Screen mode top navigation bar (hidden when printed) */
    @media screen {
      .screen-toolbar {
        position: sticky;
        top: 0;
        background: #0f1218;
        color: #ffffff;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 15px rgba(0,0,0,0.35);
        margin-bottom: 24px;
        z-index: 1000;
        border-bottom: 2px solid #b91c1c;
      }
      .screen-toolbar-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 14px;
        color: #ffffff;
      }
      .screen-actions {
        display: flex;
        gap: 10px;
      }
      .btn-print {
        background: #dc2626;
        color: #ffffff;
        border: none;
        padding: 8px 18px;
        border-radius: 6px;
        font-weight: 800;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        cursor: pointer;
        transition: background 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .btn-print:hover {
        background: #b91c1c;
      }
      .btn-close {
        background: #27272a;
        color: #e4e4e7;
        border: 1px solid #3f3f46;
        padding: 8px 14px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
      }
      .btn-close:hover {
        background: #3f3f46;
      }
      .document-wrapper {
        padding: 0 20px 40px 20px;
        max-width: 900px;
        margin: 0 auto;
      }
    }

    @media print {
      .no-print, .screen-toolbar {
        display: none !important;
      }
      .document-wrapper {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
    }

    /* Common Document Layout Styles */
    .header-bar {
      border-bottom: 3px solid #b91c1c;
      padding-bottom: 12px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-title {
      font-size: 21pt;
      font-weight: 900;
      color: #991b1b;
      margin: 0;
      text-transform: uppercase;
    }
    .sub-title {
      font-size: 9pt;
      color: #555555;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .meta-badge {
      text-align: right;
      font-size: 8.5pt;
      color: #444444;
      line-height: 1.35;
    }
    .section-title {
      font-size: 10.5pt;
      font-weight: 800;
      color: #7f1d1d;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 16px;
      margin-bottom: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px 20px;
      margin-bottom: 14px;
    }
    .info-item {
      border-bottom: 1px dotted #cbd5e1;
      padding-bottom: 4px;
    }
    .info-label {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      display: block;
    }
    .info-value {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
    }
    .badge-caveira {
      background-color: #fef2f2;
      color: #991b1b;
      border: 1.5px solid #b91c1c;
    }
    .badge-subdiretor {
      background-color: #fffbeb;
      color: #92400e;
      border: 1.5px solid #d97706;
    }
    .badge-regional {
      background-color: #f0fdf4;
      color: #166534;
      border: 1.5px solid #16a34a;
    }
    .badge-subcaveira {
      background-color: #faf5ff;
      color: #6b21a8;
      border: 1.5px solid #9333ea;
    }
    .table-print {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 9pt;
    }
    .table-print th {
      background-color: #18181b;
      color: #ffffff;
      text-transform: uppercase;
      font-weight: 700;
      font-size: 7.5pt;
      letter-spacing: 0.5px;
      padding: 6.5px 8px;
      text-align: left;
      border: 1px solid #18181b;
    }
    .table-print td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .table-print tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .signature-area {
      margin-top: 35px;
      display: flex;
      justify-content: space-around;
      page-break-inside: avoid;
    }
    .signature-box {
      text-align: center;
      width: 220px;
    }
    .signature-line {
      border-top: 1.5px solid #334155;
      margin-bottom: 5px;
    }
    .signature-name {
      font-size: 8.5pt;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
    }
    .signature-role {
      font-size: 7.5pt;
      color: #64748b;
      text-transform: uppercase;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      page-break-inside: avoid;
    }
    .id-card {
      border: 2px solid #1e293b;
      border-radius: 8px;
      padding: 12px;
      background: #fafafa;
      page-break-inside: avoid;
      position: relative;
    }
    .id-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #b91c1c;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .id-card-title {
      font-size: 11pt;
      font-weight: 900;
      color: #991b1b;
      font-family: 'Cinzel', serif;
    }
    .footer-stamp {
      text-align: center;
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 25px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <div class="screen-toolbar no-print">
    <div class="screen-toolbar-title">
      <span style="font-size: 18px;">💀</span>
      <span>${title} • Gestão Operacional Sidnei</span>
    </div>
    <div class="screen-actions">
      <button class="btn-print" onclick="window.print()">
        🖨️ Imprimir / Salvar PDF
      </button>
      <button class="btn-close" onclick="window.close()">
        ✕ Fechar Guia
      </button>
    </div>
  </div>

  <div class="document-wrapper">
    ${bodyContent}
  </div>

  <script>
    // Automatically open print dialog only if this document is loaded as the top-level window (in a standalone tab)
    if (window.self === window.top) {
      window.addEventListener('load', function() {
        setTimeout(function() {
          try {
            window.print();
          } catch (e) {
            console.warn('Auto print trigger:', e);
          }
        }, 400);
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Dispatches the document to the PrintPreviewModal and listeners.
 */
export function printHtmlContent(title: string, bodyContent: string, filename?: string): Promise<boolean> {
  const fullHtml = buildDocumentHtml(title, bodyContent);
  const cleanFilename = filename || `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`;

  const modalData: PrintModalData = {
    isOpen: true,
    title,
    htmlContent: fullHtml,
    filename: cleanFilename
  };

  // Notify all open modals
  listeners.forEach(fn => fn(modalData));

  return Promise.resolve(true);
}

/**
 * Prints Member Dossier / Registration Card (Ficha Cadastral do Integrante)
 */
export function printMemberDossier(member: Member): Promise<boolean> {
  const printDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getBadgeClass = (g: string) => {
    if (g === 'Caveira') return 'badge-caveira';
    if (g === 'Subdiretor') return 'badge-subdiretor';
    if (g === 'Operacional Regional') return 'badge-regional';
    return 'badge-subcaveira';
  };

  const html = `
    <div class="header-bar">
      <div>
        <h1 class="logo-title">Gestão Operacional Sidnei</h1>
        <div class="sub-title">Dossiê Oficial do Integrante • Divisão ${member.divisaoName}</div>
      </div>
      <div class="meta-badge">
        <div><strong>Documento Oficial de Registro</strong></div>
        <div>Emissão: ${printDate}</div>
        <div>Situação: <span style="color: ${member.status === 'Ativo' ? '#166534' : '#991b1b'}; font-weight: 800;">${member.status.toUpperCase()}</span></div>
      </div>
    </div>

    <div style="display: flex; gap: 20px; align-items: center; background: #fdf2f2; border: 1.5px solid #f87171; border-radius: 8px; padding: 14px; margin-bottom: 18px;">
      <div style="width: 70px; height: 70px; background: #991b1b; color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24pt; font-family: 'Cinzel', serif; font-weight: 900;">
        ${member.vulgo.charAt(0)}
      </div>
      <div style="flex: 1;">
        <div style="font-size: 18pt; font-weight: 900; font-family: 'Cinzel', serif; color: #111111;">
          ${member.vulgo}
        </div>
        <div style="font-size: 11pt; color: #444444; font-weight: 600;">
          ${member.name}
        </div>
        <div style="margin-top: 6px;">
          <span class="badge ${getBadgeClass(member.grupamento)}">${member.grupamento}</span>
          <span style="font-size: 9.5pt; font-weight: 700; color: #444444; margin-left: 10px;">
            Divisão: <strong style="color: #111111;">${member.divisaoName}</strong>
          </span>
        </div>
      </div>
    </div>

    <div class="section-title">1. Dados Estruturais & Grupamento</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Divisão Regional</span>
        <span class="info-value">${member.divisaoName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Grupamento / Patente</span>
        <span class="info-value">${member.grupamento}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Situação Cadastral</span>
        <span class="info-value">${member.status}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Data de Entrada</span>
        <span class="info-value">${formatDateBR(member.entryDate)}</span>
      </div>
    </div>

    <div class="section-title">2. Identificação & Contato</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Nome de Colete</span>
        <span class="info-value" style="font-weight: 800; color: #991b1b;">${member.vulgo}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Nome Civil Completo</span>
        <span class="info-value">${member.name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Telefone / WhatsApp</span>
        <span class="info-value">${member.phone || 'Não informado'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Correio Eletrônico (E-mail)</span>
        <span class="info-value">${member.email || 'Não informado'}</span>
      </div>
    </div>

    <div class="section-title">3. Histórico de Prazos & Graduações</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Data de Ingresso no Motoclube</span>
        <span class="info-value">${member.entryDate ? formatDateBR(member.entryDate) : 'Não registrada'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Data de Graduação no Grupamento</span>
        <span class="info-value">${member.grupamentoGraduationDate ? formatDateBR(member.grupamentoGraduationDate) : 'Não registrada'}</span>
      </div>
    </div>

    <div class="section-title">4. Observações de Conduta & Ficha Geral</div>
    <div style="background: #fafafa; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; font-size: 9.5pt; min-height: 60px; color: #334155;">
      ${member.observations || 'Nenhuma ocorrência ou observação adicional registrada no prontuário deste integrante.'}
    </div>

    <div class="signature-area">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-name">${member.vulgo}</div>
        <div class="signature-role">Integrante</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-name">Diretoria Regional</div>
        <div class="signature-role">Gestão Operacional Sidnei</div>
      </div>
    </div>

    <div class="footer-stamp">
      Gestão Operacional Sidnei • Dossiê gerado eletronicamente através do Sistema de Gestão de Grupamentos e Divisões • Código de Autenticidade: ${member.id.substring(0, 12).toUpperCase()}
    </div>
  `;

  return printHtmlContent(
    `Dossiê - ${member.vulgo}`,
    html,
    `dossie_${member.vulgo.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`
  );
}

/**
 * Prints Official Roster Report (Quadro Geral de Efetivo)
 */
export function printRosterReport(members: Member[], filterTitle = 'Quadro Geral de Efetivo'): Promise<boolean> {
  const printDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalCaveiras = members.filter(m => m.grupamento.includes('Caveira')).length;
  const totalSubdiretores = members.filter(m => m.grupamento.includes('Subdiretor')).length;
  const totalRegionais = members.filter(m => m.grupamento.includes('Operacional')).length;

  const rowsHtml = members.map((m, idx) => `
    <tr>
      <td style="text-align: center; font-weight: bold; width: 30px;">${idx + 1}</td>
      <td style="font-weight: 800; font-family: 'Cinzel', serif; color: #991b1b;">${m.vulgo}</td>
      <td>${m.name}</td>
      <td style="font-weight: 600;">${m.grupamento}</td>
      <td>${m.divisaoName}</td>
      <td style="font-weight: bold; color: ${m.status === 'Ativo' ? '#166534' : '#991b1b'};">${m.status}</td>
      <td>${m.phone || '-'}</td>
      <td>${formatDateBR(m.entryDate)}</td>
    </tr>
  `).join('');

  const html = `
    <div class="header-bar">
      <div>
        <h1 class="logo-title">Gestão Operacional Sidnei</h1>
        <div class="sub-title">Relatório Oficial • ${filterTitle}</div>
      </div>
      <div class="meta-badge">
        <div><strong>Total Listado: ${members.length} Integrantes</strong></div>
        <div>Emissão: ${printDate}</div>
        <div>Caveiras: ${totalCaveiras} • Subdiretores: ${totalSubdiretores}</div>
      </div>
    </div>

    <table class="table-print">
      <thead>
        <tr>
          <th style="text-align: center; width: 25px;">#</th>
          <th>Nome de Colete</th>
          <th>Nome Completo</th>
          <th>Grupamento</th>
          <th>Divisão</th>
          <th>Status</th>
          <th>Telefone</th>
          <th>Admissão</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="signature-area" style="margin-top: 40px;">
      <div class="signature-box" style="width: 220px;">
        <div class="signature-line"></div>
        <div class="signature-name">Secretaria Geral</div>
        <div class="signature-role">Gestão Operacional Sidnei</div>
      </div>
      <div class="signature-box" style="width: 220px;">
        <div class="signature-line"></div>
        <div class="signature-name">Comando Regional</div>
        <div class="signature-role">Validação & Homologação</div>
      </div>
    </div>

    <div class="footer-stamp">
      Relatório de Efetivo impresso via Sistema de Gestão Operacional Sidnei
    </div>
  `;

  return printHtmlContent(
    filterTitle,
    html,
    `relatorio_efetivo_${new Date().toISOString().split('T')[0]}.html`
  );
}

/**
 * Prints Identification Cards / Credenciais em Folha A4
 */
export function printIdCards(members: Member[]): Promise<boolean> {
  const printDate = new Date().toLocaleDateString('pt-BR');

  const cardsHtml = members.map((m) => `
    <div class="id-card">
      <div class="id-card-header">
        <div>
          <div class="id-card-title">Gestão Operacional Sidnei</div>
          <div style="font-size: 7pt; font-weight: 700; color: #555555; text-transform: uppercase;">Credencial de Integrante</div>
        </div>
        <div style="font-size: 8pt; font-weight: 800; color: #991b1b; border: 1px solid #991b1b; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
          ${m.status}
        </div>
      </div>

      <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
        <div style="width: 44px; height: 44px; background: #111111; color: #ffffff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 16pt; font-family: 'Cinzel', serif; font-weight: 900;">
          ${m.vulgo.charAt(0)}
        </div>
        <div>
          <div style="font-size: 12pt; font-weight: 900; font-family: 'Cinzel', serif; color: #111111; line-height: 1.1;">
            ${m.vulgo}
          </div>
          <div style="font-size: 8pt; color: #444444; font-weight: 600;">
            ${m.name}
          </div>
        </div>
      </div>

      <div style="font-size: 7.5pt; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; border-top: 1px dashed #cbd5e1; padding-top: 5px;">
        <div>
          <strong style="color: #64748b; text-transform: uppercase;">Grupamento:</strong><br>
          <span style="font-weight: 800; color: #991b1b;">${m.grupamento}</span>
        </div>
        <div>
          <strong style="color: #64748b; text-transform: uppercase;">Divisão:</strong><br>
          <span style="font-weight: 700;">${m.divisaoName}</span>
        </div>
        <div>
          <strong style="color: #64748b; text-transform: uppercase;">Situação:</strong><br>
          <span style="font-weight: 700; color: ${m.status === 'Ativo' ? '#166534' : '#991b1b'};">${m.status}</span>
        </div>
        <div>
          <strong style="color: #64748b; text-transform: uppercase;">Contato:</strong><br>
          <span style="font-weight: 600;">${m.phone || '-'}</span>
        </div>
      </div>
    </div>
  `).join('');

  const html = `
    <div class="header-bar" style="margin-bottom: 12px; padding-bottom: 8px;">
      <div>
        <h1 class="logo-title" style="font-size: 16pt;">Gestão Operacional Sidnei • CARTÕES DE IDENTIFICAÇÃO</h1>
        <div class="sub-title">Grade para recorte e plastificação • Total: ${members.length} Credenciais</div>
      </div>
      <div class="meta-badge">
        <div>Emissão: ${printDate}</div>
      </div>
    </div>

    <div class="card-grid">
      ${cardsHtml}
    </div>

    <div class="footer-stamp" style="margin-top: 20px;">
      Cartões de identificação de porte exclusivo para integrantes credenciados - Gestão Operacional Sidnei.
    </div>
  `;

  return printHtmlContent(
    `Carteirinhas (${members.length} Integrantes)`,
    html,
    `carteirinhas_insanos_mc.html`
  );
}

/**
 * Prints Audit Logs Report
 */
export function printAuditLogs(logs: ActivityLog[], filterTitle = 'Relatório de Auditoria & Atividades'): Promise<boolean> {
  const printDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const rowsHtml = logs.map((l, idx) => `
    <tr>
      <td style="text-align: center; width: 30px;">${idx + 1}</td>
      <td style="font-weight: 600; white-space: nowrap;">${new Date(l.timestamp).toLocaleString('pt-BR')}</td>
      <td style="font-weight: 800; color: #991b1b;">${l.action}</td>
      <td style="font-weight: 700;">${l.target}</td>
      <td>${l.adminName}</td>
      <td style="font-size: 8pt; color: #334155;">${l.details}</td>
    </tr>
  `).join('');

  const html = `
    <div class="header-bar">
      <div>
        <h1 class="logo-title">Gestão Operacional Sidnei</h1>
        <div class="sub-title">Livro de Auditoria • ${filterTitle}</div>
      </div>
      <div class="meta-badge">
        <div><strong>Total de Registros: ${logs.length}</strong></div>
        <div>Emissão: ${printDate}</div>
      </div>
    </div>

    <table class="table-print">
      <thead>
        <tr>
          <th style="text-align: center; width: 25px;">#</th>
          <th>Data/Hora</th>
          <th>Ação</th>
          <th>Alvo</th>
          <th>Operador</th>
          <th>Detalhes da Operação</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="footer-stamp">
      Relatório gerado a partir do Livro de Atividades e Logs - Gestão Operacional Sidnei • Assinatura Digital do Sistema
    </div>
  `;

  return printHtmlContent(
    filterTitle,
    html,
    `auditoria_insanos_${new Date().toISOString().split('T')[0]}.html`
  );
}

/**
 * Prints a document or operational bulletin generated by Gemini Intelligence.
 */
export function printGeminiDocument(title: string, content: string): Promise<boolean> {
  const printDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const body = `
    <div class="header-bar">
      <div>
        <h1 class="logo-title">Gestão Operacional Sidnei</h1>
        <div class="sub-title">Inteligência Operacional Gemini • ${title}</div>
      </div>
      <div class="meta-badge">
        <div><strong>Default Gemini Project</strong></div>
        <div>Emissão: ${printDate}</div>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 16px 0; font-family: sans-serif; font-size: 10pt; line-height: 1.6; white-space: pre-wrap; color: #1e293b;">
${content}
    </div>

    <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
      <div style="width: 260px; text-align: center;">
        <div style="border-top: 1.5px solid #0f172a; padding-top: 6px;">
          <div style="font-size: 9pt; font-weight: 700; color: #0f172a; text-transform: uppercase;">Sidnei</div>
          <div style="font-size: 8pt; color: #64748b; text-transform: uppercase;">Administrador Geral & Gestão Operacional</div>
          <div style="font-size: 7.5pt; color: #94a3b8; font-family: monospace;">imc.sidnei@gmail.com</div>
        </div>
      </div>
    </div>

    <div class="footer-stamp">
      Documento gerado pelo Default Gemini Project (gen-lang-client-0085694200) sob supervisão de Sidnei • Gestão Operacional
    </div>
  `;

  return printHtmlContent(
    title,
    body,
    `comunicado_sidnei_${new Date().toISOString().split('T')[0]}.html`
  );
}

