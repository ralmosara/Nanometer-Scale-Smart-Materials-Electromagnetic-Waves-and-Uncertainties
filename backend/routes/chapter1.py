from flask import Blueprint, request, jsonify
from services.nanometer import compute_ftir_atr, compute_snell_law, compute_light_propagation

bp = Blueprint('chapter1', __name__, url_prefix='/api/ch1')


@bp.route('/ftir', methods=['POST'])
def ftir_simulation():
    """FTIR/ATR spectroscopy simulation (Section 1.3.3)."""
    data = request.get_json()
    n1 = data.get('n1', 4.0)           # Crystal refractive index (Ge default)
    n2 = data.get('n2', 1.5)           # Sample refractive index
    angle = data.get('angle_deg', 45)   # Incidence angle
    wn_min = data.get('wavenumber_min', 600)
    wn_max = data.get('wavenumber_max', 4000)

    result = compute_ftir_atr(n1, n2, angle, wn_min, wn_max)
    return jsonify(result)


@bp.route('/snell', methods=['POST'])
def snell_calculation():
    """Snell's law and critical angle (Section 1.5)."""
    data = request.get_json()
    n1 = data.get('n1', 2.4)
    n2 = data.get('n2', 1.0)
    angle = data.get('angle_deg', 45)

    result = compute_snell_law(n1, n2, angle)
    return jsonify(result)


@bp.route('/light-propagation', methods=['POST'])
def light_propagation():
    """Light ray propagation through layered media (Section 1.5)."""
    data = request.get_json()
    layers = data.get('layers', [
        {'n': 1.0, 'thickness': 100},
        {'n': 1.5, 'thickness': 200},
        {'n': 2.4, 'thickness': 150},
    ])
    angle = data.get('angle_deg', 30)
    wavelength = data.get('wavelength_nm', 550)

    result = compute_light_propagation(layers, angle, wavelength)
    return jsonify(result)
