from flask import Blueprint, request, jsonify
from services.smart_materials import compute_strain_tensor, compute_piezo_accelerometer

bp = Blueprint('chapter4', __name__, url_prefix='/api/ch4')


@bp.route('/strain-tensor', methods=['POST'])
def strain_tensor():
    """2D strain tensor computation (Section 4.4.1).

    eij tensor decomposed into symmetric Sij (strain) + antisymmetric Aij (rotation).
    """
    data = request.get_json()
    du1_dx1 = data.get('du1_dx1', 0.01)   # Elongation along x1
    du1_dx2 = data.get('du1_dx2', 0.005)   # Shear component
    du2_dx1 = data.get('du2_dx1', 0.003)   # Shear component
    du2_dx2 = data.get('du2_dx2', 0.02)    # Elongation along x2

    result = compute_strain_tensor(du1_dx1, du1_dx2, du2_dx1, du2_dx2)
    return jsonify(result)


@bp.route('/piezo-accelerometer', methods=['POST'])
def piezo_accelerometer():
    """Piezoelectric accelerometer (Section 4.4.2).

    Book values: t=0.5mm, L=38.1mm, W=12.7mm, delta_t/t=1e-6
    d33=298.8e-12, s33E=12.5e-12, epsilon33=11.95e-9
    Expected: Q=1.1157e-8 C, C=1.156e-8 F, V=1 V
    """
    data = request.get_json()
    t = data.get('t', 0.5e-3)
    L = data.get('L', 38.1e-3)
    W = data.get('W', 12.7e-3)
    delta_t_ratio = data.get('delta_t_ratio', 1e-6)
    d33 = data.get('d33', 298.8e-12)
    s33E = data.get('s33E', 12.5e-12)
    epsilon33 = data.get('epsilon33', 11.95e-9)

    result = compute_piezo_accelerometer(t, L, W, delta_t_ratio, d33, s33E, epsilon33)
    return jsonify(result)
