import threading
import webview
import platform
import importlib.util
from backend.app import app


def start_flask():
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)


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

    webview.create_window("React + Flask App", "http://127.0.0.1:5000")
    webview.start(gui=gui_backend, debug=True)
