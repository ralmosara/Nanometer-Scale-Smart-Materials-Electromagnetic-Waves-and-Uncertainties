import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, CardActionArea, Typography, Box, Chip } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import BarChartIcon from '@mui/icons-material/BarChart';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import MemoryIcon from '@mui/icons-material/Memory';

const chapters = [
  {
    path: '/chapter1',
    title: 'Chapter 1: Nanometer Scale',
    icon: <ScienceIcon sx={{ fontSize: 48 }} />,
    description: 'Sample elaboration (spin coating, cathode sputtering, laser ablation) and characterization using SEM, AFM, and FTIR/ATR spectroscopy.',
    simulators: ['FTIR/ATR Spectroscopy', "Snell's Law Calculator", 'Light Ray Propagation'],
    color: '#4fc3f7',
  },
  {
    path: '/chapter2',
    title: 'Chapter 2: Statistical Tools',
    icon: <BarChartIcon sx={{ fontSize: 48 }} />,
    description: 'Statistical methods to reduce design uncertainties: Monte Carlo, Taguchi, polynomial chaos, PCA, and linear oscillator analysis.',
    simulators: ['Monte Carlo Simulation', 'Taguchi Method', 'Polynomial Chaos', 'Linear Oscillator', 'PCA Analysis'],
    color: '#ce93d8',
  },
  {
    path: '/chapter3',
    title: 'Chapter 3: Electromagnetic Waves',
    icon: <WifiTetheringIcon sx={{ fontSize: 48 }} />,
    description: 'EM wave applications including wire antenna radiation, N-element phased array networks, beam steering, and 5G antenna analysis.',
    simulators: ['Antenna Radiation Pattern', 'N-Element Antenna Network', 'Beam Steering'],
    color: '#81c784',
  },
  {
    path: '/chapter4',
    title: 'Chapter 4: Smart Materials',
    icon: <MemoryIcon sx={{ fontSize: 48 }} />,
    description: 'Piezoelectric materials, strain tensor analysis, accelerometer calculations, and thermodynamic couplings in active materials.',
    simulators: ['Strain Tensor Calculator', 'Piezoelectric Accelerometer'],
    color: '#ffb74d',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Simulation Platform
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Interactive scientific computation tools based on "Applications and Metrology
        at Nanometer Scale, Volume 1" by Pierre-Richard Dahoo, Philippe Pougnet & Abdelkhalak El Hami.
      </Typography>

      <Grid container spacing={3}>
        {chapters.map((ch) => (
          <Grid key={ch.path} size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', '&:hover': { borderColor: ch.color, boxShadow: `0 0 20px ${ch.color}22` } }}>
              <CardActionArea onClick={() => navigate(ch.path)} sx={{ height: '100%', p: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: ch.color }}>
                    {ch.icon}
                    <Typography variant="h6" sx={{ ml: 2 }}>
                      {ch.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {ch.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {ch.simulators.map((s) => (
                      <Chip key={s} label={s} size="small" variant="outlined"
                        sx={{ borderColor: `${ch.color}44`, color: ch.color, fontSize: '0.7rem' }} />
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
