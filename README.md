# Xactimate PDF Comparator

A modern web application built with Next.js, React, and Tailwind CSS that allows users to upload two Xactimate PDF estimates, compare line items, and export the results as a CSV file for detailed analysis.

## Features

- **PDF Upload**: Drag-and-drop interface for uploading Xactimate PDF files
- **Smart Parsing**: Automatically extracts line items, quantities, units, and pricing from PDFs
- **Line-by-Line Comparison**: Identifies matching items, differences, and missing entries
- **CSV Export**: Generate comprehensive reports with all comparison data
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Real-time Processing**: Instant feedback and progress indicators

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **File Handling**: react-dropzone
- **Icons**: Lucide React
- **Build Tool**: Next.js App Router

## Current Implementation Status

**Note**: This is currently a demonstration version with mock PDF processing. The application demonstrates the complete UI and workflow, but uses sample data instead of actual PDF parsing.

### PDF Processing Options for Production

To implement actual PDF processing, consider these approaches:

1. **Cloud-based PDF Processing Services**:
   - AWS Textract
   - Google Cloud Document AI
   - Azure Form Recognizer
   - Adobe PDF Services API

2. **Server-side PDF Libraries** (requires proper server setup):
   - pdf-parse (Node.js)
   - pdf2pic (Node.js)
   - pdf-lib (Node.js)

3. **Client-side Processing**:
   - pdf.js (browser-based)
   - pdf-lib (browser-based)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd xactimate-compare
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Upload PDFs**: Drag and drop or click to upload two Xactimate PDF estimate files
2. **Processing**: The app will automatically process and extract line item data from each PDF
3. **Comparison**: Click "Compare Estimates" to analyze the differences between the two estimates
4. **Review Results**: View summary statistics and detailed comparison information
5. **Export**: Download the complete comparison as a CSV file for further analysis

## PDF Format Support

This tool is designed to work with Xactimate PDF estimates. The parser looks for:
- Line item descriptions
- Quantities and units
- Unit prices and total prices
- Categorization (Labor, Materials, Equipment, etc.)

## CSV Output Format

The exported CSV includes:
- Description of each line item
- Comparison status (matching, different, missing)
- Quantities, units, and pricing from both estimates
- Detailed difference descriptions

## Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main application page
│   ├── globals.css     # Global styles
│   └── api/            # API routes
│       ├── process-pdf/ # PDF processing endpoint
│       └── compare-pdfs/ # PDF comparison endpoint
├── components/          # React components
│   ├── PDFUploader.tsx # PDF upload interface
│   └── ComparisonResults.tsx # Results display
└── types/              # TypeScript type definitions
    └── pdf.ts         # PDF data structures
```

## Customization

### Adding Real PDF Processing

To implement actual PDF processing, modify the `/api/process-pdf/route.ts` file:

```typescript
// Example with a cloud service
export async function POST(request: NextRequest) {
  // 1. Get the PDF file from the request
  // 2. Send to your chosen PDF processing service
  // 3. Parse the response and extract line items
  // 4. Return structured data
}
```

### Styling

The application uses Tailwind CSS for styling. Customize the design by modifying:
- `src/app/globals.css` for global styles
- Component-specific Tailwind classes
- Color schemes and spacing in the Tailwind config

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

## Roadmap

- [x] Complete UI and workflow demonstration
- [ ] Real PDF processing integration
- [ ] Support for additional PDF formats
- [ ] Batch processing of multiple PDFs
- [ ] Advanced filtering and search
- [ ] Cloud storage integration
- [ ] User authentication and project management
- [ ] API endpoints for integration
