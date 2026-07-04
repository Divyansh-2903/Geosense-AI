import type { UserProfile } from '../../../src/context/AuthContext';
import type { Field } from '../types';

type PdfTextOptions = {
  maxWidth?: number;
  lineGap?: number;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

const formatNumber = (value: number | undefined, digits = 2) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : 'N/A';

const formatWhole = (value: number | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.round(value).toLocaleString('en-IN') : 'N/A';

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'farm-report';

const stripMarkdown = (value: string) =>
  value
    .replace(/`{1,3}/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const getCoordinatesSummary = (field: Field) => {
  const ring = field.geometry?.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length === 0) {
    return 'Boundary coordinates not available';
  }

  const lngValues = ring.map((coord: number[]) => coord[0]).filter(Number.isFinite);
  const latValues = ring.map((coord: number[]) => coord[1]).filter(Number.isFinite);

  if (!lngValues.length || !latValues.length) {
    return 'Boundary coordinates not available';
  }

  const lat = latValues.reduce((sum, value) => sum + value, 0) / latValues.length;
  const lng = lngValues.reduce((sum, value) => sum + value, 0) / lngValues.length;

  return `${lat.toFixed(5)} N, ${lng.toFixed(5)} E`;
};

const addWrappedText = (
  doc: any,
  text: string,
  x: number,
  y: number,
  options: PdfTextOptions = {}
) => {
  const maxWidth = options.maxWidth ?? 470;
  const lineGap = options.lineGap ?? 13;
  const lines = doc.splitTextToSize(text || 'N/A', maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineGap;
};

const addSectionTitle = (doc: any, title: string, y: number) => {
  doc.setTextColor(3, 38, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title.toUpperCase(), 42, y);
  doc.setDrawColor(207, 240, 104);
  doc.setLineWidth(2);
  doc.line(42, y + 7, 552, y + 7);
  return y + 26;
};

const addMetricCard = (
  doc: any,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  tone: 'green' | 'amber' | 'red' | 'blue' = 'green'
) => {
  const tones = {
    green: { bg: [239, 253, 230], fg: [3, 38, 14] },
    amber: { bg: [255, 248, 225], fg: [119, 73, 0] },
    red: { bg: [255, 235, 238], fg: [146, 24, 24] },
    blue: { bg: [232, 244, 255], fg: [37, 99, 235] },
  } as const;

  const color = tones[tone];
  doc.setFillColor(...color.bg);
  doc.setDrawColor(226, 232, 226);
  doc.roundedRect(x, y, width, 58, 8, 8, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(66, 72, 65);
  doc.text(label.toUpperCase(), x + 12, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...color.fg);
  doc.text(value, x + 12, y + 42);
};

export async function downloadFarmReportPdf(field: Field, user?: UserProfile | null) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const now = new Date();
  const hectare = field.acreage / 2.47105;
  const waterDeficitMm = Math.abs(field.waterDeficit || 0);
  const estimatedLiters = waterDeficitMm * field.acreage * 4046.86;
  const latestAnalysis = field.analyses?.[0];
  const smi = field.smi ?? latestAnalysis?.smi ?? latestAnalysis?.indices?.smi;
  const vci = field.vci ?? latestAnalysis?.vci ?? latestAnalysis?.indices?.vci;
  const evi = field.evi ?? latestAnalysis?.evi ?? latestAnalysis?.indices?.evi;
  const savi = field.savi ?? latestAnalysis?.savi ?? latestAnalysis?.indices?.savi;
  const agronomy = field.agronomy ?? latestAnalysis?.agronomy;
  const weather = field.weather ?? latestAnalysis?.weather;

  doc.setProperties({
    title: `${field.name} Field Health Report`,
    subject: 'GeoHarvest farm analysis report',
    author: 'GeoHarvest',
  });

  doc.setFillColor(3, 38, 14);
  doc.rect(0, 0, 595, 104, 'F');
  doc.setFillColor(207, 240, 104);
  doc.roundedRect(42, 28, 88, 26, 13, 13, 'F');
  doc.setTextColor(3, 38, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('GEOHARVEST', 58, 45);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Field Health Report', 42, 78);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generated ${formatDate(now)}`, 410, 44);
  doc.text(`Report ID: GEO-${now.getTime().toString().slice(-8)}`, 410, 62);

  let y = 132;
  doc.setTextColor(3, 38, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(field.name, 42, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(66, 72, 65);
  y = addWrappedText(
    doc,
    `Crop: ${field.cropType} | Farmer: ${user?.name || 'Guest farmer'} | Location: ${getCoordinatesSummary(field)}`,
    42,
    y + 18,
    { maxWidth: 510, lineGap: 12 }
  );

  y += 12;
  addMetricCard(doc, 'Crop Health', field.status, 42, y, 118, field.status === 'Critical' ? 'red' : field.status === 'Marginal' ? 'amber' : 'green');
  addMetricCard(doc, 'NDVI Vigor', formatNumber(field.avgNdvi), 172, y, 118, 'green');
  addMetricCard(doc, 'Moisture', `${formatWhole(field.moisture)}%`, 302, y, 118, field.moisture < 45 ? 'red' : field.moisture < 60 ? 'amber' : 'blue');
  addMetricCard(doc, 'Water Need', `${formatWhole(estimatedLiters)} L`, 432, y, 118, waterDeficitMm > 25 ? 'red' : waterDeficitMm > 10 ? 'amber' : 'green');

  y += 90;
  y = addSectionTitle(doc, 'Farm Summary', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(34, 49, 36);
  const summaryRows = [
    ['Area', `${formatNumber(field.acreage, 1)} acres / ${formatNumber(hectare, 2)} hectares`],
    ['Stress level', field.stressLevel],
    ['NDWI canopy water', formatNumber(field.ndwi)],
    ['SMI soil moisture', formatNumber(smi)],
    ['VCI vegetation condition', formatNumber(vci)],
    ['EVI enhanced vigor', formatNumber(evi)],
    ['SAVI soil-adjusted vigor', formatNumber(savi)],
    ['Sentinel-1 VV', `${formatNumber(field.sar?.vv)} dB`],
    ['Sentinel-1 VH', `${formatNumber(field.sar?.vh)} dB`],
    ['Sentinel-1 VH/VV', formatNumber(field.sar?.vhVvRatio, 3)],
    ['Rainfall', `${formatWhole(field.rainfall ?? weather?.rainfall)} mm`],
    ['Temperature', `${formatWhole(field.avgTemp ?? weather?.temperature)} C`],
    ['Humidity', `${formatWhole(weather?.humidity)}%`],
    ['Wind speed', `${formatNumber(weather?.windSpeed, 1)} km/h`],
    ['Solar radiation', `${formatWhole(weather?.solarRadiation)} W/m²`],
    ['Evaporation', `${formatNumber(weather?.evaporation ?? field.et, 1)} mm/day`],
  ];

  summaryRows.forEach(([label, value], index) => {
    const rowY = y + index * 20;
    doc.setFont('helvetica', 'bold');
    doc.text(label, 42, rowY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 180, rowY);
  });

  y += summaryRows.length * 20 + 16;
  y = addSectionTitle(doc, 'Irrigation Recommendation', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(34, 49, 36);
  y = addWrappedText(
    doc,
    field.irrigationAdvisory || field.notes || 'No irrigation advisory is available yet. Run farm analysis to generate a recommendation.',
    42,
    y,
    { maxWidth: 510, lineGap: 13 }
  );

  if (agronomy) {
    y += 16;
    y = addSectionTitle(doc, 'Structured Agronomy Plan', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(34, 49, 36);
    y = addWrappedText(
      doc,
      [
        `Crop stage: ${agronomy.cropCalendar?.stage || 'N/A'} (${agronomy.cropCalendar?.ndviStatus || 'N/A'})`,
        `Water requirement: ${formatWhole(agronomy.waterRequirementLitres)} L, action window ${agronomy.actionWindow || 'N/A'}, urgency ${agronomy.urgencyScore ?? 'N/A'}/100`,
        `Fertilizer quantity: ${agronomy.fertilizerPlan?.recommendation || 'N/A'}`,
        `Disease advisory: ${agronomy.diseaseAdvisory?.recommendation || 'N/A'}`
      ].join('\n'),
      42,
      y,
      { maxWidth: 510, lineGap: 12 }
    );
  }

  if (y > 650) {
    doc.addPage();
    y = 50;
  }

  y += 16;
  y = addSectionTitle(doc, 'AI Agronomy Notes', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(34, 49, 36);
  y = addWrappedText(
    doc,
    stripMarkdown(field.notes || latestAnalysis?.aiAdvice || 'No AI advisory has been saved for this field yet.'),
    42,
    y,
    { maxWidth: 510, lineGap: 12 }
  );

  if (y > 650) {
    doc.addPage();
    y = 50;
  } else {
    y += 16;
  }

  y = addSectionTitle(doc, 'Monthly Spectral Trend', y);
  const trendRows = (field.trends?.ndvi || []).slice(-6).map((ndviPoint, index) => {
    const ndwiPoint = field.trends?.ndwi?.[index];
    return [
      MONTHS[(ndviPoint.month || 1) - 1] || `M${ndviPoint.month}`,
      formatNumber(ndviPoint.ndvi),
      formatNumber(ndwiPoint?.ndwi),
    ];
  });

  const rows = trendRows.length ? trendRows : [['N/A', formatNumber(field.avgNdvi), formatNumber(field.ndwi)]];
  doc.setFillColor(249, 250, 249);
  doc.roundedRect(42, y - 14, 510, 28 + rows.length * 22, 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(3, 38, 14);
  doc.text('Month', 62, y + 4);
  doc.text('NDVI', 242, y + 4);
  doc.text('NDWI', 402, y + 4);
  doc.setDrawColor(226, 232, 226);
  doc.line(62, y + 14, 532, y + 14);

  doc.setFont('helvetica', 'normal');
  rows.forEach((row, index) => {
    const rowY = y + 36 + index * 22;
    doc.text(row[0], 62, rowY);
    doc.text(row[1], 242, rowY);
    doc.text(row[2], 402, rowY);
  });

  y += 58 + rows.length * 22;
  if (latestAnalysis) {
    y = addSectionTitle(doc, 'Saved Analysis Snapshot', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(34, 49, 36);
    y = addWrappedText(
      doc,
      `Growth stage: ${latestAnalysis.growthStage || 'N/A'} | Disease risk: ${latestAnalysis.diseaseRisk || 'N/A'} | Yield prediction: ${latestAnalysis.yieldPrediction || 'N/A'} t/ha | Revenue prediction: ${latestAnalysis.revenuePrediction || 'N/A'}`,
      42,
      y,
      { maxWidth: 510, lineGap: 12 }
    );
  }

  doc.setDrawColor(226, 232, 226);
  doc.line(42, 790, 552, 790);
  doc.setTextColor(93, 103, 93);
  doc.setFontSize(8);
  doc.text('GeoHarvest report generated from satellite indices, weather estimates, and saved farm analysis history.', 42, 808);
  doc.text('Use this advisory with local agronomist judgement before applying water, fertilizer, or treatment.', 42, 820);

  doc.save(`${sanitizeFileName(field.name)}-farm-report-${now.toISOString().slice(0, 10)}.pdf`);
}
