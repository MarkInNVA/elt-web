import BusinessIcon from '@mui/icons-material/Business'
import PeopleIcon from '@mui/icons-material/People'
import {
  Alert,
  AppBar,
  Box,
  Container,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LAKE_SCOPE } from '../core/lakeScope'
import { lagLookbackNote, snapshotCaption } from '../core/types'
import type { BrowseState } from '../hooks/useBrowse'

export function AppShell({ browse }: { browse: BrowseState }) {
  const location = useLocation()
  const tab = location.pathname.startsWith('/people') ? 1 : 0
  const snapshot = browse.snapshot
  const lag = snapshot ? lagLookbackNote(snapshot) : null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, minWidth: 120 }}>
            ELT
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={browse.windowDays}
            onChange={(_, value) => {
              if (value != null) void browse.setWindowDays(value)
            }}
            aria-label="Recent window"
          >
            {LAKE_SCOPE.windows.map((days) => (
              <ToggleButton key={days} value={days}>
                {days}d
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Toolbar>
        {snapshot && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {snapshotCaption(snapshot)}
            </Typography>
            {lag && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {lag}
              </Typography>
            )}
          </Box>
        )}
        <Tabs value={tab} variant="fullWidth">
          <Tab
            icon={<BusinessIcon />}
            iconPosition="start"
            label="Companies"
            component={Link}
            to="/"
          />
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label="People"
            component={Link}
            to="/people"
          />
        </Tabs>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 2, flex: 1 }}>
        {browse.errorMessage && !browse.loading && (
          <Alert severity="warning" sx={{ mb: 2 }}>{browse.errorMessage}</Alert>
        )}
        <Outlet context={browse} />
      </Container>
    </Box>
  )
}
