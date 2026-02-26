import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { platformNames } from '@/components/icons/PlatformIcons';

interface ContentItem {
  id: string;
  title?: string;
  description?: string;
  briefing?: string;
  content_type: 'post' | 'reels' | 'story';
  platforms?: string[];
  scheduled_time?: string;
  status: string;
  is_executed?: boolean;
}

interface DayGroup {
  date: Date;
  dayName: string;
  dayFormatted: string;
  items: ContentItem[];
}

interface ReportData {
  businessName: string;
  reportType: 'week' | 'month';
  periodStart: Date;
  periodEnd: Date;
  weekNumber: number;
  metrics: {
    total: number;
    executed: number;
    executionRate: number;
    byType: { reels: number; stories: number; posts: number };
    byStatus: Record<string, number>;
    platforms: [string, number][];
  };
  contentsByDay: DayGroup[];
  docId: string;
}

const statusLabels: Record<string, string> = {
  planned: 'Planejado',
  in_progress: 'Em progresso',
  completed: 'Publicado',
  cancelled: 'Cancelado'
};

const typeLabels: Record<string, string> = {
  reels: 'Reels',
  story: 'Stories',
  post: 'Posts'
};

// Cores em RGB para jsPDF
const colors = {
  black: [29, 29, 31] as [number, number, number],
  slate900: [15, 23, 42] as [number, number, number],
  slate600: [71, 85, 105] as [number, number, number],
  slate500: [100, 116, 139] as [number, number, number],
  slate400: [148, 163, 184] as [number, number, number],
  slate300: [203, 213, 225] as [number, number, number],
  slate200: [226, 232, 240] as [number, number, number],
  slate100: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green500: [34, 197, 94] as [number, number, number],
  green700: [21, 128, 61] as [number, number, number],
  amber600: [217, 119, 6] as [number, number, number],
  blue600: [37, 99, 235] as [number, number, number],
  red500: [239, 68, 68] as [number, number, number],
  bg: [245, 245, 247] as [number, number, number],
};

