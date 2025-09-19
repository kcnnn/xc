import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { PDFData, LineItem, Page5Summary } from '@/types/pdf';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF and extract text
    const data = await pdf(buffer);
    const text = data.text;
    
    // Parse actual line items from the extracted text
    const lineItems = parseXactimateLineItems(text);
    
    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: 'No Xactimate line items found in PDF. Please ensure this is a valid Xactimate estimate.' },
        { status: 400 }
      );
    }
    
    // Calculate page 5 summary from actual extracted data
    const page5Summary = calculatePage5Summary(lineItems);
    
    const result: PDFData = {
      filename: file.name,
      lineItems,
      page5Summary,
      metadata: {
        date: new Date().toISOString(),
        pages: data.numpages
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file. Please ensure the file is not corrupted and contains readable text.' },
      { status: 500 }
    );
  }
}

function parseXactimateLineItems(text: string): LineItem[] {
  const lines = text.split('\n').filter(line => line.trim());
  const lineItems: LineItem[] = [];
  
  // Pattern to match Xactimate line items
  // Looking for: number. description quantity unit tax rcv age/life cond. dep% deprec. acv
  const lineItemPattern = /^(\d+)\.\s+(.+?)\s+([\d,]+\.?\d*)\s+([A-Z]+)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([^0-9]+?)\s+([^0-9]+?)\s+([^0-9]+?)\s+\(?([\d,]+\.?\d*)\)?\s+([\d,]+\.?\d*)/;
  
  for (const line of lines) {
    const match = line.match(lineItemPattern);
    if (match) {
      try {
        const [
          ,
          lineNumber,
          description,
          quantityStr,
          unit,
          taxStr,
          rcvStr,
          ageLife,
          condition,
          depPercent,
          depreciationStr,
          acvStr
        ] = match;
        
        // Clean and parse numeric values
        const quantity = parseFloat(quantityStr.replace(/,/g, ''));
        const tax = parseFloat(taxStr.replace(/,/g, ''));
        const rcv = parseFloat(rcvStr.replace(/,/g, ''));
        const depreciation = parseFloat(depreciationStr.replace(/,/g, ''));
        const acv = parseFloat(acvStr.replace(/,/g, ''));
        
        // Validate parsed values
        if (!isNaN(quantity) && !isNaN(rcv) && !isNaN(acv)) {
          const lineItem: LineItem = {
            lineItemNumber: lineNumber,
            description: description.trim(),
            quantity,
            unit,
            tax,
            rcv,
            ageLife: ageLife.trim(),
            condition: condition.trim(),
            depPercent: depPercent.trim(),
            depreciation,
            acv,
            category: categorizeLineItem(description.trim())
          };
          
          lineItems.push(lineItem);
        }
      } catch (parseError) {
        console.warn('Failed to parse line item:', line, parseError);
        continue;
      }
    }
  }
  
  // If the main pattern didn't work, try alternative patterns
  if (lineItems.length === 0) {
    return parseAlternativePatterns(text);
  }
  
  return lineItems;
}

function parseAlternativePatterns(text: string): LineItem[] {
  const lines = text.split('\n').filter(line => line.trim());
  const lineItems: LineItem[] = [];
  
  // Alternative pattern for different Xactimate formats
  // Look for lines with quantities, units, and prices
  const altPattern = /(\d+\.?\d*)\s+([A-Z]+)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(altPattern);
    
    if (match) {
      // Look for description in previous lines
      let description = '';
      let lineNumber = '';
      
      // Search backwards for line number and description
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const prevLine = lines[j];
        if (prevLine.match(/^\d+\./)) {
          lineNumber = prevLine.match(/^(\d+)\./)?.[1] || '';
          description = prevLine.replace(/^\d+\.\s*/, '').trim();
          break;
        }
      }
      
      if (description && lineNumber) {
        try {
          const quantity = parseFloat(match[1].replace(/,/g, ''));
          const unit = match[2];
          const rcv = parseFloat(match[3].replace(/,/g, ''));
          const acv = parseFloat(match[4].replace(/,/g, ''));
          
          if (!isNaN(quantity) && !isNaN(rcv) && !isNaN(acv)) {
            const lineItem: LineItem = {
              lineItemNumber: lineNumber,
              description,
              quantity,
              unit,
              tax: 0, // Default values for missing fields
              rcv,
              ageLife: '10/25 yrs',
              condition: 'Avg.',
              depPercent: 'NA',
              depreciation: rcv - acv,
              acv,
              category: categorizeLineItem(description)
            };
            
            lineItems.push(lineItem);
          }
        } catch (parseError) {
          console.warn('Failed to parse alternative line item:', line, parseError);
          continue;
        }
      }
    }
  }
  
  return lineItems;
}

