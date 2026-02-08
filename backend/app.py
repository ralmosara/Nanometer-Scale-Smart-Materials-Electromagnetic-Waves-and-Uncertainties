from flask import Flask
from flask_cors import CORS
import redis

from config import Config
from extensions import db, ma
import extensions


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    ma.init_app(app)

    extensions.cache = redis.from_url(app.config['REDIS_URL'])

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
