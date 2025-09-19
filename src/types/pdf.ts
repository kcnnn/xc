export interface PDFData {
  filename: string;
  lineItems: LineItem[];
  page5Summary: Page5Summary;
  metadata: PDFMetadata;
}

export interface LineItem {
  lineItemNumber: string;
  description: string;
  quantity: number;
  unit: string;
  tax: number;
  rcv: number;
  ageLife: string;
  condition: string;
  depPercent: string;
  depreciation: number;
  acv: number;
  category: 'Labor' | 'Materials' | 'Equipment' | 'Overhead & Profit' | 'Other';
}

export interface Page5Summary {
  laborSubtotal: number;
  materialsSubtotal: number;
  equipmentSubtotal: number;
  otherSubtotal: number;
  subtotalBeforeOandP: number;
  overheadAndProfitPercent: number;
  overheadAndProfitAmount: number;
  subtotalAfterOandP: number;
  salesTaxPercent: number;
  salesTaxAmount: number;
  totalRCV: number;
  totalDepreciation: number;
  totalACV: number;
  grandTotal: number;
}

export interface PDFMetadata {
  date?: string;
  pages: number;
  projectName?: string;
  contractor?: string;
  version?: string;
  textLength?: number;
  first500Chars?: string;
}

export interface ComparisonResult {
  matchingItems: number;
  differences: number;
  totalItems: number;
  csvData: string;
  detailedComparison: DetailedComparison[];
  page5Comparison: Page5Comparison;
}

export interface DetailedComparison {
  lineItemNumber_Estimate1: string;
  description: string;
  quantity_Estimate1: number;
  unit_Estimate1: string;
  tax_Estimate1: number;
  rcv_Estimate1: number;
  ageLife_Estimate1: string;
  condition_Estimate1: string;
  depPercent_Estimate1: string;
  depreciation_Estimate1: number;
  acv_Estimate1: number;
  lineItemNumber_Estimate2: string;
  quantity_Estimate2: number;
  unit_Estimate2: string;
  tax_Estimate2: number;
  rcv_Estimate2: number;
  ageLife_Estimate2: string;
  condition_Estimate2: string;
  depPercent_Estimate2: string;
  depreciation_Estimate2: number;
  acv_Estimate2: number;
  rcv_Diff: number;
  depreciation_Diff: number;
  acv_Diff: number;
  quantity_Diff: number;
}

export interface Page5Comparison {
  laborSubtotal_Diff: number;
  materialsSubtotal_Diff: number;
  equipmentSubtotal_Diff: number;
  otherSubtotal_Diff: number;
  subtotalBeforeOandP_Diff: number;
  overheadAndProfit_Diff: number;
  subtotalAfterOandP_Diff: number;
  salesTax_Diff: number;
  totalRCV_Diff: number;
  totalDepreciation_Diff: number;
  totalACV_Diff: number;
  grandTotal_Diff: number;
} 