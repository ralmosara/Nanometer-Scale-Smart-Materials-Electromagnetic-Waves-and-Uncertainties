import { useState } from 'react';
import { Typography, Box, Card, CardContent, TextField, Button, Grid, CircularProgress, Alert, Table, TableBody, TableRow, TableCell, TableHead } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { computeStrainTensor, computePiezoAccelerometer } from '../api/client';

function PiezoAccelerometer() {
  const [params, setParams] = useState({
    t: 0.5e-3, L: 38.1e-3, W: 12.7e-3, delta_t_ratio: 1e-6,
    d33: 298.8e-12, s33E: 12.5e-12, epsilon33: 11.95e-9,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await computePiezoAccelerometer(params);
      setResult(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const update = (key, val) => setParams((p) => ({ ...p, [key]: parseFloat(val) || 0 }));

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Piezoelectric Accelerometer (Section 4.4.2)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Computes charge Q, capacitance C, and voltage V for a piezoelectric layer under compression.
          Book expected: Q = 1.1157 x 10^-8 C, C = 1.156 x 10^-8 F, V = 1 V.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField label="Thickness t (m)" size="small" value={params.t} onChange={(e) => update('t', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
          <TextField label="Length L (m)" size="small" value={params.L} onChange={(e) => update('L', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
          <TextField label="Width W (m)" size="small" value={params.W} onChange={(e) => update('W', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
          <TextField label="delta_t/t" size="small" value={params.delta_t_ratio} onChange={(e) => update('delta_t_ratio', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
          <TextField label="d33 (C/N)" size="small" value={params.d33} onChange={(e) => update('d33', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
          <TextField label="s33E (m^2/N)" size="small" value={params.s33E} onChange={(e) => update('s33E', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
          <TextField label="epsilon33 (F/m)" size="small" value={params.epsilon33} onChange={(e) => update('epsilon33', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
        </Box>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>
          {loading ? 'Computing...' : 'Calculate'}
        </Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Table size="small" sx={{ maxWidth: 500 }}>
              <TableHead>
                <TableRow><TableCell>Quantity</TableCell><TableCell>Value</TableCell><TableCell>Unit</TableCell></TableRow>
              </TableHead>
              <TableBody>
                <TableRow><TableCell>Charge Q</TableCell><TableCell>{result.charge_Q.toExponential(4)}</TableCell><TableCell>C</TableCell></TableRow>
                <TableRow><TableCell>Capacitance C</TableCell><TableCell>{result.capacitance_C.toExponential(4)}</TableCell><TableCell>F</TableCell></TableRow>
                <TableRow><TableCell>Voltage V</TableCell><TableCell>{result.voltage_V.toFixed(4)}</TableCell><TableCell>V</TableCell></TableRow>
                <TableRow><TableCell>Force F</TableCell><TableCell>{result.force_F.toFixed(4)}</TableCell><TableCell>N</TableCell></TableRow>
              </TableBody>
            </Table>

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Strain Tensor S</Typography>
            <Typography variant="body2" color="text.secondary">[{result.strain_tensor_S.join(', ')}]</Typography>

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Polarization Vector D</Typography>
            <Typography variant="body2" color="text.secondary">[{result.polarization_vector_D.map((v) => v.toExponential(4)).join(', ')}]</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function StrainTensor() {
  const [params, setParams] = useState({ du1_dx1: 0.01, du1_dx2: 0.005, du2_dx1: 0.003, du2_dx2: 0.02 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await computeStrainTensor(params);
      setResult(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const update = (key, val) => setParams((p) => ({ ...p, [key]: parseFloat(val) || 0 }));

  const shapeToData = (shape) => shape.map(([x, y]) => ({ x, y }));

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Strain Tensor Calculator (Section 4.4.1)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Computes the 2D strain tensor eij from displacement gradients, decomposes into
          symmetric Sij (strain) + antisymmetric Aij (rotation).
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField label="du1/dx1" size="small" type="number" value={params.du1_dx1} onChange={(e) => update('du1_dx1', e.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.001 } }} sx={{ width: 150 }} />
          <TextField label="du1/dx2" size="small" type="number" value={params.du1_dx2} onChange={(e) => update('du1_dx2', e.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.001 } }} sx={{ width: 150 }} />
          <TextField label="du2/dx1" size="small" type="number" value={params.du2_dx1} onChange={(e) => update('du2_dx1', e.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.001 } }} sx={{ width: 150 }} />
          <TextField label="du2/dx2" size="small" type="number" value={params.du2_dx2} onChange={(e) => update('du2_dx2', e.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.001 } }} sx={{ width: 150 }} />
        </Box>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>
          {loading ? 'Computing...' : 'Calculate'}
        </Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">eij Tensor</Typography>
                <Table size="small" sx={{ mb: 2 }}>
                  <TableBody>
                    {result.eij.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((val, j) => <TableCell key={j}>{val.toFixed(6)}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Typography variant="subtitle2">Symmetric Sij (Strain)</Typography>
                <Table size="small" sx={{ mb: 2 }}>
                  <TableBody>
                    {result.symmetric_Sij.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((val, j) => <TableCell key={j}>{val.toFixed(6)}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Typography variant="subtitle2">Antisymmetric Aij (Rotation)</Typography>
                <Table size="small">
                  <TableBody>
                    {result.antisymmetric_Aij.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((val, j) => <TableCell key={j}>{val.toFixed(6)}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Deformation Visualization</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="x" type="number" domain={[-0.05, 1.1]} />
                    <YAxis dataKey="y" type="number" domain={[-0.05, 1.1]} />
                    <Tooltip />
                    <Line data={shapeToData(result.original_shape)} dataKey="y" stroke="#666" name="Original" dot={false} strokeWidth={2} />
                    <Line data={shapeToData(result.deformed_shape)} dataKey="y" stroke="#64b5f6" name="Deformed" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function Chapter4() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Chapter 4: Smart Materials</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Piezoelectric materials, strain tensor analysis, and thermodynamic couplings in active materials.
      </Typography>
      <PiezoAccelerometer />
      <StrainTensor />
    </Box>
  );
}
