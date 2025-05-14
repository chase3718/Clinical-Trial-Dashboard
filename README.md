# Clinical Trial Dashboard

A cross-platform desktop application for managing and visualizing clinical trial data.  
Built with a React frontend, Flask backend, and embedded into a desktop app using PyWebView.

---

## 🧱 Tech Stack

- **Frontend**: React (with TypeScript/JavaScript), built to `frontend/dist`
- **Backend**: Python (Flask)
- **Desktop Shell**: PyWebView with Qt or GTK
- **Packaging**: PyInstaller (single `.exe` output)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/clinical-trial-dashboard.git
cd clinical-trial-dashboard
```

### 2. Install Dependencies

#### React Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

#### Python Backend

```bash
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🖥️ Run in Development

```bash
# Start the Flask backend and embedded GUI
python main.py
```

Frontend will be served from `frontend/dist`, and Flask from `http://127.0.0.1:5000`.

---

## 📦 Build Executable

Use the included build script:

- On **Linux/macOS**:

  ```bash
  ./build.sh
  ```

- On **Windows**:
  ```cmd
  build.bat
  ```

This creates a standalone executable in `dist/clinical-trial-dashboard/`.

---

## 📁 Project Structure

```
clinical-trial-dashboard/
├── frontend/            # React app
│   ├── dist/            # Production build (output)
│   └── src/             # Frontend source code
├── backend/             # Flask app (optional structure)
├── main.py              # App entry point with pywebview
├── main.spec            # PyInstaller spec file
├── build.sh             # Build script (Linux/macOS)
├── build.bat            # Build script (Windows)
├── .gitignore
└── README.md
```

---

## 🛠️ Requirements

- Python 3.10+ (3.13 OK)
- Node.js (for frontend)
- PyQt5 & PyQtWebEngine or GTK (`gi`) installed on system

---

## 📃 License

MIT License © 2025 Chase Williams
