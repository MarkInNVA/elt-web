import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { money } from '../core/format'
import { netColor, paletteMain } from '../core/tradeColors'
import { displayNet } from '../core/types'
import type { BrowseState } from '../hooks/useBrowse'

export function PeoplePage() {
  const browse = useOutletContext<BrowseState>()
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const people = browse.displayed?.people ?? []
    if (!q) return people
    return people.filter(
      (r) =>
        (r.owner_name?.toLowerCase().includes(q) ?? false) ||
        r.owner_cik.includes(q) ||
        (r.tickers?.some((t) => t.toLowerCase().includes(q)) ?? false),
    )
  }, [browse.displayed?.people, query])

  if (browse.loading && !browse.displayed) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!browse.displayed) {
    return null
  }

  if (!rows.length && !query.trim()) {
    return (
      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
        No one has material purchases or sales at two or more companies in this window.
      </Typography>
    )
  }

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        label="Name or ticker"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2 }}
      />
      <List disablePadding>
        {rows.map((row) => (
          <ListItem key={row.owner_cik} disablePadding>
            <ListItemButton
              component={Link}
              to={`/person/${encodeURIComponent(row.owner_cik)}`}
            >
              <ListItemText
                primary={row.owner_name ?? row.owner_cik}
                secondary={row.tickers?.join(', ')}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  color: paletteMain(netColor(displayNet(row))),
                }}
              >
                {money(displayNet(row))}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
