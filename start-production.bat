@echo off
cd /d "C:\Users\Yosuf Al-Rawahi\F1 Dashboard"
start "F1 Dashboard Production" cmd /k "cd /d ""C:\Users\Yosuf Al-Rawahi\F1 Dashboard"" && set PORT=3007 && echo Building app... && npm run build && echo. && echo Starting production server on http://localhost:3007 && npm run start && echo. && echo Process exited with code %%ERRORLEVEL%%"