export function generateReportPDF(data: ReportData) {
  // Dynamic import handled by caller — this runs synchronously with jsPDF
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jsPDF } = require('jspdf');

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth(); // 210
  const pageH = doc.internal.pageSize.getHeight(); // 297
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;

  const setColor = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
  const setFillColor = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);
  const setDrawColor = (c: [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2]);

  // Check if we need a new page
  const checkPage = (needed: number) => {
    if (y + needed > pageH - 30) {
      doc.addPage();
      y = margin;
    }
  };

  // Rounded rect helper
  const roundedRect = (x: number, ry: number, w: number, h: number, r: number, fill: [number, number, number]) => {
    setFillColor(fill);
    doc.roundedRect(x, ry, w, h, r, r, 'F');
  };

  // === PAGE 1: HEADER ===
  y = margin;

  // Report type label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor(colors.slate400);
  doc.text(
    `RELATÓRIO ${data.reportType === 'week' ? 'SEMANAL' : 'MENSAL'}`,
    margin, y
  );
  y += 8;

  // Business name
  doc.setFontSize(28);
  setColor(colors.black);
  doc.text(`${data.businessName}.`, margin, y);
  y += 8;

  // Period subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  setColor(colors.slate500);
  const periodLabel = data.reportType === 'week'
    ? `Semana ${data.weekNumber}`
    : format(data.periodStart, 'MMMM yyyy', { locale: ptBR });
  doc.text(periodLabel, margin, y);
  y += 5;

  // Period dates
  doc.setFontSize(9);
  setColor(colors.slate400);
  doc.text(
    `${format(data.periodStart, 'd MMM', { locale: ptBR })} — ${format(data.periodEnd, 'd MMM yyyy', { locale: ptBR })}`,
    margin, y
  );
  y += 14;

  // === METRICS CARDS ===
  const cardH = 28;
  const gap = 4;
  const cardW = (contentW - gap * 3) / 4;

  // Total card (dark)
  roundedRect(margin, y, cardW, cardH, 3, colors.slate900);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  setColor(colors.white);
  doc.text(`${data.metrics.total}`, margin + 6, y + 17);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255); // keep white with alpha
  doc.text('TOTAL', margin + 6, y + 23);

  // Type cards
  const types = [
    { key: 'reels', count: data.metrics.byType.reels },
    { key: 'story', count: data.metrics.byType.stories },
    { key: 'post', count: data.metrics.byType.posts }
  ];

  types.forEach((t, i) => {
    const x = margin + (cardW + gap) * (i + 1);
    roundedRect(x, y, cardW, cardH, 3, colors.bg);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    setColor(colors.black);
    doc.text(`${t.count}`, x + 6, y + 17);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    setColor(colors.slate500);
    doc.text((typeLabels[t.key] || t.key).toUpperCase(), x + 6, y + 23);
  });

  y += cardH + 8;

  // === EXECUTION RATE BAR ===
  roundedRect(margin, y, contentW, 18, 3, colors.bg);

  // Label
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(colors.slate600);
  doc.text('Taxa de Publicação', margin + 6, y + 7);

  // Value
  doc.setFontSize(9);
  setColor(colors.black);
  const rateText = `${data.metrics.executed} de ${data.metrics.total} (${data.metrics.executionRate}%)`;
  doc.text(rateText, margin + contentW - 6, y + 7, { align: 'right' });

  // Progress bar background
  const barX = margin + 6;
  const barY = y + 11;
  const barW = contentW - 12;
  const barH = 3;
  roundedRect(barX, barY, barW, barH, 1.5, colors.slate200);

  // Progress bar fill
  if (data.metrics.executionRate > 0) {
    const fillW = Math.max(3, barW * (data.metrics.executionRate / 100));
    roundedRect(barX, barY, fillW, barH, 1.5, colors.green500);
  }

  y += 24;

  // === PLATFORMS ===
  if (data.metrics.platforms.length > 0) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    setColor(colors.slate400);
    doc.text('PLATAFORMAS', margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(colors.slate600);
    const platformText = data.metrics.platforms
      .map(([p, n]) => `${platformNames[p] || p} (${n})`)
      .join('  ·  ');
    doc.text(platformText, margin, y);
    y += 8;
  }

  // === STATUS BREAKDOWN ===
  const activeStatuses = Object.entries(data.metrics.byStatus).filter(([, c]) => c > 0);
  if (activeStatuses.length > 0) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    setColor(colors.slate400);
    doc.text('STATUS', margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(colors.slate600);
    const statusText = activeStatuses
      .map(([s, c]) => `${statusLabels[s] || s}: ${c}`)
      .join('  ·  ');
    doc.text(statusText, margin, y);
    y += 12;
  }

  // Divider
  setDrawColor(colors.slate200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentW, y);
  y += 10;

  // === CONTENT TIMELINE ===
  data.contentsByDay.forEach((day) => {
    // Day header needs ~15mm
    checkPage(20);

    // Day name
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setColor(colors.black);
    const capitalDay = day.dayName.charAt(0).toUpperCase() + day.dayName.slice(1);
    doc.text(capitalDay, margin, y);

    // Day date
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(colors.slate400);
    const dayNameWidth = doc.getTextWidth(capitalDay) + 4;
    doc.text(day.dayFormatted, margin + dayNameWidth + 4, y);

    // Item count
    const countText = `${day.items.length} ${day.items.length === 1 ? 'item' : 'itens'}`;
    doc.setFontSize(7);
    doc.text(countText, margin + contentW, y, { align: 'right' });

    y += 3;

    // Line under day header
    setDrawColor(colors.slate100);
    doc.setLineWidth(0.2);
    doc.line(margin, y, margin + contentW, y);
    y += 6;

    // Items
    day.items.forEach((item, idx) => {
      // Estimate height for this item
      const hasDescription = !!item.description;
      const hasBriefing = !!item.briefing;
      const estimatedH = 12 + (hasDescription ? 8 : 0) + (hasBriefing ? 14 : 0);
      checkPage(estimatedH);

      const itemX = margin + 8;

      // Timeline dot
      const dotR = 1.5;
      setFillColor(item.is_executed ? colors.green500 : colors.slate300);
      doc.circle(margin + 2, y + 1, dotR, 'F');

      // Timeline line
      setDrawColor(colors.slate200);
      doc.setLineWidth(0.3);

      // Content type label
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      const typeColor = item.content_type === 'reels' ? colors.green700
        : item.content_type === 'story' ? colors.amber600
        : colors.blue600;
      setColor(typeColor);
      doc.text((typeLabels[item.content_type] || item.content_type).toUpperCase(), itemX, y);

      // Status
      doc.setFont('helvetica', 'normal');
      setColor(colors.slate400);
      const statusLabel = statusLabels[item.status] || item.status;
      const typeW = doc.getTextWidth((typeLabels[item.content_type] || item.content_type).toUpperCase());
      doc.text(`  ·  ${statusLabel}`, itemX + typeW, y);

      // Time if available
      if (item.scheduled_time) {
        const prevW = typeW + doc.getTextWidth(`  ·  ${statusLabel}`);
        doc.text(`  ·  ${item.scheduled_time}`, itemX + prevW, y);
      }

      // Platforms
      if (item.platforms && item.platforms.length > 0) {
        const platformStr = item.platforms.map(p => platformNames[p] || p).join(', ');
        doc.text(platformStr, margin + contentW, y, { align: 'right' });
      }

      y += 5;

      // Title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      setColor(colors.black);
      const title = item.title || `${typeLabels[item.content_type] || 'Conteúdo'} #${idx + 1}`;
      const titleLines = doc.splitTextToSize(title, contentW - 10);
      doc.text(titleLines, itemX, y);
      y += titleLines.length * 5 + 2;

      // Description
      if (item.description) {
        checkPage(10);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        setColor(colors.slate600);
        const descLines = doc.splitTextToSize(item.description, contentW - 12);
        const maxLines = Math.min(descLines.length, 4);
        doc.text(descLines.slice(0, maxLines), itemX, y);
        y += maxLines * 4 + 2;
      }

      // Briefing
      if (item.briefing) {
        checkPage(16);
        // Briefing background
        const briefingLines = doc.splitTextToSize(item.briefing, contentW - 20);
        const maxBriefLines = Math.min(briefingLines.length, 6);
        const briefH = maxBriefLines * 3.5 + 10;
        roundedRect(itemX, y, contentW - 10, briefH, 2, [255, 251, 235]); // amber-50

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        setColor(colors.amber600);
        doc.text('BRIEFING', itemX + 4, y + 5);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(146, 64, 14); // amber-800
        doc.text(briefingLines.slice(0, maxBriefLines), itemX + 4, y + 10);
        y += briefH + 3;
      }

      y += 4;
    });

    y += 6;
  });

  // === FOOTER ===
  checkPage(30);

  // Divider
  setDrawColor(colors.slate200);
  doc.setLineWidth(0.2);
  doc.line(margin + 40, y, margin + contentW - 40, y);
  y += 10;

  // Branding
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(colors.slate400);
  doc.text('Relatório gerado pela plataforma', pageW / 2, y, { align: 'center' });
  y += 6;

  // Logo text
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  setColor(colors.slate400);
  doc.text('cr', pageW / 2 - 11, y);
  doc.setFont('helvetica', 'bold');
  setColor(colors.black);
  doc.text('IA', pageW / 2 - 4, y);
  doc.setFont('helvetica', 'normal');
  setColor(colors.slate400);
  doc.text('dores', pageW / 2 + 3, y);
  y += 8;

  // Doc ID + date
  doc.setFontSize(7);
  setColor(colors.slate400);
  doc.text(
    `Doc ${data.docId}  ·  ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    pageW / 2, y,
    { align: 'center' }
  );

  // Save
  const fileName = `relatorio-${data.businessName.toLowerCase().replace(/\s+/g, '-')}-${format(data.periodStart, 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
