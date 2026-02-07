from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import redis

from config import Config

db = SQLAlchemy()
ma = Marshmallow()
cache = None


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    ma.init_app(app)

    global cache
    cache = redis.from_url(app.config['REDIS_URL'])

    from routes import chapter1, chapter2, chapter3, chapter4, common
    app.register_blueprint(chapter1.bp)
    app.register_blueprint(chapter2.bp)
    app.register_blueprint(chapter3.bp)
    app.register_blueprint(chapter4.bp)
    app.register_blueprint(common.bp)

    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
