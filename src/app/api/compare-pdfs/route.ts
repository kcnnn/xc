import { NextRequest, NextResponse } from 'next/server';
import { PDFData, LineItem, Page5Comparison } from '@/types/pdf';

export async function POST(request: NextRequest) {
  try {
    const { first, second } = await request.json();
    
    if (!first || !second) {
      return NextResponse.json(
        { error: 'Both PDF data objects are required' },
        { status: 400 }
      );
    }

    const results = comparePDFs(first, second);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error comparing PDFs:', error);
    return NextResponse.json(
      { error: 'Failed to compare PDFs' },
      { status: 500 }
    );
  }
}

function comparePDFs(first: PDFData, second: PDFData): any {
  const allItems = new Map<string, any>();
  
  // Process first estimate
  first.lineItems.forEach(item => {
    allItems.set(item.description, {
      lineItemNumber_Estimate1: item.lineItemNumber,
      description: item.description,
      quantity_Estimate1: item.quantity,
      unit_Estimate1: item.unit,
      tax_Estimate1: item.tax,
      rcv_Estimate1: item.rcv,
      ageLife_Estimate1: item.ageLife,
      condition_Estimate1: item.condition,
      depPercent_Estimate1: item.depPercent,
      depreciation_Estimate1: item.depreciation,
      acv_Estimate1: item.acv,
      lineItemNumber_Estimate2: '',
      quantity_Estimate2: 0,
      unit_Estimate2: '',
      tax_Estimate2: 0,
      rcv_Estimate2: 0,
      ageLife_Estimate2: '',
      condition_Estimate2: '',
      depPercent_Estimate2: '',
      depreciation_Estimate2: 0,
      acv_Estimate2: 0,
      rcv_Diff: 0,
      depreciation_Diff: 0,
      acv_Diff: 0,
      quantity_Diff: 0
    });
  });
  
  // Process second estimate
  second.lineItems.forEach(item => {
    if (allItems.has(item.description)) {
      const existing = allItems.get(item.description);
      existing.lineItemNumber_Estimate2 = item.lineItemNumber;
      existing.quantity_Estimate2 = item.quantity;
      existing.unit_Estimate2 = item.unit;
      existing.tax_Estimate2 = item.tax;
      existing.rcv_Estimate2 = item.rcv;
      existing.ageLife_Estimate2 = item.ageLife;
      existing.condition_Estimate2 = item.condition;
      existing.depPercent_Estimate2 = item.depPercent;
      existing.depreciation_Estimate2 = item.depreciation;
      existing.acv_Estimate2 = item.acv;
      
      // Calculate differences
      existing.rcv_Diff = existing.rcv_Estimate2 - existing.rcv_Estimate1;
      existing.depreciation_Diff = existing.depreciation_Estimate2 - existing.depreciation_Estimate1;
      existing.acv_Diff = existing.acv_Estimate2 - existing.acv_Estimate1;
      existing.quantity_Diff = existing.quantity_Estimate2 - existing.quantity_Estimate1;
    } else {
      allItems.set(item.description, {
        lineItemNumber_Estimate1: '',
        description: item.description,
        quantity_Estimate1: 0,
        unit_Estimate1: '',
        tax_Estimate1: 0,
        rcv_Estimate1: 0,
        ageLife_Estimate1: '',
        condition_Estimate1: '',
        depPercent_Estimate1: '',
        depreciation_Estimate1: 0,
        acv_Estimate1: 0,
        lineItemNumber_Estimate2: item.lineItemNumber,
        quantity_Estimate2: item.quantity,
        unit_Estimate2: item.unit,
        tax_Estimate2: item.tax,
        rcv_Estimate2: item.rcv,
        ageLife_Estimate2: item.ageLife,
        condition_Estimate2: item.condition,
        depPercent_Estimate2: item.depPercent,
        depreciation_Estimate2: item.depreciation,
        acv_Estimate2: item.acv,
        rcv_Diff: 0,
        depreciation_Diff: 0,
        acv_Diff: 0,
        quantity_Diff: 0
      });
    }
  });
  
  const results = Array.from(allItems.values());
  const matchingItems = results.filter(r => 
    r.rcv_Diff === 0 && r.depreciation_Diff === 0 && r.acv_Diff === 0 && r.quantity_Diff === 0
  ).length;
  const differences = results.length - matchingItems;
  const totalItems = results.length;
  
  // Calculate page 5 summary differences
  const page5Comparison = calculatePage5Differences(first.page5Summary, second.page5Summary);
  
  return {
    matchingItems,
    differences,
    totalItems,
    detailedComparison: results,
    page5Comparison,
    csvData: generateCSV(results)
  };
}

