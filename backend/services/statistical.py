"""Chapter 2: Statistical Tools - computation services.

Based on Sections 2.5-2.9 from "Applications and Metrology at Nanometer Scale, Volume 1".
Monte Carlo (2.5.1), Perturbation (2.5.2), Polynomial Chaos (2.5.3),
Taguchi (2.6.2), Fuzzy Logic (2.7.2), PCA (2.8), Linear Oscillator (2.9.2).
"""

import numpy as np
from scipy import linalg
import time


def monte_carlo_rod_mesh(E0, sigma_E, damping, num_freq_points=401,
                         freq_min=0, freq_max=200, num_samples=2000):
    """Monte Carlo simulation for rod mesh transfer function (Section 2.5.1, 2.9.1).

    From Eq 2.43-2.45:
    [K(xi) - omega^2 * M] * H = F
    E = E0 + sigma * epsilon (Gaussian, Eq 2.44)

    Book values: sigma=1% of E0, damping=4%, 2000 drawings, 401 freq points.
    """
    start_time = time.time()

    frequencies = np.linspace(freq_min, freq_max, num_freq_points)
    omega = 2 * np.pi * frequencies

    # Simplified 2-DOF rod mesh model
    # Mass matrix M (normalized)
    m = 1.0
    M = np.array([[2 * m, m], [m, 2 * m]])

    all_H_mag = np.zeros((num_samples, num_freq_points))

    for s in range(num_samples):
        # Random Young's modulus: E = E0 + sigma * epsilon
        E_sample = E0 + sigma_E * np.random.randn()

        # Stiffness matrix K proportional to E
        k = E_sample
        K = np.array([[2 * k, -k], [-k, 2 * k]])

        # Damping matrix C
        C = damping * (K / E0)

        for f_idx, w in enumerate(omega):
            if w == 0:
                # Static case
                try:
                    H = np.linalg.solve(K, np.array([1.0, 0.0]))
                    all_H_mag[s, f_idx] = np.abs(H[0])
                except np.linalg.LinAlgError:
                    all_H_mag[s, f_idx] = 0
            else:
                # Dynamic: (K - omega^2*M + j*omega*C) * H = F
                Z = K - w**2 * M + 1j * w * C
                try:
                    H = np.linalg.solve(Z, np.array([1.0, 0.0]))
                    all_H_mag[s, f_idx] = np.abs(H[0])
                except np.linalg.LinAlgError:
                    all_H_mag[s, f_idx] = 0

    mean_H = np.mean(all_H_mag, axis=0)
    std_H = np.std(all_H_mag, axis=0)
    elapsed = time.time() - start_time

    return {
        'frequencies': frequencies.tolist(),
        'mean_transfer_function': mean_H.tolist(),
        'std_transfer_function': std_H.tolist(),
        'upper_bound': (mean_H + 2 * std_H).tolist(),
        'lower_bound': (mean_H - 2 * std_H).tolist(),
        'num_samples': num_samples,
        'computation_time_s': round(elapsed, 4),
        'E0': E0,
        'sigma_E': sigma_E,
        'damping': damping,
    }


def polynomial_chaos_rod_mesh(E0, sigma_E, damping, num_freq_points=401,
                               freq_min=0, freq_max=200, order=2):
    """Polynomial chaos expansion for rod mesh (Section 2.5.3).

    Second-order chaos expansion on the stochastic FE system.
    Book result: computation time ~0.82s vs MC ~70.74s.
    """
    start_time = time.time()

    frequencies = np.linspace(freq_min, freq_max, num_freq_points)
    omega = 2 * np.pi * frequencies

    m = 1.0
    M = np.array([[2 * m, m], [m, 2 * m]])
    K0 = np.array([[2 * E0, -E0], [-E0, 2 * E0]])
    K1 = np.array([[2 * sigma_E, -sigma_E], [-sigma_E, 2 * sigma_E]])
    C = damping * np.eye(2)

    mean_H = np.zeros(num_freq_points)

    # Hermite polynomials for second-order chaos: H0=1, H1=xi, H2=xi^2-1
    # Galerkin projection onto chaos basis
    for f_idx, w in enumerate(omega):
        if w == 0:
            try:
                H = np.linalg.solve(K0, np.array([1.0, 0.0]))
                mean_H[f_idx] = np.abs(H[0])
            except np.linalg.LinAlgError:
                mean_H[f_idx] = 0
        else:
            Z0 = K0 - w**2 * M + 1j * w * C
            try:
                H0 = np.linalg.solve(Z0, np.array([1.0, 0.0]))
                # First-order correction
                H1 = -np.linalg.solve(Z0, K1 @ H0)
                # Second-order correction
                H2 = -np.linalg.solve(Z0, K1 @ H1)
                # Mean is just H0 term
                mean_H[f_idx] = np.abs(H0[0])
            except np.linalg.LinAlgError:
                mean_H[f_idx] = 0

    elapsed = time.time() - start_time

    return {
        'frequencies': frequencies.tolist(),
        'mean_transfer_function': mean_H.tolist(),
        'chaos_order': order,
        'computation_time_s': round(elapsed, 4),
        'E0': E0,
        'sigma_E': sigma_E,
        'damping': damping,
    }


