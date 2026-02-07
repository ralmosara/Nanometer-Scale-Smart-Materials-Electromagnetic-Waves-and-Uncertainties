from flask import Blueprint, request, jsonify
from services.electromagnetic import (
    compute_single_antenna_radiation,
    compute_antenna_network,
    compute_beam_steering,
)

bp = Blueprint('chapter3', __name__, url_prefix='/api/ch3')


@bp.route('/antenna-radiation', methods=['POST'])
def antenna_radiation():
    """Single wire antenna radiation pattern (Section 3.5.2).

    E_ref = j*(l/2)*sin(theta)/r * sqrt(mu0/epsilon0) * I0/sqrt(N)
    """
    data = request.get_json()
    length = data.get('length_m', 0.015)       # Half-wave dipole at 10 GHz
    frequency = data.get('frequency_hz', 1e10)  # 10 GHz
    I0 = data.get('I0', 1.0)

    result = compute_single_antenna_radiation(length, frequency, I0)
    return jsonify(result)


@bp.route('/antenna-network', methods=['POST'])
def antenna_network():
    """N-element antenna network radiation (Section 3.6.2, Q1).

    Book: N=8 antennas, lambda=0.03m.
    Sum: E1* * sin(pi*N*(D/lambda)*sin(theta)) / sin(pi*(D/lambda)*sin(theta))
    """
    data = request.get_json()
    N = data.get('N', 8)
    wavelength = data.get('wavelength_m', 0.03)
    D = data.get('D_m', wavelength / 2)  # Default: half-wavelength spacing

    result = compute_antenna_network(N, D, wavelength)
    return jsonify(result)


@bp.route('/beam-steering', methods=['POST'])
def beam_steering():
    """Beam steering with delays (Section 3.6.2, Q2-3).

    Book: tau=1e-14 s, attenuation a=0.95.
    Delays: 0, tau, 2*tau, ..., (N-1)*tau.
    """
    data = request.get_json()
    N = data.get('N', 8)
    wavelength = data.get('wavelength_m', 0.03)
    D = data.get('D_m', wavelength / 2)
    tau = data.get('tau_s', 1e-14)
    attenuation = data.get('attenuation', 0.95)

    result = compute_beam_steering(N, D, wavelength, tau, attenuation)
    return jsonify(result)
