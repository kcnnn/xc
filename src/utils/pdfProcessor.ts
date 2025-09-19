import { PDFData, LineItem, Page5Summary } from '@/types/pdf';

// PDF processing is now handled by API routes

interface ComparisonItem {
  lineItemNumber_Estimate1?: string;
  lineItemNumber_Estimate2?: string;
  description: string;
  quantity_Estimate1?: number;
  quantity_Estimate2?: number;
  unit_Estimate1?: string;
  unit_Estimate2?: string;
  tax_Estimate1?: number;
  tax_Estimate2?: number;
  rcv_Estimate1?: number;
  rcv_Estimate2?: number;
  ageLife_Estimate1?: string;
  ageLife_Estimate2?: string;
  condition_Estimate1?: string;
  condition_Estimate2?: string;
  depPercent_Estimate1?: string;
  depPercent_Estimate2?: string;
  depreciation_Estimate1?: number;
  depreciation_Estimate2?: number;
  acv_Estimate1?: number;
  acv_Estimate2?: number;
  category_Estimate1?: string;
  category_Estimate2?: string;
  rcv_Diff?: number;
  depreciation_Diff?: number;
  acv_Diff?: number;
  quantity_Diff?: number;
}

export function comparePDFs(first: PDFData, second: PDFData) {
  const allItems = new Map<string, ComparisonItem>();
  
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
      category_Estimate1: item.category,
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
      category_Estimate2: '',
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
      if (existing) {
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
        existing.category_Estimate2 = item.category;
        
        // Calculate differences
        existing.rcv_Diff = (existing.rcv_Estimate2 || 0) - (existing.rcv_Estimate1 || 0);
        existing.depreciation_Diff = (existing.depreciation_Estimate2 || 0) - (existing.depreciation_Estimate1 || 0);
        existing.acv_Diff = (existing.acv_Estimate2 || 0) - (existing.acv_Estimate1 || 0);
        existing.quantity_Diff = (existing.quantity_Estimate2 || 0) - (existing.quantity_Estimate1 || 0);
      }
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
        category_Estimate1: '',
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
        category_Estimate2: item.category,
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

function calculatePage5Differences(first: Page5Summary, second: Page5Summary) {
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

function generateCSV(comparison: ComparisonItem[]): string {
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
    'Category_Estimate1',
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
    'Category_Estimate2',
    'RCV_Diff',
    'Depreciation_Diff',
    'ACV_Diff',
    'Quantity_Diff'
  ];
  
  const csvContent = [
    headers.join('\t'),
    ...comparison.map(item => [
      item.lineItemNumber_Estimate1 || '',
      item.description || '',
      item.quantity_Estimate1 || 0,
      item.unit_Estimate1 || '',
      item.tax_Estimate1 || 0,
      item.rcv_Estimate1 || 0,
      item.ageLife_Estimate1 || '',
      item.condition_Estimate1 || '',
      item.depPercent_Estimate1 || '',
      item.depreciation_Estimate1 || 0,
      item.acv_Estimate1 || 0,
      item.category_Estimate1 || '',
      item.lineItemNumber_Estimate2 || '',
      item.quantity_Estimate2 || 0,
      item.unit_Estimate2 || '',
      item.tax_Estimate2 || 0,
      item.rcv_Estimate2 || 0,
      item.ageLife_Estimate2 || '',
      item.condition_Estimate2 || '',
      item.depPercent_Estimate2 || '',
      item.depreciation_Estimate2 || 0,
      item.acv_Estimate2 || 0,
      item.category_Estimate2 || '',
      item.rcv_Diff || 0,
      item.depreciation_Diff || 0,
      item.acv_Diff || 0,
      item.quantity_Diff || 0
    ].join('\t'))
  ].join('\n');
  
  return csvContent;
}
