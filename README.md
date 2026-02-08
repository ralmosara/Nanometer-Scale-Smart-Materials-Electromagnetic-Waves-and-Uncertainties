# Nanometer Scale Smart Materials - Simulation Platform

Scientific simulation/calculator platform based on "Applications and Metrology at Nanometer Scale, Volume 1: Smart Materials, Electromagnetic Waves and Uncertainties" by Pierre-Richard Dahoo, Philippe Pougnet & Abdelkhalak El Hami.

## Tech Stack

- **Backend**: Flask (Python) with NumPy/SciPy
- **Frontend**: React.js with Material UI & Recharts
- **Database**: PostgreSQL 16 (Docker)
- **Cache**: Redis 7 (Docker)

## Quick Start

### 1. Start Docker services (PostgreSQL + Redis)

```bash
docker compose up -d
```

### 2. Start Flask backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on http://localhost:5000

### 3. Start React frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Simulation Modules

### Chapter 1: Nanometer Scale
- FTIR/ATR Spectroscopy Simulator (Si-O, Si-C, CO2 peaks)
- Snell's Law & Critical Angle Calculator
- Light Ray Propagation through layered media

### Chapter 2: Statistical Tools
- Monte Carlo Simulation (rod mesh transfer function)
- Polynomial Chaos Expansion (2nd order)
- Linear Oscillator with Uncertainty (Taguchi vs MC)
- Taguchi Design of Experiments (L9 array)
- Principal Component Analysis (PCA)

### Chapter 3: Electromagnetic Waves
- Single Antenna Radiation Pattern
- N-Element Antenna Network (phased array)
- Beam Steering with Delays and Attenuation

### Chapter 4: Smart Materials
- 2D Strain Tensor Calculator (Sij + Aij decomposition)
- Piezoelectric Accelerometer (Q, C, V calculation)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/ch1/ftir` | FTIR/ATR simulation |
| `POST /api/ch1/snell` | Snell's law |
| `POST /api/ch1/light-propagation` | Ray tracing |
| `POST /api/ch2/monte-carlo` | Monte Carlo simulation |
| `POST /api/ch2/polynomial-chaos` | Polynomial chaos |
| `POST /api/ch2/linear-oscillator` | Oscillator uncertainty |
| `POST /api/ch2/taguchi` | Taguchi DOE |
| `POST /api/ch2/pca` | PCA analysis |
| `POST /api/ch3/antenna-radiation` | Single antenna |
| `POST /api/ch3/antenna-network` | Antenna array |
| `POST /api/ch3/beam-steering` | Beam steering |
| `POST /api/ch4/strain-tensor` | Strain tensor |
| `POST /api/ch4/piezo-accelerometer` | Piezo calculator |
| `GET/POST /api/results` | Save/load results |
| `GET/POST /api/parameters` | Save/load parameters |