function categorizeLineItem(description: string): 'Labor' | 'Materials' | 'Equipment' | 'Overhead & Profit' | 'Other' {
  const desc = description.toLowerCase();
  
  if (desc.includes('tear off') || desc.includes('prime') || desc.includes('paint') || desc.includes('labor')) {
    return 'Labor';
  }
  if (desc.includes('shingle') || desc.includes('felt') || desc.includes('flashing') || desc.includes('vent') || desc.includes('cap') || desc.includes('drip edge')) {
    return 'Materials';
  }
  if (desc.includes('equipment') || desc.includes('rental')) {
    return 'Equipment';
  }
  if (desc.includes('overhead') || desc.includes('profit')) {
    return 'Overhead & Profit';
  }
  
  return 'Other';
}

function calculatePage5Summary(lineItems: LineItem[]): Page5Summary {
  // Calculate category subtotals from actual extracted data
  const laborSubtotal = lineItems
    .filter(item => item.category === 'Labor')
    .reduce((sum, item) => sum + item.rcv, 0);
    
  const materialsSubtotal = lineItems
    .filter(item => item.category === 'Materials')
    .reduce((sum, item) => sum + item.rcv, 0);
    
  const equipmentSubtotal = lineItems
    .filter(item => item.category === 'Equipment')
    .reduce((sum, item) => sum + item.rcv, 0);
    
  const otherSubtotal = lineItems
    .filter(item => item.category === 'Other')
    .reduce((sum, item) => sum + item.rcv, 0);

  // Subtotal before overhead & profit
  const subtotalBeforeOandP = laborSubtotal + materialsSubtotal + equipmentSubtotal + otherSubtotal;
  
  // Overhead & Profit (typically 20% for residential)
  const overheadAndProfitPercent = 20;
  const overheadAndProfitAmount = subtotalBeforeOandP * (overheadAndProfitPercent / 100);
  
  // Subtotal after overhead & profit
  const subtotalAfterOandP = subtotalBeforeOandP + overheadAndProfitAmount;
  
  // Sales tax (typically 6-8%, using 7% as example)
  const salesTaxPercent = 7;
  const salesTaxAmount = subtotalAfterOandP * (salesTaxPercent / 100);
  
  // Total RCV (Replacement Cost Value)
  const totalRCV = subtotalAfterOandP + salesTaxAmount;
  
  // Total depreciation from actual data
  const totalDepreciation = lineItems.reduce((sum, item) => sum + item.depreciation, 0);
  
  // Total ACV (Actual Cash Value) from actual data
  const totalACV = lineItems.reduce((sum, item) => sum + item.acv, 0);
  
  // Grand total (ACV + sales tax)
  const grandTotal = totalACV + salesTaxAmount;

  return {
    laborSubtotal,
    materialsSubtotal,
    equipmentSubtotal,
    otherSubtotal,
    subtotalBeforeOandP,
    overheadAndProfitPercent,
    overheadAndProfitAmount,
    subtotalAfterOandP,
    salesTaxPercent,
    salesTaxAmount,
    totalRCV,
    totalDepreciation,
    totalACV,
    grandTotal
  };
} 