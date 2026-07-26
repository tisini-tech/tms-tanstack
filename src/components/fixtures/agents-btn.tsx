import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'

import { Button } from '#/components/ui/button'
import { ensurePdfPolyfills } from '#/lib/pdf-polyfills'
import { AgentsReviewPDF } from '#/components/pdf-reports/agents/agents-review'
import { type ReviewTableData } from '#/components/fixtures/review/transform-review-stats'

interface AgentsReviewButtonProps {
  tableData: ReviewTableData | null
  teamName: string
}

export function AgentsReviewButton({
  tableData,
  teamName,
}: AgentsReviewButtonProps) {
  const [isClient, setIsClient] = useState(false)
  const [polyfillsReady, setPolyfillsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    void ensurePdfPolyfills().then(() => {
      if (!cancelled) {
        setPolyfillsReady(true)
        setIsClient(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const fileName = `${teamName.replace(/\s+/g, '_')}_agents_review.pdf`

  if (!tableData || !isClient || !polyfillsReady) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Download size={16} />
        Download PDF
      </Button>
    )
  }

  return (
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
    </PDFDownloadLink>
  )
}
