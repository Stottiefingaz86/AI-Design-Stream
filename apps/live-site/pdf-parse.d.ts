declare module 'pdf-parse' {
  interface PDFParseResult {
    text: string
    numpages: number
    info: any
    metadata: any
  }

  class PDFParse {
    constructor(buffer: Buffer)
    getText(): string
  }

  export default function pdfParse(buffer: Buffer): Promise<PDFParseResult>
  export { PDFParse }
}
