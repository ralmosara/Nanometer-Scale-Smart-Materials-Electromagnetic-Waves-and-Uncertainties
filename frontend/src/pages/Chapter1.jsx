import { useState } from 'react';
import { Typography, Box, Card, CardContent, TextField, Button, Grid, CircularProgress, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableRow, TableCell, TableHead, Alert } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { simulateFTIR, calculateSnell, simulateLightPropagation } from '../api/client';

function FTIRSimulator() {
  const [crystal, setCrystal] = useState('Ge');
  const [n2, setN2] = useState(1.5);
  const [angle, setAngle] = useState(45);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const crystals = { Ge: 4.0, ZnSe: 2.4, 'KRS-5': 2.4 };

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await simulateFTIR({ n1: crystals[crystal], n2, angle_deg: angle });
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const chartData = result ? result.wavenumbers.map((w, i) => ({
    wavenumber: Math.round(w),
    absorption: result.absorption[i],
  })) : [];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>FTIR/ATR Spectroscopy Simulator (Section 1.3.3)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Simulates absorption spectra with Si-O peaks (~1008, 1082 cm-1), Si-C peaks (~784, 864, 1258 cm-1),
          and CO2 region (2280-2400 cm-1). Critical angle: sin(theta_c) = n2/n1.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Crystal</InputLabel>
            <Select value={crystal} label="Crystal" onChange={(e) => setCrystal(e.target.value)}>
              {Object.keys(crystals).map((c) => <MenuItem key={c} value={c}>{c} (n={crystals[c]})</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Sample n2" size="small" type="number" value={n2} onChange={(e) => setN2(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.1 } }} sx={{ width: 140 }} />
          <FormControl size="small" sx={{ width: 140 }}>
            <InputLabel>Angle</InputLabel>
            <Select value={angle} label="Angle" onChange={(e) => setAngle(e.target.value)}>
              {[30, 45, 60].map((a) => <MenuItem key={a} value={a}>{a} degrees</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>
          {loading ? 'Computing...' : 'Simulate'}
        </Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity={result.total_reflection ? 'success' : 'warning'} sx={{ mb: 2 }}>
              Critical angle: {result.critical_angle_deg?.toFixed(2) || 'N/A'} deg |
              Total reflection: {result.total_reflection ? 'Yes' : 'No'}
            </Alert>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Absorption Spectrum (600-4000 cm-1)</Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="wavenumber" label={{ value: 'Wavenumber (cm-1)', position: 'bottom' }} reversed />
                <YAxis label={{ value: 'Absorption', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line dataKey="absorption" stroke="#4fc3f7" dot={false} strokeWidth={2} name="Absorption" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function SnellCalculator() {
  const [n1, setN1] = useState(2.4);
  const [n2, setN2] = useState(1.0);
  const [angle, setAngle] = useState(45);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await calculateSnell({ n1, n2, angle_deg: angle });
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Snell's Law & Critical Angle (Section 1.5)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          n1 * sin(theta1) = n2 * sin(theta2). Critical angle: sin(theta_c) = n2/n1 when n1 {'>'} n2.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField label="n1" size="small" type="number" value={n1} onChange={(e) => setN1(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.1 } }} sx={{ width: 120 }} />
          <TextField label="n2" size="small" type="number" value={n2} onChange={(e) => setN2(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.1 } }} sx={{ width: 120 }} />
          <TextField label="Angle (deg)" size="small" type="number" value={angle} onChange={(e) => setAngle(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 140 }} />
        </Box>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>
          Calculate
        </Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Table size="small" sx={{ maxWidth: 400 }}>
              <TableBody>
                <TableRow><TableCell>Incidence angle</TableCell><TableCell>{result.incidence_angle_deg} deg</TableCell></TableRow>
                <TableRow><TableCell>Refracted angle</TableCell><TableCell>{result.refracted_angle_deg?.toFixed(2) || 'Total reflection'} deg</TableCell></TableRow>
                <TableRow><TableCell>Critical angle</TableCell><TableCell>{result.critical_angle_deg?.toFixed(2) || 'N/A'} deg</TableCell></TableRow>
                <TableRow><TableCell>Total reflection</TableCell><TableCell>{result.total_reflection ? 'Yes' : 'No'}</TableCell></TableRow>
                <TableRow><TableCell>Reflectance (s-pol)</TableCell><TableCell>{(result.reflectance_s * 100).toFixed(2)}%</TableCell></TableRow>
                <TableRow><TableCell>Reflectance (p-pol)</TableCell><TableCell>{(result.reflectance_p * 100).toFixed(2)}%</TableCell></TableRow>
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function LightPropagation() {
  const [layers, setLayers] = useState([
    { n: 1.0, thickness: 100 },
    { n: 1.5, thickness: 200 },
    { n: 2.4, thickness: 150 },
  ]);
  const [angle, setAngle] = useState(30);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await simulateLightPropagation({ layers, angle_deg: angle });
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateLayer = (idx, key, val) => {
    const newLayers = [...layers];
    newLayers[idx] = { ...newLayers[idx], [key]: parseFloat(val) || 0 };
    setLayers(newLayers);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Light Ray Propagation (Section 1.5)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ray tracing through layered media with Snell's law at each interface.
        </Typography>

        <TextField label="Incidence Angle (deg)" size="small" type="number" value={angle}
          onChange={(e) => setAngle(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180, mb: 2 }} />

        {layers.map((layer, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ width: 70 }}>Layer {i + 1}:</Typography>
            <TextField label="n" size="small" type="number" value={layer.n} onChange={(e) => updateLayer(i, 'n', e.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.1 } }} sx={{ width: 100 }} />
            <TextField label="Thickness (nm)" size="small" type="number" value={layer.thickness} onChange={(e) => updateLayer(i, 'thickness', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
          </Box>
        ))}

        <Box sx={{ mt: 2 }}>
          <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>
            Trace Ray
          </Button>
        </Box>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Table size="small" sx={{ maxWidth: 500 }}>
              <TableHead>
                <TableRow><TableCell>Layer</TableCell><TableCell>n</TableCell><TableCell>Entry Angle</TableCell><TableCell>Reflection?</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {result.ray_path.map((seg) => (
                  <TableRow key={seg.layer}>
                    <TableCell>{seg.layer + 1}</TableCell>
                    <TableCell>{seg.n}</TableCell>
                    <TableCell>{seg.entry_angle_deg.toFixed(2)} deg</TableCell>
                    <TableCell>{seg.total_reflection ? 'Total reflection' : 'Pass'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function Chapter1() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Chapter 1: Nanometer Scale</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Sample elaboration and characterization using SEM, AFM, and FTIR/ATR spectroscopy.
      </Typography>
      <FTIRSimulator />
      <SnellCalculator />
      <LightPropagation />
    </Box>
  );
}
