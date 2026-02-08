import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, IconButton, Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ScienceIcon from '@mui/icons-material/Science';
import BarChartIcon from '@mui/icons-material/BarChart';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import MemoryIcon from '@mui/icons-material/Memory';

const DRAWER_WIDTH = 260;

const navItems = [
  { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/chapter1', label: 'Ch1: Nanometer Scale', icon: <ScienceIcon /> },
  { path: '/chapter2', label: 'Ch2: Statistical Tools', icon: <BarChartIcon /> },
  { path: '/chapter3', label: 'Ch3: EM Waves', icon: <WifiTetheringIcon /> },
  { path: '/chapter4', label: 'Ch4: Smart Materials', icon: <MemoryIcon /> },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const drawer = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
          Nanometer Scale
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Simulation Platform
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{ borderRadius: 1, mx: 1, my: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: 'background.paper' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Applications & Metrology at Nanometer Scale
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Dahoo, Pougnet & El Hami
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: 'background.paper' },
        }}
      >
        <Toolbar />
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: `${DRAWER_WIDTH}px` }, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
