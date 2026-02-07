"""Chapter 3: Electromagnetic Waves - computation services.

Based on Section 3.5.2 (Wire Antenna Radiation) and Section 3.6.2
(Antenna Network Radiation, Beam Steering) from the textbook.
"""

import numpy as np

# Physical constants
MU_0 = 4 * np.pi * 1e-7      # Permeability of free space (H/m)
EPSILON_0 = 8.854187817e-12   # Permittivity of free space (F/m)
C_LIGHT = 299792458           # Speed of light (m/s)


def compute_single_antenna_radiation(length_m, frequency_hz, I0=1.0, num_points=360):
    """Single wire antenna radiation pattern.

    From Section 3.5.2:
    E_ref = j * (l/2) * sin(theta) / r * sqrt(mu0/epsilon0) * I0/sqrt(N)

    Poynting vector S(r,t) = E(r,t) x H(r,t)
    Thevenin impedance Z_A = R_A + jX_A
    """
    wavelength = C_LIGHT / frequency_hz
    k = 2 * np.pi / wavelength

    theta = np.linspace(0, 2 * np.pi, num_points)
    impedance_ratio = np.sqrt(MU_0 / EPSILON_0)  # ~377 ohms

    # Radiation pattern for half-wave dipole
    # E(theta) proportional to cos(pi/2 * cos(theta)) / sin(theta)
    sin_theta = np.sin(theta)
    cos_theta = np.cos(theta)

    # Avoid division by zero
    with np.errstate(divide='ignore', invalid='ignore'):
        pattern = np.where(
            np.abs(sin_theta) > 1e-10,
            np.cos(k * length_m / 2 * cos_theta) / np.abs(sin_theta),
            0
        )

    # Normalize
    pattern = np.abs(pattern)
    if np.max(pattern) > 0:
        pattern = pattern / np.max(pattern)

    # Power pattern |E|^2
    power_pattern = pattern ** 2

    # Radiation resistance approximation for half-wave dipole
    R_A = 73.0 if abs(length_m - wavelength / 2) < wavelength * 0.1 else 20 * (k * length_m) ** 2
    X_A = 42.5 if abs(length_m - wavelength / 2) < wavelength * 0.1 else 0

    return {
        'theta_deg': np.degrees(theta).tolist(),
        'pattern': pattern.tolist(),
        'power_pattern_dB': (10 * np.log10(np.maximum(power_pattern, 1e-10))).tolist(),
        'wavelength_m': float(wavelength),
        'impedance': {
            'R_A_ohms': float(R_A),
            'X_A_ohms': float(X_A),
            'Z_A_magnitude': float(np.sqrt(R_A**2 + X_A**2)),
        },
        'impedance_free_space': float(impedance_ratio),
    }


def compute_antenna_network(N, D, wavelength, num_points=361):
    """N-element antenna network radiation pattern.

    From Section 3.6.2, Question 1:
    E_i* = E1* * exp(-j*2*pi*(i-1)*(D/lambda)*sin(theta))

    Sum: Sigma E_i* = E1* * sin(pi*N*(D/lambda)*sin(theta)) / sin(pi*(D/lambda)*sin(theta))

    Default from book: N=8, lambda=0.03m
    """
    theta = np.linspace(-np.pi / 2, np.pi / 2, num_points)
    theta_deg = np.degrees(theta)

    # Array factor: AF = sin(N*pi*D*sin(theta)/lambda) / sin(pi*D*sin(theta)/lambda)
    psi = np.pi * D * np.sin(theta) / wavelength

    with np.errstate(divide='ignore', invalid='ignore'):
        AF = np.where(
            np.abs(np.sin(psi)) > 1e-10,
            np.sin(N * psi) / np.sin(psi),
            N  # L'Hopital limit
        )

    # Normalized power pattern
    AF_normalized = np.abs(AF) / N
    power_pattern = AF_normalized ** 2

    return {
        'theta_deg': theta_deg.tolist(),
        'array_factor': AF_normalized.tolist(),
        'power_pattern': power_pattern.tolist(),
        'power_pattern_dB': (10 * np.log10(np.maximum(power_pattern, 1e-10))).tolist(),
        'N': N,
        'D_m': D,
        'wavelength_m': wavelength,
        'D_over_lambda': D / wavelength,
    }


def compute_beam_steering(N, D, wavelength, tau, attenuation=1.0, num_points=361):
    """Beam steering with phase delays.

    From Section 3.6.2, Questions 2-3:
    Delays: 0, tau, 2*tau, ..., (N-1)*tau on supply lines
    phi_i = omega * i * tau

    E_tau(theta) includes phase shift from delays.
    With attenuation a = (1-epsilon): each element attenuated by a^i.

    Book defaults: tau = 1e-14 s, a = 0.95
    """
    theta = np.linspace(-np.pi / 2, np.pi / 2, num_points)
    theta_deg = np.degrees(theta)

    omega = 2 * np.pi * C_LIGHT / wavelength
    frequency = C_LIGHT / wavelength

    # Phase shift per element from delay
    delta_phi = omega * tau

    # Steering angle: sin(theta_s) = c * tau / D
    sin_theta_s = C_LIGHT * tau / D
    if abs(sin_theta_s) <= 1:
        theta_steer_deg = float(np.degrees(np.arcsin(sin_theta_s)))
    else:
        theta_steer_deg = None

    # Array factor with steering and attenuation
    AF = np.zeros(num_points, dtype=complex)
    for i in range(N):
        phase = 2 * np.pi * i * D * np.sin(theta) / wavelength - i * delta_phi
        AF += (attenuation ** i) * np.exp(1j * phase)

    AF_mag = np.abs(AF)
    AF_normalized = AF_mag / np.max(AF_mag) if np.max(AF_mag) > 0 else AF_mag
    power_pattern = AF_normalized ** 2

    # Also compute unsteered pattern for comparison
    AF_unsteer = np.zeros(num_points, dtype=complex)
    for i in range(N):
        phase = 2 * np.pi * i * D * np.sin(theta) / wavelength
        AF_unsteer += np.exp(1j * phase)

    AF_unsteer_mag = np.abs(AF_unsteer)
    AF_unsteer_norm = AF_unsteer_mag / np.max(AF_unsteer_mag) if np.max(AF_unsteer_mag) > 0 else AF_unsteer_mag

    return {
        'theta_deg': theta_deg.tolist(),
        'steered_pattern': AF_normalized.tolist(),
        'steered_power_dB': (10 * np.log10(np.maximum(power_pattern, 1e-10))).tolist(),
        'unsteered_pattern': AF_unsteer_norm.tolist(),
        'steering_angle_deg': theta_steer_deg,
        'delay_tau_s': tau,
        'attenuation': attenuation,
        'phase_shift_per_element_rad': float(delta_phi),
        'frequency_hz': float(frequency),
        'N': N,
        'D_m': D,
        'wavelength_m': wavelength,
    }
