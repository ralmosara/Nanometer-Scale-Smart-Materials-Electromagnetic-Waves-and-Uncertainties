import { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, TextField, CircularProgress, Alert } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function SimulatorCard({ title, description, fields, onRun, children, result, loading, error }) {
  const [params, setParams] = useState(
    Object.fromEntries(fields.map((f) => [f.name, f.default]))
  );

  const handleChange = (name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleRun = () => {
    const parsed = {};
    fields.forEach((f) => {
      parsed[f.name] = f.type === 'number' ? parseFloat(params[f.name]) : params[f.name];
    });
    onRun(parsed);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {fields.map((f) => (
            <TextField
              key={f.name}
              label={f.label}
              type="number"
              size="small"
              value={params[f.name]}
              onChange={(e) => handleChange(f.name, e.target.value)}
              helperText={f.helper}
              sx={{ width: f.width || 180 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          ))}
        </Box>

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={18} /> : <PlayArrowIcon />}
          onClick={handleRun}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'Computing...' : 'Calculate'}
        </Button>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {result && (
          <Box sx={{ mt: 2 }}>
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
