import threading
import webview
import platform
import importlib.util
from backend.app import app
import socket

def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

flask_port = get_free_port()

def start_flask():
    app.run(host='127.0.0.1', port=flask_port)

def detect_gui_backend():
    system = platform.system()

    if system == 'Linux':
        # Check for GTK
        gtk_spec = importlib.util.find_spec("gi")
        if gtk_spec:
            return "gtk"

        # Check for Qt (PyQt5 or PySide2)
        pyqt5_spec = importlib.util.find_spec("PyQt5")
        pyside2_spec = importlib.util.find_spec("PySide2")

        if pyqt5_spec:
            return "qt"
        elif pyside2_spec:
            return "qt"

        print("⚠️ No supported GUI backend (GTK/Qt) found. PyWebView may not launch properly.")
        return None

    # On Windows or macOS, let PyWebView pick the default
    return None


if __name__ == '__main__':
    flask_thread = threading.Thread(target=start_flask)
    flask_thread.daemon = True
    flask_thread.start()

    gui_backend = detect_gui_backend()
    print(f"🖼️ Using GUI backend: {gui_backend or 'default'}")

    webview.create_window("Clinical Trial Dashboard", f"http://127.0.0.1:{flask_port}")    
    webview.start(gui=gui_backend)
