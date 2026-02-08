import { useState } from 'react';
import { Typography, Box, Card, CardContent, TextField, Button, Grid, CircularProgress, Alert, Table, TableBody, TableRow, TableCell, TableHead } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { runMonteCarlo, runPolynomialChaos, runTaguchi, runLinearOscillator, runPCA } from '../api/client';

function MonteCarloSim() {
  const [E0, setE0] = useState(2.1e11);
  const [sigmaE, setSigmaE] = useState(2.1e9);
  const [damping, setDamping] = useState(0.04);
  const [samples, setSamples] = useState(2000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await runMonteCarlo({ E0, sigma_E: sigmaE, damping, num_samples: samples });
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const chartData = result ? result.frequencies.map((f, i) => ({
    freq: f.toFixed(1),
    mean: result.mean_transfer_function[i],
    upper: result.upper_bound[i],
    lower: result.lower_bound[i],
  })).filter((_, i) => i % 2 === 0) : [];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Monte Carlo Simulation (Section 2.5.1, 2.9.1)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Rod mesh transfer function H(omega) with uncertain Young's modulus E = E0 + sigma*epsilon (Gaussian).
          Book: sigma=1%, damping=4%, 2000 drawings, 401 frequency points.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField label="E0 (Pa)" size="small" type="number" value={E0} onChange={(e) => setE0(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
          <TextField label="sigma_E (Pa)" size="small" type="number" value={sigmaE} onChange={(e) => setSigmaE(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
          <TextField label="Damping" size="small" type="number" value={damping} onChange={(e) => setDamping(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.01 } }} sx={{ width: 120 }} />
          <TextField label="Samples" size="small" type="number" value={samples} onChange={(e) => setSamples(parseInt(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 120 }} />
        </Box>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>
          {loading ? 'Simulating...' : 'Run MC'}
        </Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Computation time: {result.computation_time_s}s | Samples: {result.num_samples}
            </Alert>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Mean |H(omega)| (Figure 2.14)</Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="freq" label={{ value: 'Frequency (Hz)', position: 'bottom' }} />
                <YAxis label={{ value: '|H|', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line dataKey="mean" stroke="#ce93d8" dot={false} strokeWidth={2} name="Mean |H|" />
                <Line dataKey="upper" stroke="#ce93d855" dot={false} strokeWidth={1} name="Mean+2*std" strokeDasharray="5 5" />
                <Line dataKey="lower" stroke="#ce93d855" dot={false} strokeWidth={1} name="Mean-2*std" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function PolynomialChaosSim() {
  const [E0, setE0] = useState(2.1e11);
  const [sigmaE, setSigmaE] = useState(2.1e9);
  const [damping, setDamping] = useState(0.04);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await runPolynomialChaos({ E0, sigma_E: sigmaE, damping });
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const chartData = result ? result.frequencies.map((f, i) => ({
    freq: f.toFixed(1),
    mean: result.mean_transfer_function[i],
  })).filter((_, i) => i % 2 === 0) : [];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Polynomial Chaos Expansion (Section 2.5.3)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Second-order chaos expansion for the rod mesh. Book: ~0.82s vs MC ~70.74s computation time.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField label="E0 (Pa)" size="small" type="number" value={E0} onChange={(e) => setE0(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
          <TextField label="sigma_E (Pa)" size="small" type="number" value={sigmaE} onChange={(e) => setSigmaE(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
          <TextField label="Damping" size="small" type="number" value={damping} onChange={(e) => setDamping(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.01 } }} sx={{ width: 120 }} />
        </Box>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>
          {loading ? 'Computing...' : 'Run Chaos Expansion'}
        </Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Chaos order: {result.chaos_order} | Time: {result.computation_time_s}s
            </Alert>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="freq" />
                <YAxis />
                <Tooltip />
                <Line dataKey="mean" stroke="#4fc3f7" dot={false} strokeWidth={2} name="PC Mean |H|" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function LinearOscillator() {
  const [xi0, setXi0] = useState(0.05);
  const [omega0, setOmega0] = useState(1.0);
  const [sigmaXi, setSigmaXi] = useState(0.05);
  const [sigmaOm, setSigmaOm] = useState(0.05);
  const [mcSamples, setMcSamples] = useState(10000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await runLinearOscillator({ xi0, omega0, sigma_xi: sigmaXi, sigma_omega: sigmaOm, mc_samples: mcSamples });
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const chartData = result ? result.frequencies.map((f, i) => ({
    freq: f.toFixed(3),
    deterministic: result.deterministic_response[i],
    mc_std: result.monte_carlo.std[i],
    taguchi_std: result.taguchi.std[i],
  })).filter((_, i) => i % 2 === 0) : [];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Linear Oscillator with Uncertainty (Section 2.9.2)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          x'' + 2*xi*omega*x' + omega^2*x = f*sin(omega_f*t). Book: xi0=5%, omega0=1 rad/s.
          Taguchi 9 points vs MC 10,000 simulations (Figure 2.16).
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField label="xi0" size="small" type="number" value={xi0} onChange={(e) => setXi0(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.01 } }} sx={{ width: 120 }} />
          <TextField label="omega0 (rad/s)" size="small" type="number" value={omega0} onChange={(e) => setOmega0(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.1 } }} sx={{ width: 150 }} />
          <TextField label="sigma_xi" size="small" type="number" value={sigmaXi} onChange={(e) => setSigmaXi(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.01 } }} sx={{ width: 120 }} />
          <TextField label="sigma_omega" size="small" type="number" value={sigmaOm} onChange={(e) => setSigmaOm(parseFloat(e.target.value))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 0.01 } }} sx={{ width: 140 }} />
          <TextField label="MC Samples" size="small" type="number" value={mcSamples} onChange={(e) => setMcSamples(parseInt(e.target.value))} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 130 }} />
        </Box>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>
          {loading ? 'Simulating...' : 'Run Analysis'}
        </Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              MC time: {result.monte_carlo.time_s}s ({result.monte_carlo.samples} samples) |
              Taguchi time: {result.taguchi.time_s}s ({result.taguchi.points} points)
            </Alert>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Deterministic Response</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="freq" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="deterministic" stroke="#ffb74d" dot={false} strokeWidth={2} name="|H| Deterministic" />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Std Dev Comparison (Figure 2.16)</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="freq" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line dataKey="mc_std" stroke="#ce93d8" dot={false} strokeWidth={2} name="MC Std Dev" />
                    <Line dataKey="taguchi_std" stroke="#81c784" dot={false} strokeWidth={2} name="Taguchi Std Dev" />
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

function TaguchiMethod() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await runTaguchi({
        factors: {
          E_modulus: [2.0e11, 2.1e11, 2.2e11],
          damping: [0.02, 0.04, 0.06],
          density: [7700, 7850, 8000],
        },
      });
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Taguchi Design of Experiments (Section 2.6.2)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          L9 orthogonal array with 3 levels per factor. Reduces experimental runs
          from 27 (full factorial) to 9 experiments.
        </Typography>

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>
          Generate L9 Array
        </Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {result.num_experiments} experiments (vs {Math.pow(3, result.factor_names.length)} full factorial)
            </Alert>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  {result.factor_names.map((f) => <TableCell key={f}>{f}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {result.experiments.map((exp, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    {result.factor_names.map((f) => (
                      <TableCell key={f}>{typeof exp[f] === 'number' && exp[f] > 1000 ? exp[f].toExponential(2) : exp[f]}</TableCell>
                    ))}
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

function PCAAnalysis() {
  const [dataText, setDataText] = useState('1,2,3\n4,5,6\n7,8,9\n2,4,6\n3,5,7\n5,3,1\n8,6,4\n6,7,8');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const matrix = dataText.trim().split('\n').map((row) => row.split(',').map(Number));
      const { data } = await runPCA({ data_matrix: matrix });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
    setLoading(false);
  };

  const scatterData = result ? result.scores.map((row, i) => ({
    pc1: row[0],
    pc2: row.length > 1 ? row[1] : 0,
    name: `Obs ${i + 1}`,
  })) : [];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Principal Component Analysis (Section 2.8)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Reduces P correlated variables to uncorrelated principal components.
          Enter data as CSV rows (N observations x P variables).
        </Typography>

        <TextField
          label="Data Matrix (CSV)"
          multiline
          rows={5}
          fullWidth
          value={dataText}
          onChange={(e) => setDataText(e.target.value)}
          sx={{ mb: 2, fontFamily: 'monospace' }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />} onClick={run} disabled={loading}>
          Run PCA
        </Button>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {result && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Explained Variance</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.explained_variance_ratio.map((v, i) => ({
                    component: `PC${i + 1}`,
                    variance: (v * 100).toFixed(1),
                    cumulative: (result.cumulative_variance[i] * 100).toFixed(1),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="component" />
                    <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="variance" fill="#64b5f6" name="Individual %" />
                    <Bar dataKey="cumulative" fill="#ce93d844" name="Cumulative %" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Scores (PC1 vs PC2)</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="pc1" name="PC1" />
                    <YAxis dataKey="pc2" name="PC2" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={scatterData} fill="#ce93d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Eigenvalues</Typography>
            <Typography variant="body2" color="text.secondary">
              [{result.eigenvalues.map((v) => v.toFixed(4)).join(', ')}]
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function Chapter2() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Chapter 2: Statistical Tools</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Methods to reduce design uncertainties: Monte Carlo, polynomial chaos, Taguchi,
        linear oscillator analysis, and PCA.
      </Typography>
      <MonteCarloSim />
      <PolynomialChaosSim />
      <LinearOscillator />
      <TaguchiMethod />
      <PCAAnalysis />
    </Box>
  );
}
