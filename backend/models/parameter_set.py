from app import db, ma
from datetime import datetime, timezone


class SavedParameterSet(db.Model):
    __tablename__ = 'saved_parameter_sets'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    chapter = db.Column(db.Integer, nullable=False)
    module_name = db.Column(db.String(100), nullable=False)
    parameters = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class SavedParameterSetSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = SavedParameterSet
        load_instance = True


parameter_set_schema = SavedParameterSetSchema()
parameter_sets_schema = SavedParameterSetSchema(many=True)
