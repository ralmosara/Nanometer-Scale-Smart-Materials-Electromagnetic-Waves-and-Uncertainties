from flask import Blueprint, request, jsonify
from services.statistical import (
    monte_carlo_rod_mesh,
    polynomial_chaos_rod_mesh,
    taguchi_method,
    linear_oscillator_uncertainty,
    pca_analysis,
)

bp = Blueprint('chapter2', __name__, url_prefix='/api/ch2')


@bp.route('/monte-carlo', methods=['POST'])
def monte_carlo():
    """Monte Carlo simulation for rod mesh (Section 2.5.1, 2.9.1).

    Book: E0 with sigma=1%, damping=4%, 2000 drawings, 401 freq points.
    """
    data = request.get_json()
    E0 = data.get('E0', 2.1e11)             # Young's modulus (Pa), steel
    sigma_E = data.get('sigma_E', 2.1e9)     # 1% of E0
    damping = data.get('damping', 0.04)       # 4%
    num_samples = data.get('num_samples', 2000)
    num_freq = data.get('num_freq_points', 401)
    freq_max = data.get('freq_max', 200)

    result = monte_carlo_rod_mesh(E0, sigma_E, damping, num_freq, 0, freq_max, num_samples)
    return jsonify(result)


@bp.route('/polynomial-chaos', methods=['POST'])
def polynomial_chaos():
    """Polynomial chaos expansion for rod mesh (Section 2.5.3).

    Second-order chaos, ~0.82s vs MC ~70.74s.
    """
    data = request.get_json()
    E0 = data.get('E0', 2.1e11)
    sigma_E = data.get('sigma_E', 2.1e9)
    damping = data.get('damping', 0.04)
    num_freq = data.get('num_freq_points', 401)
    freq_max = data.get('freq_max', 200)
    order = data.get('order', 2)

    result = polynomial_chaos_rod_mesh(E0, sigma_E, damping, num_freq, 0, freq_max, order)
    return jsonify(result)


@bp.route('/taguchi', methods=['POST'])
def taguchi():
    """Taguchi design of experiments (Section 2.6.2).

    L9 orthogonal array with 3 levels per factor.
    """
    data = request.get_json()
    factors = data.get('factors', {
        'E_modulus': [2.0e11, 2.1e11, 2.2e11],
        'damping': [0.02, 0.04, 0.06],
        'density': [7700, 7850, 8000],
    })

    result = taguchi_method(factors)
    return jsonify(result)


@bp.route('/linear-oscillator', methods=['POST'])
def linear_oscillator():
    """Linear oscillator with uncertainty (Section 2.9.2, Eq 2.46-2.48).

    Book: xi0=5%, omega0=1 rad/s, sigma_xi=5%, sigma_omega=0.05 rad/s.
    Taguchi 9 points vs MC 10,000 simulations.
    """
    data = request.get_json()
    xi0 = data.get('xi0', 0.05)
    omega0 = data.get('omega0', 1.0)
    sigma_xi = data.get('sigma_xi', 0.05)
    sigma_omega = data.get('sigma_omega', 0.05)
    f_amplitude = data.get('f_amplitude', 1.0)
    mc_samples = data.get('mc_samples', 10000)
    taguchi_points = data.get('taguchi_points', 9)

    result = linear_oscillator_uncertainty(
        xi0, omega0, sigma_xi, sigma_omega, f_amplitude,
        mc_samples=mc_samples, taguchi_points=taguchi_points
    )
    return jsonify(result)


@bp.route('/pca', methods=['POST'])
def pca():
    """Principal Component Analysis (Section 2.8).

    Input: data matrix (N observations x P variables).
    """
    data = request.get_json()
    data_matrix = data.get('data_matrix')

    if not data_matrix or len(data_matrix) < 2:
        return jsonify({'error': 'data_matrix must have at least 2 observations'}), 400

    result = pca_analysis(data_matrix)
    return jsonify(result)
