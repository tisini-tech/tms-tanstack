import { Download } from 'lucide-react'
import { useEffect, useState, type ReactElement } from 'react'

import { Button } from '#/components/ui/button'
import { ensurePdfPolyfills } from '#/lib/pdf-polyfills'
import { type ReviewTableData } from '#/components/fixtures/review/transform-review-stats'

interface AgentsReviewButtonProps {
  tableData: ReviewTableData | null
  teamName: string
}

export function AgentsReviewButton({
  tableData,
  teamName,
}: AgentsReviewButtonProps) {
  const [pdfLink, setPdfLink] = useState<ReactElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPdfLink() {
      if (!tableData || !teamName) {
        setPdfLink(null)
        return
      }

      await ensurePdfPolyfills()

      const [{ PDFDownloadLink }, { AgentsReviewPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('#/components/pdf-reports/agents/agents-review'),
      ])

      if (cancelled) return

      const fileName = `${teamName.replace(/\s+/g, '_')}_agents_review.pdf`

      setPdfLink(
        <PDFDownloadLink
          document={<AgentsReviewPDF tableData={tableData} />}
          fileName={fileName}
          style={{ textDecoration: 'none' }}
        >
          {({ loading }) => (
            <Button variant="outline" size="sm" disabled={loading}>
              <Download size={16} />
              {loading ? 'Generating...' : 'Download PDF'}
            </Button>
          )}
        </PDFDownloadLink>,
      )
    }

    void loadPdfLink()

    return () => {
      cancelled = true
    }
  }, [tableData, teamName])

  if (!tableData || !pdfLink) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Download size={16} />
        Download PDF
      </Button>
    )
  }

  return pdfLink
}
