🚛 LogMaster Pro | Smart ELD Dashboard
LogMaster Pro is a high-fidelity, full-stack Electronic Logging Device (ELD) prototype designed to digitize the traditional paper driver's daily log. It combines a Django REST Framework backend with a React (Vite) frontend to automate Hours of Service (HOS) calculations and route visualization.

🚀 Key Features
Smart Manifest Generation: Intuitively captures all legally required data points including Driver ID, Vehicle Numbers, Shipper info, and Load Numbers.

HOS Automated Logic: Backend services automatically calculate driving windows, mandatory 30-minute breaks, and 10-hour Sleeper Berth resets based on trip distance and average speed.

24-Hour Compliance Grid: A professional-grade, SVG-rendered log grid featuring high-contrast duty status lines and Red Status-Change Nodes to match physical logbook standards.

Route Intelligence: Integrated Leaflet.js map visualization that draws the optimized path and suggests strategic Fuel Stops along the route.

Responsive Architecture: A mobile-first design using Tailwind CSS that stacks manifest inputs and map views for on-the-go drivers.

🛠 Tech Stack
Frontend: React (Vite), Tailwind CSS (v4), Axios, Leaflet.js (Maps).

Backend: Django, Django REST Framework (DRF), CORS Headers.

Database: SQLite (Development) with full migration history for Trips and Log Entries.

Logic: Custom Python services for HOS time-series generation.

📦 Installation & Setup

1. Backend (Django)
   Bash
   cd backend
   python -m venv venv

# Activate venv: .\venv\Scripts\activate (Windows) or source venv/bin/activate (Mac/Linux)

pip install django djangorestframework django-cors-headers
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 2. Frontend (React)
Bash
cd frontend
npm install
npm install -D @tailwindcss/postcss # Ensure PostCSS compatibility
npm run dev
📊 Business Logic Implementation
The system adheres to the FMCSA 70-hour/8-day rule logic:

Driving (Line 3): Maximum 11 hours per window.

On Duty (Line 4): Maximum 14-hour daily window.

Sleeper Berth (Line 2): Automatically inserted after driving limits are reached.

Off Duty (Line 1): Default status for pre-trip and post-trip inspections.
