import { useState } from 'react';
import { Typography, Box, Card, CardContent, TextField, Button, Grid, CircularProgress, Table, TableBody, TableRow, TableCell, TableHead, Alert } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { computeAntennaRadiation, computeAntennaNetwork, computeBeamSteering } from '../api/client';

function AntennaRadiation() {
  const [length, setLength] = useState(0.015);
  const [freq, setFreq] = useState(1e10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await computeAntennaRadiation({ length_m: length, frequency_hz: freq });
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const chartData = result ? result.theta_deg.map((t, i) => ({
    theta: Math.round(t),
    pattern_dB: result.power_pattern_dB[i],
  })) : [];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Single Antenna Radiation (Section 3.5.2)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Wire antenna radiation pattern. E_ref = j*(l/2)*sin(theta)/r * sqrt(mu0/epsilon0) * I0/sqrt(N).
          Thevenin impedance Z_A = R_A + jX_A.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField label="Antenna Length (m)" size="small" type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
          <TextField label="Frequency (Hz)" size="small" type="number" value={freq} onChange={(e) => setFreq(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 180 }} />
        </Box>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>Calculate</Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Radiation Pattern (dB)</Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="theta" label={{ value: 'Angle (deg)', position: 'bottom' }} />
                    <YAxis label={{ value: 'Power (dB)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line dataKey="pattern_dB" stroke="#81c784" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow><TableCell>Wavelength</TableCell><TableCell>{result.wavelength_m.toFixed(4)} m</TableCell></TableRow>
                    <TableRow><TableCell>R_A</TableCell><TableCell>{result.impedance.R_A_ohms.toFixed(1)} ohm</TableCell></TableRow>
                    <TableRow><TableCell>X_A</TableCell><TableCell>{result.impedance.X_A_ohms.toFixed(1)} ohm</TableCell></TableRow>
                    <TableRow><TableCell>|Z_A|</TableCell><TableCell>{result.impedance.Z_A_magnitude.toFixed(1)} ohm</TableCell></TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function AntennaNetwork() {
  const [N, setN] = useState(8);
  const [wavelength, setWavelength] = useState(0.03);
  const [D, setD] = useState(0.015);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await computeAntennaNetwork({ N, wavelength_m: wavelength, D_m: D });
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const chartData = result ? result.theta_deg.map((t, i) => ({
    theta: t.toFixed(1),
    power_dB: result.power_pattern_dB[i],
  })) : [];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>N-Element Antenna Network (Section 3.6.2)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Book: N=8 equidistant antennas, lambda=0.03m, spacing D=lambda/2.
          Array factor: sin(pi*N*(D/lambda)*sin(theta)) / sin(pi*(D/lambda)*sin(theta)).
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField label="N (antennas)" size="small" type="number" value={N} onChange={(e) => setN(parseInt(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 140 }} />
          <TextField label="Wavelength (m)" size="small" type="number" value={wavelength} onChange={(e) => setWavelength(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
          <TextField label="Spacing D (m)" size="small" type="number" value={D} onChange={(e) => setD(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
        </Box>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>Calculate</Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>D/lambda = {result.D_over_lambda.toFixed(3)}</Alert>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>|E*(theta)|^2 Radiation Diagram</Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="theta" label={{ value: 'Angle theta (deg)', position: 'bottom' }} />
                <YAxis label={{ value: 'Power (dB)', angle: -90, position: 'insideLeft' }} domain={[-40, 0]} />
                <Tooltip />
                <Line dataKey="power_dB" stroke="#64b5f6" dot={false} strokeWidth={2} name="|E|^2 (dB)" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function BeamSteering() {
  const [N, setN] = useState(8);
  const [wavelength, setWavelength] = useState(0.03);
  const [D, setD] = useState(0.015);
  const [tau, setTau] = useState(1e-14);
  const [attenuation, setAttenuation] = useState(0.95);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await computeBeamSteering({ N, wavelength_m: wavelength, D_m: D, tau_s: tau, attenuation });
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const chartData = result ? result.theta_deg.map((t, i) => ({
    theta: t.toFixed(1),
    steered: result.steered_pattern[i],
    unsteered: result.unsteered_pattern[i],
  })) : [];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Beam Steering (Section 3.6.2, Q2-3)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Delays tau on supply lines: 0, tau, 2*tau, ..., (N-1)*tau.
          Book defaults: tau = 1e-14 s, attenuation a = 0.95.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField label="N" size="small" type="number" value={N} onChange={(e) => setN(parseInt(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 100 }} />
          <TextField label="Wavelength (m)" size="small" type="number" value={wavelength} onChange={(e) => setWavelength(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
          <TextField label="D (m)" size="small" type="number" value={D} onChange={(e) => setD(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 140 }} />
          <TextField label="Delay tau (s)" size="small" type="number" value={tau} onChange={(e) => setTau(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
          <TextField label="Attenuation a" size="small" type="number" value={attenuation} onChange={(e) => setAttenuation(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.01 } }} sx={{ width: 140 }} />
        </Box>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>Calculate</Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            {result.steering_angle_deg !== null && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Steering angle: {result.steering_angle_deg.toFixed(2)} deg | Phase shift/element: {result.phase_shift_per_element_rad.toFixed(4)} rad
              </Alert>
            )}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Steered vs Unsteered Pattern</Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="theta" label={{ value: 'Angle (deg)', position: 'bottom' }} />
                <YAxis label={{ value: 'Normalized |E|', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line dataKey="unsteered" stroke="#666" dot={false} strokeWidth={1.5} name="Unsteered" />
                <Line dataKey="steered" stroke="#81c784" dot={false} strokeWidth={2} name="Steered (with delay)" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function Chapter3() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Chapter 3: Electromagnetic Waves</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        EM wave applications: antenna radiation, phased array networks, beam steering, and 5G analysis.
      </Typography>
      <AntennaRadiation />
      <AntennaNetwork />
      <BeamSteering />
    </Box>
  );
}
