import jsPDF from 'jspdf';
import { type ScanResult } from './scan-data';

export const generatePDFReport = (scanResult: ScanResult) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Colors
  const darkBg = [2, 4, 9];
  const cardBg = [13, 20, 36];
  const cyan = [0, 212, 255];
  const green = [0, 255, 136];
  const red = [255, 51, 102];
  const yellow = [255, 170, 0];
  const white = [240, 244, 255];
  const gray = [136, 146, 164];

  const drawBackground = () => {
    doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  const addPageNumber = (pageNum: number, total: number) => {
    doc.setFontSize(9);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(`Page ${pageNum} of ${total}`,
      pageWidth - margin, pageHeight - 10,
      { align: 'right' });
    doc.text('SecureWeb AI — Security Report',
      margin, pageHeight - 10);
  };

  const getSeverityColor = (severity: string): number[] => {
    const s = severity.toLowerCase();
    if (s === 'high' || s === 'critical') return red;
    if (s === 'medium') return yellow;
    return gray;
  };

  const getScoreColor = (score: number): number[] => {
    if (score >= 80) return green;
    if (score >= 50) return yellow;
    return red;
  };

  // ========================
  // PAGE 1 — COVER
  // ========================
  drawBackground();

  doc.setFillColor(cyan[0], cyan[1], cyan[2]);
  doc.rect(0, 0, pageWidth, 2, 'F');

  doc.setFontSize(10);
  doc.setTextColor(cyan[0], cyan[1], cyan[2]);
  doc.text('SECUREWEB AI', margin, 20);
  doc.setFontSize(8);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text('AUTOMATED SECURITY INTELLIGENCE', margin, 27);

  doc.setFontSize(28);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('SECURITY AUDIT', margin, 70);
  doc.setFontSize(28);
  doc.setTextColor(cyan[0], cyan[1], cyan[2]);
  doc.text('REPORT', margin, 82);

  doc.setDrawColor(cyan[0], cyan[1], cyan[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, 90, pageWidth - margin, 90);

  doc.setFontSize(9);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text('TARGET WEBSITE', margin, 103);
  doc.setFontSize(13);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text(scanResult.url || 'N/A', margin, 111);

  // Score box
  const score = scanResult.score || 0;
  const scoreColor = getScoreColor(score);
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.roundedRect(margin, 125, 60, 55, 4, 4, 'F');
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(2);
  doc.roundedRect(margin, 125, 60, 55, 4, 4, 'S');
  doc.setFontSize(30);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(String(score),
    margin + 30, 153, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text('/100', margin + 30, 161, { align: 'center' });
  doc.text('SECURITY SCORE', margin + 30, 173,
    { align: 'center' });

  // Status badge
  const status = (scanResult.score >= 80 ? 'secure' : scanResult.score >= 50 ? 'moderate' : 'vulnerable');
  const statusColor = status === 'secure' ? green : status === 'vulnerable' ? red : yellow;
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(margin + 68, 130, 78, 18, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setTextColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.text(
    status.toUpperCase(),
    margin + 107, 142, { align: 'center' });

  // Metadata
  doc.setFontSize(9);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  const now = new Date();
  doc.text(`Scan Date: ${now.toLocaleDateString()}`,
    margin + 68, 162);
  doc.text(`Scan Time: ${now.toLocaleTimeString()}`,
    margin + 68, 169);
  doc.text(
    `Issues Found: ${scanResult.vulnerabilities?.length || 0}`,
    margin + 68, 176);

  // Footer
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.rect(0, pageHeight - 22, pageWidth, 22, 'F');
  doc.setFontSize(8);
  doc.setTextColor(cyan[0], cyan[1], cyan[2]);
  doc.text('secureweb-ai.vercel.app',
    pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text('Confidential Security Report',
    pageWidth / 2, pageHeight - 5, { align: 'center' });

  addPageNumber(1, 4);

  // ========================
  // PAGE 2 — SUMMARY
  // ========================
  doc.addPage();
  drawBackground();
  doc.setFillColor(cyan[0], cyan[1], cyan[2]);
  doc.rect(0, 0, pageWidth, 2, 'F');

  doc.setFontSize(18);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('EXECUTIVE SUMMARY', margin, 25);
  doc.setDrawColor(cyan[0], cyan[1], cyan[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, 30, pageWidth - margin, 30);

  // 4 stat cards
  const vulns = scanResult.vulnerabilities || [];
  const stats = [
    { label: 'TOTAL ISSUES',
      value: vulns.length, color: white },
    { label: 'HIGH',
      value: vulns.filter(v => v.severity==='high' || v.severity === 'critical').length,
      color: red },
    { label: 'MEDIUM',
      value: vulns.filter(v => v.severity==='medium').length,
      color: yellow },
    { label: 'LOW',
      value: vulns.filter(v => v.severity==='low').length,
      color: gray }
  ];

  const bw = (pageWidth - margin * 2 - 15) / 4;
  stats.forEach((s, i) => {
    const x = margin + i * (bw + 5);
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.roundedRect(x, 38, bw, 28, 3, 3, 'F');
    doc.setFontSize(18);
    const color = s.color;
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(String(s.value), x + bw/2, 53,
      { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(s.label, x + bw/2, 61,
      { align: 'center' });
  });

  // SSL
  let yPos = 80;
  doc.setFontSize(11);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('SSL CERTIFICATE', margin, yPos);
  yPos += 7;
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.roundedRect(margin, yPos, pageWidth-margin*2,
    18, 3, 3, 'F');
  const isSslValid = scanResult.ssl?.valid;
  const sslColor = isSslValid ? green : red;
  const sslText = isSslValid
    ? 'VALID — Certificate is active and secure'
    : 'INVALID / MISSING — No SSL protection';
  doc.setFontSize(10);
  doc.setTextColor(sslColor[0], sslColor[1], sslColor[2]);
  doc.text(sslText, margin + 4, yPos + 12);
  yPos += 26;

  // VirusTotal
  doc.setFontSize(11);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('VIRUSTOTAL REPUTATION', margin, yPos);
  yPos += 7;
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.roundedRect(margin, yPos, pageWidth-margin*2,
    18, 3, 3, 'F');
  const vtM = scanResult.virusTotal?.positives || 0;
  const vtColor = vtM > 0 ? red : green;
  const vtText = vtM > 0
    ? `${vtM} engines flagged as malicious`
    : 'Clean — No threats detected';
  doc.setFontSize(10);
  doc.setTextColor(vtColor[0], vtColor[1], vtColor[2]);
  doc.text(vtText, margin + 4, yPos + 12);
  yPos += 26;

  // Headers table
  doc.setFontSize(11);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('SECURITY HEADERS', margin, yPos);
  yPos += 7;

  const headersList = [
    { name: 'Content-Security-Policy',
      key: 'content-security-policy' },
    { name: 'Strict-Transport-Security',
      key: 'strict-transport-security' },
    { name: 'X-Frame-Options',
      key: 'x-frame-options' },
    { name: 'X-Content-Type-Options',
      key: 'x-content-type-options' },
    { name: 'Referrer-Policy',
      key: 'referrer-policy' },
    { name: 'Permissions-Policy',
      key: 'permissions-policy' }
  ];

  headersList.forEach((h, i) => {
    const present =
      scanResult.headers?.[h.key]?.status === 'secure';
    doc.setFillColor( (i%2===0 ? cardBg[0] : 10), (i%2===0 ? cardBg[1] : 16), (i%2===0 ? cardBg[2] : 28) );
    doc.rect(margin, yPos, pageWidth-margin*2, 9, 'F');
    doc.setFontSize(8);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text(h.name, margin + 3, yPos + 6);
    const hColor = present ? green : red;
    doc.setTextColor(hColor[0], hColor[1], hColor[2]);
    doc.text(present ? 'PRESENT' : 'MISSING',
      pageWidth - margin - 3, yPos + 6,
      { align: 'right' });
    yPos += 9;
  });

  addPageNumber(2, 4);

  // ========================
  // PAGE 3 — VULNERABILITIES
  // ========================
  doc.addPage();
  drawBackground();
  doc.setFillColor(cyan[0], cyan[1], cyan[2]);
  doc.rect(0, 0, pageWidth, 2, 'F');

  doc.setFontSize(18);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('VULNERABILITY DETAILS', margin, 25);
  doc.setDrawColor(cyan[0], cyan[1], cyan[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, 30, pageWidth - margin, 30);

  if (vulns.length === 0) {
    doc.setFontSize(14);
    doc.setTextColor(green[0], green[1], green[2]);
    doc.text('No vulnerabilities detected!',
      pageWidth/2, 80, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text('This website passed all security checks.',
      pageWidth/2, 92, { align: 'center' });
  } else {
    let vPos = 38;
    vulns.forEach((vuln) => {
      if (vPos > pageHeight - 55) {
        doc.addPage();
        drawBackground();
        vPos = 20;
      }
      const sc = getSeverityColor(vuln.severity);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.roundedRect(margin, vPos,
        pageWidth-margin*2, 40, 3, 3, 'F');
      doc.setFillColor(sc[0], sc[1], sc[2]);
      doc.rect(margin, vPos, 3, 40, 'F');

      // Severity badge
      doc.setFillColor(sc[0], sc[1], sc[2]);
      doc.roundedRect(pageWidth-margin-24, vPos+4,
        21, 8, 2, 2, 'F');
      doc.setFontSize(7);
      doc.setTextColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.text(
        (vuln.severity||'LOW').toUpperCase(),
        pageWidth-margin-13, vPos+9.5,
        { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(white[0], white[1], white[2]);
      doc.text(vuln.issue||vuln.title||'Unknown Issue',
        margin+6, vPos+12);

      doc.setFontSize(8);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      const descLines = doc.splitTextToSize(
        vuln.description||'No description available.',
        pageWidth-margin*2-15);
      doc.text(descLines.slice(0,2), margin+6, vPos+21);

      vPos += 45;
    });
  }

  addPageNumber(3, 4);

  // ========================
  // PAGE 4 — RECOMMENDATIONS
  // ========================
  doc.addPage();
  drawBackground();
  doc.setFillColor(cyan[0], cyan[1], cyan[2]);
  doc.rect(0, 0, pageWidth, 2, 'F');

  doc.setFontSize(18);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('RECOMMENDATIONS', margin, 25);
  doc.setDrawColor(cyan[0], cyan[1], cyan[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, 30, pageWidth - margin, 30);

  const highV = vulns.filter(v => v.severity==='high' || v.severity === 'critical');
  const medV = vulns.filter(v => v.severity==='medium');
  const lowV = vulns.filter(v => v.severity==='low');

  let rPos = 40;
  const priorities = [
    { label: 'FIX IMMEDIATELY', items: highV, color: red },
    { label: 'FIX SOON', items: medV, color: yellow },
    { label: 'FIX WHEN POSSIBLE', items: lowV, color: gray }
  ];

  priorities.forEach(p => {
    if (!p.items.length) return;
    doc.setFontSize(10);
    doc.setTextColor(p.color[0], p.color[1], p.color[2]);
    doc.text(p.label, margin, rPos);
    rPos += 7;
    p.items.forEach(item => {
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.roundedRect(margin, rPos,
        pageWidth-margin*2, 13, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor(white[0], white[1], white[2]);
      doc.text(`• ${item.issue || item.title}`, margin+4, rPos+8.5);
      rPos += 16;
    });
    rPos += 4;
  });

  // Summary box
  const sbY = Math.max(rPos + 10, pageHeight - 65);
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.roundedRect(margin, sbY, pageWidth-margin*2,
    32, 4, 4, 'F');
  doc.setDrawColor(cyan[0], cyan[1], cyan[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, sbY, pageWidth-margin*2,
    32, 4, 4, 'S');
  doc.setFontSize(9);
  doc.setTextColor(cyan[0], cyan[1], cyan[2]);
  doc.text('SECURITY ASSESSMENT SUMMARY',
    pageWidth/2, sbY+10, { align: 'center' });
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text(
    `${scanResult.url} scored ${scanResult.score||0}/100.`,
    pageWidth/2, sbY+19, { align: 'center' });
  doc.text(
    `${vulns.length} issue(s) found. Fix HIGH items first.`,
    pageWidth/2, sbY+27, { align: 'center' });

  // Footer
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.rect(0, pageHeight-18, pageWidth, 18, 'F');
  doc.setFontSize(8);
  doc.setTextColor(cyan[0], cyan[1], cyan[2]);
  doc.text('SecureWeb AI', margin, pageHeight-8);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text(`Generated: ${new Date().toLocaleString()}`,
    pageWidth/2, pageHeight-8, { align: 'center' });
  doc.text('secureweb-ai.vercel.app',
    pageWidth-margin, pageHeight-8, { align: 'right' });

  addPageNumber(4, 4);

  // DOWNLOAD
  const domain = (scanResult.url||'scan')
    .replace('https://','').replace('http://','')
    .replace(/\//g,'-');
  const dateStr = new Date()
    .toISOString().split('T')[0];
  doc.save(`secureweb-report-${domain}-${dateStr}.pdf`);
};
