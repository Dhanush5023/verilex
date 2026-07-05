@echo off
echo ================================================
echo  VeriLex Backend Setup
echo ================================================

echo.
echo [1/3] Creating Python virtual environment...
py -m venv venv

echo.
echo [2/3] Activating venv and installing dependencies...
call venv\Scripts\activate.bat
pip install --prefer-binary -r requirements.txt

echo.
echo [3/3] Setup complete!
echo.
echo ================================================
echo  IMPORTANT: Add your GROQ_API_KEY to .env file
echo  Get a free key at: https://console.groq.com
echo ================================================
echo.
echo To start the backend, run:  start_backend.bat
pause