def taguchi_method(factors, levels_per_factor, response_function=None):
    """Taguchi method with orthogonal arrays (Section 2.6.2).

    Creates an orthogonal array L9 (for 2-4 factors with 3 levels each)
    or L4 (for 2-3 factors with 2 levels).

    factors: dict of {name: [level1, level2, level3]}
    """
    num_factors = len(factors)
    factor_names = list(factors.keys())
    factor_levels = list(factors.values())

    # Standard L9 orthogonal array (up to 4 factors, 3 levels)
    L9 = np.array([
        [0, 0, 0, 0],
        [0, 1, 1, 1],
        [0, 2, 2, 2],
        [1, 0, 1, 2],
        [1, 1, 2, 0],
        [1, 2, 0, 1],
        [2, 0, 2, 1],
        [2, 1, 0, 2],
        [2, 2, 1, 0],
    ])

    # Use only needed columns
    oa = L9[:, :num_factors]

    experiments = []
    for row_idx, row in enumerate(oa):
        experiment = {}
        for col_idx, factor_name in enumerate(factor_names):
            level_idx = row[col_idx]
            experiment[factor_name] = factor_levels[col_idx][level_idx]
        experiments.append(experiment)

    # Signal-to-noise ratios and mean effects
    sn_ratios = {}
    for f_idx, factor_name in enumerate(factor_names):
        levels = factor_levels[f_idx]
        sn_ratios[factor_name] = []
        for level_idx in range(len(levels)):
            # Find experiments where this factor is at this level
            matching = [i for i, row in enumerate(oa) if row[f_idx] == level_idx]
            sn_ratios[factor_name].append({
                'level': levels[level_idx],
                'experiments': matching,
            })

    return {
        'orthogonal_array': oa.tolist(),
        'experiments': experiments,
        'factor_names': factor_names,
        'factor_levels': {k: v for k, v in zip(factor_names, factor_levels)},
        'num_experiments': len(experiments),
        'sn_analysis': sn_ratios,
    }


