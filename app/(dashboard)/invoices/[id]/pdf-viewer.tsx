'use client'

import { useState, useEffect } from 'react'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import { InvoicePDF } from './invoice-pdf'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function InvoicePDFViewer({ invoice, settings }: { invoice: any, settings: any }) {
  const [isClient, setIsClient] = useState(false)

  // Avoid hydration mismatch since @react-pdf relies on window
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="h-[600px] flex items-center justify-center bg-muted/20 border border-border rounded-xl">Loading PDF Viewer...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <PDFDownloadLink 
          document={<InvoicePDF invoice={invoice} settings={settings} />} 
          fileName={`${invoice.invoiceNumber}.pdf`}
        >
          {({ loading }: any) => (
            <Button disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              {loading ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      
      <div className="h-[800px] w-full border border-border rounded-xl overflow-hidden shadow-sm">
        <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
          <InvoicePDF invoice={invoice} settings={settings} />
        </PDFViewer>
      </div>
    </div>
  )
}
