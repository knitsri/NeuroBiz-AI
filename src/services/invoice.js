import { jsPDF } from 'jspdf';

export function generateInvoicePDF(req) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Color Palette
  const primaryColor = [99, 102, 241]; // Indigo: #6366f1
  const darkColor = [15, 23, 42]; // Slate-900
  const lightBg = [248, 250, 252]; // Slate-50
  const greyColor = [100, 116, 139]; // Slate-505

  // 1. Header Band
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('NEUROBIZ AI', 20, 22);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(129, 140, 248); // Indigo-300
  doc.text('B2B PROCUREMENT SERVICE NETWORK', 20, 28);

  // INVOICE text
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('INVOICE', 145, 25);

  // 2. Invoice Details Box (Metas)
  doc.setTextColor(...darkColor);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('INVOICE DETAILS', 20, 55);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...greyColor);
  doc.text(`Invoice ID: ${req.id.toUpperCase()}`, 20, 62);
  doc.text(`Invoice Date: ${new Date(req.paymentDate || req.createdAt || Date.now()).toLocaleDateString()}`, 20, 68);
  doc.text(`Deal Status: Fulfilled & Shipped`, 20, 74);
  doc.text(`Payment Status: Paid`, 20, 80);

  // 3. Bill To / Vendor details columns
  doc.setTextColor(...darkColor);
  doc.setFont('Helvetica', 'bold');
  doc.text('BUYER (BILL TO):', 20, 95);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...greyColor);
  doc.text(req.businessName, 20, 102);
  doc.text('SME Node Member', 20, 108);

  doc.setTextColor(...darkColor);
  doc.setFont('Helvetica', 'bold');
  doc.text('SUPPLIER (VENDOR):', 120, 95);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...greyColor);
  doc.text(req.vendor, 120, 102);
  doc.text('Verified Supplier Network', 120, 108);

  // 4. Line Items Table Headers
  doc.setFillColor(...lightBg);
  doc.rect(20, 120, 170, 10, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 120, 190, 120);
  doc.line(20, 130, 190, 130);

  doc.setTextColor(...darkColor);
  doc.setFont('Helvetica', 'bold');
  doc.text('Item Description', 24, 126);
  doc.text('Qty', 95, 126);
  doc.text('Unit Price', 120, 126);
  doc.text('Total Amount', 155, 126);

  // 5. Line Item Row
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...greyColor);
  const unitPrice = req.price || 120;
  const totalPrice = req.totalAmount || (unitPrice * req.quantity);

  doc.text(req.item, 24, 140);
  doc.text(`${req.quantity}`, 95, 140);
  doc.text(`Rs. ${unitPrice}`, 120, 140);
  
  doc.setTextColor(...darkColor);
  doc.setFont('Helvetica', 'bold');
  doc.text(`Rs. ${totalPrice}`, 155, 140);

  doc.line(20, 146, 190, 146);

  // 6. Summary Totals Box
  doc.setFillColor(...lightBg);
  doc.rect(115, 155, 75, 30, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(115, 155, 75, 30, 'S');

  doc.setTextColor(...greyColor);
  doc.setFont('Helvetica', 'normal');
  doc.text('Subtotal:', 120, 163);
  doc.text('Rs. ' + totalPrice, 160, 163);

  doc.text('Taxes & Levies:', 120, 170);
  doc.text('Rs. 0.00', 160, 170);

  doc.setTextColor(...primaryColor);
  doc.setFont('Helvetica', 'bold');
  doc.text('Grand Total:', 120, 178);
  doc.text('Rs. ' + totalPrice, 160, 178);

  // 7. Footer
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...greyColor);
  doc.setFontSize(8);
  doc.text('Thank you for choosing NeuroBiz AI SME Co-Pilot Platform.', 105, 270, null, null, 'center');
  doc.text('This is a computer generated document. No signature is required.', 105, 275, null, null, 'center');

  // Trigger download
  doc.save(`invoice_${req.id.toLowerCase()}.pdf`);
}
