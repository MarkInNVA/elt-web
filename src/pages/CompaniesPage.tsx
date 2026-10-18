import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import {
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { activity, money } from '../core/format'
import { groupTotals, sectorGroups } from '../core/sectors'
import { netColor, paletteMain } from '../core/tradeColors'
import { displayNet } from '../core/types'
import type { BrowseState } from '../hooks/useBrowse'

export function CompaniesPage() {
  const browse = useOutletContext<BrowseState>()
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const issuers = browse.snapshot?.issuers ?? []
    const filtered = q
      ? issuers.filter(
          (r) =>
            r.ticker.toLowerCase().includes(q) ||
            (r.company?.toLowerCase().includes(q) ?? false),
        )
      : issuers
    return sectorGroups(filtered)
  }, [browse.snapshot?.issuers, query])

  if (browse.loading && !browse.snapshot) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!browse.snapshot) {
    return null
  }

  if (!browse.snapshot.issuers.length) {
    return (
      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
        No material purchases or sales in this window.
      </Typography>
    )
  }

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        label="Ticker or company"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2 }}
      />
      <List disablePadding>
        {groups.map((group) => {
          const totals = groupTotals(group)
          const isCollapsed = collapsed.has(group.id)
          return (
            <Box key={group.id} component="section" sx={{ mb: 1 }}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={() => toggle(group.id)} aria-label="Toggle sector">
                    {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                  </IconButton>
                }
                disablePadding
              >
                <ListItemButton onClick={() => toggle(group.id)} sx={{ pr: 6 }}>
                  <ListItemText
                    primary={group.name}
                    secondary={
                      <Typography component="span" variant="body2" color="text.secondary">
                        {group.rows.length} companies ·{' '}
                        <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                          P {money(totals.buyValue)}
                        </Box>
                        {' · '}
                        <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
                          S {money(totals.sellValue)}
                        </Box>
                        {' · '}
                        {activity(totals.buyTxn, totals.sellTxn)}
                      </Typography>
                    }
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 1,
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                      flexShrink: 0,
                      color: paletteMain(netColor(totals.net)),
                    }}
                  >
                    {money(totals.net)}
                  </Typography>
                </ListItemButton>
              </ListItem>
              <Collapse in={!isCollapsed}>
                <List dense disablePadding>
                  {group.rows.map((row) => (
                    <ListItem key={row.ticker} disablePadding>
                      <ListItemButton component={Link} to={`/issuer/${encodeURIComponent(row.ticker)}`}>
                        <ListItemText
                          primary={row.ticker}
                          secondary={
                            <>
                              {row.company}
                              <br />
                              {activity(row.buy_txn_count ?? 0, row.sell_txn_count ?? 0)}
                            </>
                          }
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
              </Collapse>
            </Box>
          )
        })}
      </List>
    </Box>
  )
}
