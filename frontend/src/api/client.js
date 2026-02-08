import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Chapter 1: Nanometer Scale
export const simulateFTIR = (params) => api.post('/ch1/ftir', params);
export const calculateSnell = (params) => api.post('/ch1/snell', params);
export const simulateLightPropagation = (params) => api.post('/ch1/light-propagation', params);

// Chapter 2: Statistical Tools
export const runMonteCarlo = (params) => api.post('/ch2/monte-carlo', params);
export const runPolynomialChaos = (params) => api.post('/ch2/polynomial-chaos', params);
export const runTaguchi = (params) => api.post('/ch2/taguchi', params);
export const runLinearOscillator = (params) => api.post('/ch2/linear-oscillator', params);
export const runPCA = (params) => api.post('/ch2/pca', params);

// Chapter 3: Electromagnetic Waves
export const computeAntennaRadiation = (params) => api.post('/ch3/antenna-radiation', params);
export const computeAntennaNetwork = (params) => api.post('/ch3/antenna-network', params);
export const computeBeamSteering = (params) => api.post('/ch3/beam-steering', params);

// Chapter 4: Smart Materials
export const computeStrainTensor = (params) => api.post('/ch4/strain-tensor', params);
export const computePiezoAccelerometer = (params) => api.post('/ch4/piezo-accelerometer', params);

// Common
export const getResults = (params) => api.get('/results', { params });
export const saveResult = (data) => api.post('/results', data);
export const deleteResult = (id) => api.delete(`/results/${id}`);
export const getParameters = (params) => api.get('/parameters', { params });
export const saveParameters = (data) => api.post('/parameters', data);

export default api;
