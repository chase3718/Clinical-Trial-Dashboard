from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='../frontend/dist')

@app.route('/api/hello')
def hello():
    return {'message': 'Hello from Flask!'}

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    full_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