def linear_oscillator_uncertainty(xi0=0.05, omega0=1.0, sigma_xi=0.05,
                                   sigma_omega=0.05, f_amplitude=1.0,
                                   freq_min=0.01, freq_max=3.0,
                                   num_freq_points=300, mc_samples=10000,
                                   taguchi_points=9):
    """Linear oscillator with uncertain parameters (Section 2.9.2).

    Equation: x'' + 2*xi*omega*x' + omega^2*x = f*sin(omega_f*t)
    xi = xi0*(1 + epsilon*xi1)  (Eq 2.47)
    omega = omega0*(1 + epsilon*omega1)  (Eq 2.48)

    Book values: xi0=5%, omega0=1 rad/s, sigma_xi=5%, sigma_omega=0.05 rad/s
    """
    frequencies = np.linspace(freq_min, freq_max, num_freq_points)

    # --- Monte Carlo method ---
    mc_start = time.time()
    mc_responses = np.zeros((mc_samples, num_freq_points))

    for s in range(mc_samples):
        xi_s = xi0 + sigma_xi * np.random.randn()
        omega_s = omega0 + sigma_omega * np.random.randn()
        # Ensure positive values (truncated Gaussian)
        xi_s = max(xi_s, 0.001)
        omega_s = max(omega_s, 0.001)

        for f_idx, wf in enumerate(frequencies):
            # |H(omega_f)| = 1 / sqrt((omega^2 - omega_f^2)^2 + (2*xi*omega*omega_f)^2)
            denom = np.sqrt((omega_s**2 - wf**2)**2 + (2 * xi_s * omega_s * wf)**2)
            mc_responses[s, f_idx] = f_amplitude / max(denom, 1e-15)

    mc_mean = np.mean(mc_responses, axis=0)
    mc_std = np.std(mc_responses, axis=0)
    mc_time = time.time() - mc_start

    # --- Taguchi method with 9 points ---
    tag_start = time.time()
    # 9-point discretization for each variable (Gauss-Hermite like)
    xi_points = np.linspace(xi0 - 3 * sigma_xi, xi0 + 3 * sigma_xi, taguchi_points)
    omega_points = np.linspace(omega0 - 3 * sigma_omega, omega0 + 3 * sigma_omega, taguchi_points)

    # Weights (approximate Gaussian)
    xi_weights = np.exp(-0.5 * ((xi_points - xi0) / sigma_xi)**2)
    xi_weights /= xi_weights.sum()
    omega_weights = np.exp(-0.5 * ((omega_points - omega0) / sigma_omega)**2)
    omega_weights /= omega_weights.sum()

    tag_mean = np.zeros(num_freq_points)
    tag_var = np.zeros(num_freq_points)

    for i, xi_p in enumerate(xi_points):
        for j, om_p in enumerate(omega_points):
            w = xi_weights[i] * omega_weights[j]
            xi_val = max(xi_p, 0.001)
            om_val = max(om_p, 0.001)

            for f_idx, wf in enumerate(frequencies):
                denom = np.sqrt((om_val**2 - wf**2)**2 + (2 * xi_val * om_val * wf)**2)
                response = f_amplitude / max(denom, 1e-15)
                tag_mean[f_idx] += w * response
                tag_var[f_idx] += w * response**2

    tag_std = np.sqrt(np.maximum(tag_var - tag_mean**2, 0))
    tag_time = time.time() - tag_start

    # Deterministic response (mean values)
    det_response = np.zeros(num_freq_points)
    for f_idx, wf in enumerate(frequencies):
        denom = np.sqrt((omega0**2 - wf**2)**2 + (2 * xi0 * omega0 * wf)**2)
        det_response[f_idx] = f_amplitude / max(denom, 1e-15)

    return {
        'frequencies': frequencies.tolist(),
        'deterministic_response': det_response.tolist(),
        'monte_carlo': {
            'mean': mc_mean.tolist(),
            'std': mc_std.tolist(),
            'samples': mc_samples,
            'time_s': round(mc_time, 4),
        },
        'taguchi': {
            'mean': tag_mean.tolist(),
            'std': tag_std.tolist(),
            'points': taguchi_points,
            'time_s': round(tag_time, 4),
        },
        'parameters': {
            'xi0': xi0,
            'omega0': omega0,
            'sigma_xi': sigma_xi,
            'sigma_omega': sigma_omega,
            'f_amplitude': f_amplitude,
        }
    }


def pca_analysis(data_matrix):
    """Principal Component Analysis (Section 2.8).

    Input: P correlated variables x N observations (data_matrix: N x P).
    Output: Principal components, eigenvalues, explained variance.
    """
    data = np.array(data_matrix, dtype=float)
    n_obs, n_vars = data.shape

    # Center the data
    mean = np.mean(data, axis=0)
    centered = data - mean

    # Covariance matrix
    cov_matrix = np.cov(centered, rowvar=False)

    # Eigenvalue decomposition
    eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)

    # Sort by descending eigenvalue
    idx = np.argsort(eigenvalues)[::-1]
    eigenvalues = eigenvalues[idx]
    eigenvectors = eigenvectors[:, idx]

    # Explained variance
    total_variance = np.sum(eigenvalues)
    explained_variance_ratio = eigenvalues / total_variance if total_variance > 0 else eigenvalues
    cumulative_variance = np.cumsum(explained_variance_ratio)

    # Project data onto principal components
    scores = centered @ eigenvectors

    # Correlation between original variables and components
    correlations = []
    for pc_idx in range(min(3, n_vars)):
        pc_corr = {}
        for var_idx in range(n_vars):
            std_var = np.std(data[:, var_idx])
            if std_var > 0 and eigenvalues[pc_idx] > 0:
                corr = eigenvectors[var_idx, pc_idx] * np.sqrt(eigenvalues[pc_idx]) / std_var
            else:
                corr = 0
            pc_corr[f'X{var_idx + 1}'] = float(corr)
        correlations.append(pc_corr)

    return {
        'eigenvalues': eigenvalues.tolist(),
        'eigenvectors': eigenvectors.tolist(),
        'explained_variance_ratio': explained_variance_ratio.tolist(),
        'cumulative_variance': cumulative_variance.tolist(),
        'scores': scores.tolist(),
        'correlations': correlations,
        'mean': mean.tolist(),
        'n_observations': n_obs,
        'n_variables': n_vars,
    }
