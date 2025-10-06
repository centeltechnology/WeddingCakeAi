import jsPDF from 'jspdf';

interface CakeConfiguration {
  eventDate: string;
  guestCount: number;
  tiers: number;
  baseSize: number;
  shape: string;
  cakeFlavor: string;
  filling: string;
  decorations: {
    fondant: boolean;
    flowers: boolean;
    goldAccents: boolean;
    customTopper: boolean;
  };
  delivery: string;
  distance: string;
  specialRequests: string;
}

interface PricingResult {
  subtotal: number;
  tax: number;
  total: number;
  lineItems: Array<{ description: string; price: number }>;
}

export function generatePDF(config: CakeConfiguration, pricing: PricingResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Wedding Cake Estimate', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Cake Pricing Tool', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 30;

  // Configuration Details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Cake Configuration', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const configDetails = [
    `Event Date: ${config.eventDate || 'Not specified'}`,
    `Guest Count: ${config.guestCount}`,
    `Tiers: ${config.tiers}`,
    `Base Size: ${config.baseSize} inch`,
    `Shape: ${config.shape.charAt(0).toUpperCase() + config.shape.slice(1)}`,
    `Cake Flavor: ${config.cakeFlavor.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    `Filling: ${config.filling.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    `Delivery: ${config.delivery.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    `Distance: ${config.distance.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
  ];

  configDetails.forEach(detail => {
    doc.text(detail, margin, yPosition);
    yPosition += 8;
  });

  // Decorations
  const selectedDecorations = Object.entries(config.decorations)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
  
  if (selectedDecorations.length > 0) {
    yPosition += 5;
    doc.text('Decorations:', margin, yPosition);
    yPosition += 8;
    selectedDecorations.forEach(decoration => {
      doc.text(`• ${decoration}`, margin + 10, yPosition);
      yPosition += 8;
    });
  }

  // Special Requests
  if (config.specialRequests) {
    yPosition += 10;
    doc.text('Special Requests:', margin, yPosition);
    yPosition += 8;
    const splitText = doc.splitTextToSize(config.specialRequests, pageWidth - 2 * margin);
    doc.text(splitText, margin, yPosition);
    yPosition += splitText.length * 8;
  }

  yPosition += 20;

  // Pricing Breakdown
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Pricing Breakdown', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  // Line items
  pricing.lineItems.forEach(item => {
    doc.text(item.description, margin, yPosition);
    doc.text(`$${item.price.toFixed(2)}`, pageWidth - margin - 30, yPosition, { align: 'right' });
    yPosition += 8;
  });

  // Totals
  yPosition += 10;
  doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
  
  doc.text('Subtotal:', margin, yPosition);
  doc.text(`$${pricing.subtotal.toFixed(2)}`, pageWidth - margin - 30, yPosition, { align: 'right' });
  yPosition += 10;
  
  doc.text('Tax (8.5%):', margin, yPosition);
  doc.text(`$${pricing.tax.toFixed(2)}`, pageWidth - margin - 30, yPosition, { align: 'right' });
  yPosition += 15;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Total:', margin, yPosition);
  doc.text(`$${pricing.total.toFixed(2)}`, pageWidth - margin - 30, yPosition, { align: 'right' });

  yPosition += 20;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text(`Serves approximately ${config.guestCount} guests`, margin, yPosition);

  // Footer
  const currentDate = new Date().toLocaleDateString();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Generated on ${currentDate} by Wedding Cake Calculator`, pageWidth / 2, doc.internal.pageSize.height - 20, { align: 'center' });

  // Save the PDF
  const filename = `wedding-cake-estimate-${currentDate.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}
