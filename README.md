# AI IoT Container Tamper Detection SOC Dashboard

A production-ready full-stack system that simulates IoT sensor telemetry from shipping containers, detects tampering using AI anomaly detection, and displays real-time alerts in a SOC-style dashboard.

## Key Features
- **IoT sensor simulator** generating realistic telemetry streams
- **AI anomaly detection** with:
  - Isolation Forest (scikit-learn)
  - Autoencoder (TensorFlow)
  - Rule-based tamper detection
- **Real-time alerts** via Socket.IO
- **SOC dashboard** with live charts and alert panels
- **SQLite** persistence for sensor logs and alerts
- **Deployment-ready** for Render (backend) and Vercel (frontend)

## Architecture
```
Sensor Simulator
  -> Flask API (/api/sensor-data)
  -> Anomaly Service (IForest + Autoencoder + Rules)
  -> SQLite (sensor_logs, alerts)
  -> Socket.IO (tamper_alert, sensor_update)
  -> React SOC Dashboard
```

## AI Models
- **Isolation Forest** detects outliers in multi-sensor feature space.
- **Autoencoder** learns normal patterns and flags high reconstruction error.
- **Rule Engine** catches explicit tamper behaviors (door open, vibration spikes, GPS shifts, etc.).

The system triggers alerts when **any** model flags an anomaly.

## Local Setup
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```
Backend runs at `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs at `http://localhost:5173`

## Environment Variables
### Backend (`backend/.env`)
- `PORT=5000`
- `SECRET_KEY=your_secret_key`

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL=http://localhost:5000`

## Deployment
### Render (Backend)
1. Create a new **Web Service** on Render.
2. Point it to your GitHub repository.
3. Render will use `backend/render.yaml`.
4. Ensure environment variables are set in Render:
   - `PORT`
   - `SECRET_KEY`

### Vercel (Frontend)
1. Import the repository in Vercel.
2. Set build output to `frontend`.
3. Set environment variable:
   - `VITE_API_BASE_URL=https://<your-render-backend-url>`
4. Vercel uses `frontend/vercel.json` for SPA routing.

## API Endpoints
- `POST /api/sensor-data` — send sensor telemetry
- `GET /api/alerts` — fetch alerts
- `GET /api/health` — health check

## Socket Events
- `tamper_alert` — emitted when anomaly detected
- `sensor_update` — live telemetry stream for charts

---
Built for professional SOC monitoring workflows with clean, modular, production-ready code.
