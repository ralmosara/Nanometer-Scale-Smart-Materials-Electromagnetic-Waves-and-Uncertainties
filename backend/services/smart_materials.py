"""Chapter 4: Smart Materials - computation services.

Based on Sections 4.4.1 (Strain Tensor) and 4.4.2 (Piezoelectric Accelerometer)
from "Applications and Metrology at Nanometer Scale, Volume 1".
"""

import numpy as np


def compute_strain_tensor(du1_dx1, du1_dx2, du2_dx1, du2_dx2):
    """Compute strain tensor eij and decompose into symmetric Sij + antisymmetric Aij.

    From Section 4.4.1:
    e11 = du1/dx1, e12 = du1/dx2, e21 = du2/dx1, e22 = du2/dx2
    Sij = 1/2 (eij + eji)  -- strain (symmetric part)
    Aij = 1/2 (eij - eji)  -- rotation (antisymmetric part)
    """
    eij = np.array([
        [du1_dx1, du1_dx2],
        [du2_dx1, du2_dx2]
    ])

    sij = 0.5 * (eij + eij.T)
    aij = 0.5 * (eij - eij.T)

    # Deformed shape: unit square ABCD -> rhomboid
    # Original square corners
    original = np.array([
        [0, 0], [1, 0], [1, 1], [0, 1], [0, 0]
    ], dtype=float)

    # Deformed corners: each point (x1, x2) moves by (u1, u2)
    # u1(x1,x2) = e11*x1 + e12*x2, u2(x1,x2) = e21*x1 + e22*x2
    deformed = []
    for pt in original:
        x1, x2 = pt
        u1 = du1_dx1 * x1 + du1_dx2 * x2
        u2 = du2_dx1 * x1 + du2_dx2 * x2
        deformed.append([x1 + u1, x2 + u2])
    deformed = np.array(deformed)

    return {
        'eij': eij.tolist(),
        'symmetric_Sij': sij.tolist(),
        'antisymmetric_Aij': aij.tolist(),
        'interpretation': {
            'S11_elongation_x1': float(sij[0, 0]),
            'S22_elongation_x2': float(sij[1, 1]),
            'S12_shear': float(sij[0, 1]),
            'A12_rotation': float(aij[0, 1]),
        },
        'original_shape': original.tolist(),
        'deformed_shape': deformed.tolist(),
    }


def compute_piezo_accelerometer(t, L, W, delta_t_ratio, d33, s33E, epsilon33):
    """Piezoelectric accelerometer calculator from Section 4.4.2.

    Default values from the book:
    t = 0.5e-3 m, L = 38.1e-3 m, W = 12.7e-3 m, delta_t/t = 1e-6
    d33 = 298.8e-12 C/N, s33E = 12.5e-12 m^2/N, epsilon33 = 11.95e-9 F/m

    Formulas:
    Q = d33 * L * W * (delta_t/t) / s33E
    C = epsilon33 * L * W / t
    V = Q / C

    Strain tensor S = [0, 0, delta_t/t, 0, 0, 0]^T
    Stress tensor T = [0, 0, F/(L*W), 0, 0, 0]^T
    Polarization D = [0, 0, Q/(L*W)]^T
    """
    delta_t = delta_t_ratio * t

    # Charge Q = d33 * L * W * (delta_t/t) / s33E
    Q = d33 * L * W * delta_t_ratio / s33E

    # Capacitance C = epsilon33 * L * W / t
    C = epsilon33 * L * W / t

    # Voltage V = Q / C
    V = Q / C

    # Force F from S3 = s33E * T3 + d33 * E3, with E3=0
    # T3 = S3 / s33E = (delta_t/t) / s33E
    T3 = delta_t_ratio / s33E
    F = T3 * L * W

    # Tensors
    strain_S = [0, 0, float(delta_t_ratio), 0, 0, 0]
    stress_T = [0, 0, float(T3), 0, 0, 0]
    polarization_D = [0, 0, float(Q / (L * W))]

    return {
        'charge_Q': float(Q),
        'capacitance_C': float(C),
        'voltage_V': float(V),
        'force_F': float(F),
        'delta_t': float(delta_t),
        'strain_tensor_S': strain_S,
        'stress_tensor_T': stress_T,
        'polarization_vector_D': polarization_D,
        'units': {
            'Q': 'C (Coulombs)',
            'C': 'F (Farads)',
            'V': 'V (Volts)',
            'F': 'N (Newtons)',
        }
    }
