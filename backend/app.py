import os
import sys
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder=None)

def get_frontend_path():
    if hasattr(sys, '_MEIPASS'):
        # Running from PyInstaller onefile bundle
        return os.path.join(sys._MEIPASS, 'frontend/dist')
    else:
        # Development / normal run
        return os.path.abspath('frontend/dist')

@app.route('/')
@app.route('/<path:path>')
def serve_react(path='index.html'):
    frontend_path = get_frontend_path()
    return send_from_directory(frontend_path, path)
