from app import db, ma
from datetime import datetime, timezone


class SimulationResult(db.Model):
    __tablename__ = 'simulation_results'

    id = db.Column(db.Integer, primary_key=True)
    chapter = db.Column(db.Integer, nullable=False)
    module_name = db.Column(db.String(100), nullable=False)
    input_params = db.Column(db.JSON, nullable=False)
    output_data = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class SimulationResultSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = SimulationResult
        load_instance = True


simulation_result_schema = SimulationResultSchema()
simulation_results_schema = SimulationResultSchema(many=True)
