import os
import sys
import json
import uuid
import sqlite3
from flask import Flask, send_from_directory, request

app = Flask(__name__, static_folder=None)

upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

DB_NAME = 'database.db'

def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS uploads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT NOT NULL,
                file_name TEXT NOT NULL
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_name TEXT NOT NULL
            )
        ''')
        conn.commit()
        
init_db()

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

@app.route('/api/upload', methods=['POST'])
def upload_file( ):
    if 'file' not in request.files:
        return response(500, 'No file part')
    file = request.files['file']
    if file.filename == '':
        return response(500, 'No selected file')
    if file and file.filename:
        # Generate a unique filename
        filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]        
        # Save the file to the upload folder
        filePath = os.path.join(upload_folder, filename)
        file.save(filePath)
        # Save the file name to the database
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO uploads (file_name, uuid)
                VALUES (?, ?)
            ''', (file.filename, filename))
            conn.commit()
        # Return the file name as a response
        response_data = {
            'file_name': file.filename,
            'file_path': filename
        }
        # Return the file name as a response
        return response(200, 'File uploaded successfully', response_data)
    return response(500, 'File upload failed')


@app.route('/api/ping')
def ping():
    return 'pong', 200

def response(status_code, message, data=None):
    if data:
        return json.dumps({'status': status_code, 'message': message, 'data': data}), status_code, {'Content-Type': 'application/json'}
    else:
        return json.dumps({'status': status_code, 'message': message}), status_code, {'Content-Type': 'application/json'}

if __name__ == '__main__':
    app.run(port=5000, debug=True)