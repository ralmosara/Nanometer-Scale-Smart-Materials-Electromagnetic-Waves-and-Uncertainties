"""Chapter 1: Nanometer Scale - computation services.

Based on FTIR/ATR spectroscopy (Figures 1.19-1.25), Snell's law,
and light ray propagation from the textbook.
"""

import numpy as np


# Predefined crystal refractive indices from the book (page 35)
CRYSTAL_DATA = {
    'ZnSe': {'n': 2.4, 'range': [600, 4000]},
    'KRS-5': {'n': 2.4, 'range': [600, 4000]},
    'Ge': {'n': 4.0, 'range': [600, 4000]},
}

# ATR incidence angle options (page 35)
ATR_ANGLES = [30, 45, 60]


def compute_ftir_atr(n1, n2, angle_deg, wavenumber_min=600, wavenumber_max=4000, num_points=500):
    """FTIR/ATR spectroscopy simulation.

    From the book: sin(theta_c) = n2/n1
    Penetration depth dp = lambda / (2*pi * sqrt(n1^2 * sin^2(theta) - n2^2))

    Simulates absorption spectra with Si-O peaks (~1008, 1082 cm^-1),
    Si-C peaks (~784, 864, 1258 cm^-1), and CO2 region (2280-2400 cm^-1).
    """
    angle_rad = np.radians(angle_deg)

    # Critical angle
    if n2 / n1 <= 1:
        theta_c = np.degrees(np.arcsin(n2 / n1))
    else:
        theta_c = None  # No total internal reflection

    total_reflection = theta_c is not None and angle_deg > theta_c

    # Wavenumber array (cm^-1)
    wavenumbers = np.linspace(wavenumber_min, wavenumber_max, num_points)

    # Penetration depth at each wavenumber
    wavelengths_cm = 1.0 / wavenumbers  # cm
    sin2_term = n1**2 * np.sin(angle_rad)**2 - n2**2

    penetration_depth = np.where(
        sin2_term > 0,
        wavelengths_cm / (2 * np.pi * np.sqrt(np.maximum(sin2_term, 1e-10))),
        0
    )

    # Simulated absorption spectrum based on book's described peaks
    # Si-O vibrations: ~1008, 1082 cm^-1 (Section 1.3.3)
    # Si-C vibrations: ~784, 864, 1258 cm^-1
    # CO2 trapped in polymer: 2280-2400 cm^-1
    absorption = np.zeros_like(wavenumbers)

    # Si-O peaks
    absorption += 0.8 * np.exp(-((wavenumbers - 1008)**2) / (2 * 20**2))
    absorption += 0.9 * np.exp(-((wavenumbers - 1082)**2) / (2 * 25**2))

    # Si-C peaks
    absorption += 0.95 * np.exp(-((wavenumbers - 784)**2) / (2 * 15**2))
    absorption += 0.5 * np.exp(-((wavenumbers - 864)**2) / (2 * 18**2))
    absorption += 0.7 * np.exp(-((wavenumbers - 1258)**2) / (2 * 20**2))

    # CO2 region
    absorption += 0.3 * np.exp(-((wavenumbers - 2340)**2) / (2 * 30**2))

    # Scale by penetration depth effect
    if total_reflection:
        effective_absorption = absorption * (penetration_depth / np.max(penetration_depth))
    else:
        effective_absorption = absorption * 0.5

    return {
        'critical_angle_deg': float(theta_c) if theta_c else None,
        'total_reflection': total_reflection,
        'n1': n1,
        'n2': n2,
        'incidence_angle_deg': angle_deg,
        'wavenumbers': wavenumbers.tolist(),
        'absorption': effective_absorption.tolist(),
        'penetration_depth_cm': penetration_depth.tolist(),
        'peaks': {
            'Si_O': [1008, 1082],
            'Si_C': [784, 864, 1258],
            'CO2': [2340],
        }
    }


def compute_snell_law(n1, n2, angle_deg):
    """Snell's law: n1*sin(theta1) = n2*sin(theta2).

    Critical angle: sin(theta_c) = n2/n1 (when n1 > n2).
    """
    angle_rad = np.radians(angle_deg)
    sin_theta2 = n1 * np.sin(angle_rad) / n2

    if n1 > n2:
        theta_c = np.degrees(np.arcsin(n2 / n1))
    else:
        theta_c = None

    if abs(sin_theta2) <= 1:
        theta2 = np.degrees(np.arcsin(sin_theta2))
        total_reflection = False
    else:
        theta2 = None
        total_reflection = True

    # Fresnel coefficients (for visualization)
    cos_theta1 = np.cos(angle_rad)
    if not total_reflection:
        cos_theta2 = np.cos(np.radians(theta2))
        # s-polarization (TE)
        rs = (n1 * cos_theta1 - n2 * cos_theta2) / (n1 * cos_theta1 + n2 * cos_theta2)
        # p-polarization (TM)
        rp = (n2 * cos_theta1 - n1 * cos_theta2) / (n2 * cos_theta1 + n1 * cos_theta2)
        reflectance_s = float(rs**2)
        reflectance_p = float(rp**2)
    else:
        reflectance_s = 1.0
        reflectance_p = 1.0

    return {
        'n1': n1,
        'n2': n2,
        'incidence_angle_deg': angle_deg,
        'refracted_angle_deg': float(theta2) if theta2 is not None else None,
        'critical_angle_deg': float(theta_c) if theta_c is not None else None,
        'total_reflection': total_reflection,
        'reflectance_s': reflectance_s,
        'reflectance_p': reflectance_p,
    }


def compute_light_propagation(layers, angle_deg, wavelength_nm=550):
    """Ray tracing through layered media.

    layers: list of dicts with 'n' (refractive index) and 'thickness' (nm).
    Applies Snell's law at each interface.
    """
    angle_rad = np.radians(angle_deg)
    ray_path = []
    current_angle = angle_rad
    y_pos = 0.0

    for i, layer in enumerate(layers):
        n_current = layer['n']
        thickness = layer['thickness']

        # Horizontal displacement in this layer
        if np.cos(current_angle) > 1e-10:
            dx = thickness * np.tan(current_angle)
        else:
            dx = 0

        ray_path.append({
            'layer': i,
            'n': n_current,
            'entry_angle_deg': float(np.degrees(current_angle)),
            'x_start': float(dx) if i > 0 else 0,
            'y_start': float(y_pos),
            'y_end': float(y_pos + thickness),
            'x_displacement': float(dx),
        })

        y_pos += thickness

        # Refraction at next interface
        if i < len(layers) - 1:
            n_next = layers[i + 1]['n']
            sin_next = n_current * np.sin(current_angle) / n_next
            if abs(sin_next) <= 1:
                current_angle = np.arcsin(sin_next)
            else:
                # Total internal reflection
                ray_path[-1]['total_reflection'] = True
                break

    return {
        'ray_path': ray_path,
        'initial_angle_deg': angle_deg,
        'wavelength_nm': wavelength_nm,
        'num_layers': len(layers),
    }
