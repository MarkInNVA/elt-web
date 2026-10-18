import {
  Box,
  CircularProgress,
  Link as MuiLink,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { describeApiError } from '../core/api'
import { money } from '../core/format'
import type { BrowseState } from '../hooks/useBrowse'
import { useTrades } from '../hooks/useTrades'

export function IssuerTradePage() {
  const { ticker = '' } = useParams()
  const browse = useOutletContext<BrowseState>()
  const edition = browse.snapshot?.edition ?? ''
  const windowDays = browse.snapshot?.windowDays ?? browse.windowDays
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
        <List>
          {rows.map((row, index) => (
            <ListItem key={`${row.accession}-${index}`} alignItems="flex-start">
              <ListItemText
                primary={`${row.code ?? '?'} · ${money(row.value ?? 0)}`}
                secondary={
                  <>
                    {row.transaction_date ?? row.filing_date}
                    {row.owner_name ? ` · ${row.owner_name}` : ''}
                    {row.filing_url ? (
                      <>
                        {' · '}
                        <MuiLink href={row.filing_url} target="_blank" rel="noopener noreferrer">
                          Filing
                        </MuiLink>
                      </>
                    ) : null}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}

export function PersonTradePage() {
  const { cik = '' } = useParams()
  const browse = useOutletContext<BrowseState>()
  const edition = browse.snapshot?.edition ?? ''
  const windowDays = browse.snapshot?.windowDays ?? browse.windowDays
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
        <List>
          {rows.map((row, index) => (
            <ListItem key={`${row.accession}-${index}`} alignItems="flex-start">
              <ListItemText
                primary={`${row.ticker} · ${row.code ?? '?'} · ${money(row.value ?? 0)}`}
                secondary={
                  <>
                    {row.transaction_date ?? row.filing_date}
                    {row.filing_url ? (
                      <>
                        {' · '}
                        <MuiLink href={row.filing_url} target="_blank" rel="noopener noreferrer">
                          Filing
                        </MuiLink>
                      </>
                    ) : null}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
