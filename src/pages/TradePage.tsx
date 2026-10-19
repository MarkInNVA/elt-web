import {
  Box,
  CircularProgress,
  Link as MuiLink,
  List,
  ListItem,
  Typography,
} from '@mui/material'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { describeApiError } from '../core/api'
import { codeLabel, money } from '../core/format'
import { paletteMain, transactionColor } from '../core/tradeColors'
import type { BrowseState } from '../hooks/useBrowse'
import { useTrades } from '../hooks/useTrades'
import type { TransactionRow } from '../core/types'

function TradeRow({
  headline,
  row,
}: {
  headline: string
  row: TransactionRow
}) {
  const detailParts = [
    row.transaction_date ?? row.filing_date,
    codeLabel(row.code),
    row.security,
    row.owner_position,
  ].filter((part) => part != null && String(part).length > 0)

  return (
    <ListItem alignItems="flex-start" sx={{ display: 'block', py: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" component="div" fontWeight={600}>
            {headline}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {detailParts.join(' · ')}
          </Typography>
          {row.filing_url ? (
            <MuiLink
              href={row.filing_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              sx={{ display: 'inline-block', mt: 0.5 }}
            >
              Filing
            </MuiLink>
          ) : null}
        </Box>
        {row.value != null ? (
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
              color: paletteMain(transactionColor(row.code)),
            }}
          >
            {money(row.value)}
          </Typography>
        ) : null}
      </Box>
    </ListItem>
  )
}

export function IssuerTradePage() {
  const { ticker = '' } = useParams()
  const browse = useOutletContext<BrowseState>()
  const edition = browse.displayed?.edition ?? ''
  const windowDays = browse.displayed?.windowDays ?? browse.windowDays
  const query = useTrades(edition, windowDays, { ticker: decodeURIComponent(ticker) })

  if (!edition) {
    return (
      <Typography>
        <Link to="/">Load companies first</Link>
      </Typography>
    )
  }

  if (query.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (query.isError) {
    return (
      <Typography color="error">
        {describeApiError(query.error)}
      </Typography>
    )
  }

  const rows = query.data ?? []
  return (
    <Box>
      <Typography variant="h5" gutterBottom>{decodeURIComponent(ticker)}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <Link to="/">Companies</Link>
      </Typography>
      {rows.length === 0 ? (
        <Typography color="text.secondary">No trades in this window.</Typography>
      ) : (
        <List disablePadding>
          {rows.map((row, index) => (
            <TradeRow
              key={`${row.accession}-${index}`}
              headline={row.owner_name ?? row.owner_cik ?? row.ticker}
              row={row}
            />
          ))}
        </List>
      )}
    </Box>
  )
}

export function PersonTradePage() {
  const { cik = '' } = useParams()
  const browse = useOutletContext<BrowseState>()
  const edition = browse.displayed?.edition ?? ''
  const windowDays = browse.displayed?.windowDays ?? browse.windowDays
  const query = useTrades(edition, windowDays, { ownerCik: decodeURIComponent(cik) })

  if (!edition) {
    return (
      <Typography>
        <Link to="/people">Load people first</Link>
      </Typography>
    )
  }

  if (query.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (query.isError) {
    return (
      <Typography color="error">
        {describeApiError(query.error)}
      </Typography>
    )
  }

  const rows = query.data ?? []
  const title = rows[0]?.owner_name ?? decodeURIComponent(cik)

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <Link to="/people">People</Link>
      </Typography>
      {rows.length === 0 ? (
        <Typography color="text.secondary">No trades in this window.</Typography>
      ) : (
        <List disablePadding>
          {rows.map((row, index) => (
            <TradeRow
              key={`${row.accession}-${index}`}
              headline={row.ticker}
              row={row}
            />
          ))}
        </List>
      )}
    </Box>
  )
}