function calculatePage5Differences(first: any, second: any): Page5Comparison {
  return {
    laborSubtotal_Diff: second.laborSubtotal - first.laborSubtotal,
    materialsSubtotal_Diff: second.materialsSubtotal - first.materialsSubtotal,
    equipmentSubtotal_Diff: second.equipmentSubtotal - first.equipmentSubtotal,
    otherSubtotal_Diff: second.otherSubtotal - first.otherSubtotal,
    subtotalBeforeOandP_Diff: second.subtotalBeforeOandP - first.subtotalBeforeOandP,
    overheadAndProfit_Diff: second.overheadAndProfitAmount - first.overheadAndProfitAmount,
    subtotalAfterOandP_Diff: second.subtotalAfterOandP - first.subtotalAfterOandP,
    salesTax_Diff: second.salesTaxAmount - first.salesTaxAmount,
    totalRCV_Diff: second.totalRCV - first.totalRCV,
    totalDepreciation_Diff: second.totalDepreciation - first.totalDepreciation,
    totalACV_Diff: second.totalACV - first.totalACV,
    grandTotal_Diff: second.grandTotal - first.grandTotal
  };
}

function generateCSV(comparison: any[]): string {
  const headers = [
    'LineItemNumber_Estimate1',
    'Description',
    'Quantity_Estimate1',
    'Unit_Estimate1',
    'Tax_Estimate1',
    'RCV_Estimate1',
    'AgeLife_Estimate1',
    'Condition_Estimate1',
    'DepPercent_Estimate1',
    'Depreciation_Estimate1',
    'ACV_Estimate1',
    'LineItemNumber_Estimate2',
    'Quantity_Estimate2',
    'Unit_Estimate2',
    'Tax_Estimate2',
    'RCV_Estimate2',
    'AgeLife_Estimate2',
    'Condition_Estimate2',
    'DepPercent_Estimate2',
    'Depreciation_Estimate2',
    'ACV_Estimate2',
    'RCV_Diff',
    'Depreciation_Diff',
    'ACV_Diff',
    'Quantity_Diff'
  ];
  
  const rows = comparison.map(item => [
    item.lineItemNumber_Estimate1 || '',
    `"${item.description}"`,
    item.quantity_Estimate1 || '',
    item.unit_Estimate1 || '',
    item.tax_Estimate1 || '',
    item.rcv_Estimate1 || '',
    item.ageLife_Estimate1 || '',
    item.condition_Estimate1 || '',
    item.depPercent_Estimate1 || '',
    item.depreciation_Estimate1 || '',
    item.acv_Estimate1 || '',
    item.lineItemNumber_Estimate2 || '',
    item.quantity_Estimate2 || '',
    item.unit_Estimate2 || '',
    item.tax_Estimate2 || '',
    item.rcv_Estimate2 || '',
    item.ageLife_Estimate2 || '',
    item.condition_Estimate2 || '',
    item.depPercent_Estimate2 || '',
    item.depreciation_Estimate2 || '',
    item.acv_Estimate2 || '',
    item.rcv_Diff || '',
    item.depreciation_Diff || '',
    item.acv_Diff || '',
    item.quantity_Diff || ''
  ]);
  
  return [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
} 