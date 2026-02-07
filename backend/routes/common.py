from flask import Blueprint, request, jsonify
from app import db
from models.simulation import SimulationResult, simulation_result_schema, simulation_results_schema
from models.parameter_set import SavedParameterSet, parameter_set_schema, parameter_sets_schema

bp = Blueprint('common', __name__, url_prefix='/api')


@bp.route('/results', methods=['GET'])
def list_results():
    """List saved simulation results with optional filters."""
    chapter = request.args.get('chapter', type=int)
    module = request.args.get('module')
    limit = request.args.get('limit', 50, type=int)

    query = SimulationResult.query.order_by(SimulationResult.created_at.desc())
    if chapter:
        query = query.filter_by(chapter=chapter)
    if module:
        query = query.filter_by(module_name=module)

    results = query.limit(limit).all()
    return jsonify(simulation_results_schema.dump(results))


@bp.route('/results', methods=['POST'])
def save_result():
    """Save a simulation result."""
    data = request.get_json()
    result = SimulationResult(
        chapter=data['chapter'],
        module_name=data['module_name'],
        input_params=data['input_params'],
        output_data=data['output_data'],
    )
    db.session.add(result)
    db.session.commit()
    return jsonify(simulation_result_schema.dump(result)), 201


@bp.route('/results/<int:result_id>', methods=['DELETE'])
def delete_result(result_id):
    """Delete a simulation result."""
    result = SimulationResult.query.get_or_404(result_id)
    db.session.delete(result)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200


@bp.route('/parameters', methods=['GET'])
def list_parameters():
    """List saved parameter sets."""
    chapter = request.args.get('chapter', type=int)
    module = request.args.get('module')

    query = SavedParameterSet.query.order_by(SavedParameterSet.created_at.desc())
    if chapter:
        query = query.filter_by(chapter=chapter)
    if module:
        query = query.filter_by(module_name=module)

    params = query.all()
    return jsonify(parameter_sets_schema.dump(params))


@bp.route('/parameters', methods=['POST'])
def save_parameters():
    """Save a parameter set."""
    data = request.get_json()
    param_set = SavedParameterSet(
        name=data['name'],
        chapter=data['chapter'],
        module_name=data['module_name'],
        parameters=data['parameters'],
    )
    db.session.add(param_set)
    db.session.commit()
    return jsonify(parameter_set_schema.dump(param_set)), 201


@bp.route('/parameters/<int:param_id>', methods=['DELETE'])
def delete_parameters(param_id):
    """Delete a parameter set."""
    param_set = SavedParameterSet.query.get_or_404(param_id)
    db.session.delete(param_set)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200


@bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'Nanoscale Simulation Platform'})
