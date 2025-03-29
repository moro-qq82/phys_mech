@echo off
echo ===== Mechanism Sharing App Diagnostic Tool =====
echo.

REM Check PostgreSQL status
echo Checking PostgreSQL status...
sc query postgresql-x64-14 | findstr "RUNNING" > nul
if %errorlevel% equ 0 (
  echo [OK] PostgreSQL service is running.
) else (
  echo [WARNING] PostgreSQL service is not running.
  echo Please start the PostgreSQL service.
  echo Command: net start postgresql-x64-14
)
echo.

REM Test database connection
echo Testing database connection...
set PGPASSWORD=postgres
psql -U postgres -h localhost -p 5432 -c "SELECT 1" postgres > nul 2>&1
if %errorlevel% equ 0 (
  echo [OK] Successfully connected to PostgreSQL.
) else (
  echo [ERROR] Could not connect to PostgreSQL.
  echo Please verify that PostgreSQL is properly installed and running.
)
echo.

REM Check database existence
echo Checking database existence...
psql -U postgres -h localhost -p 5432 -c "SELECT 1 FROM pg_database WHERE datname='mechanism_sharing_development'" postgres | findstr "1" > nul
if %errorlevel% equ 0 (
  echo [OK] mechanism_sharing_development database exists.
) else (
  echo [WARNING] mechanism_sharing_development database does not exist.
  echo Creating database...
  psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE mechanism_sharing_development" postgres
  if %errorlevel% equ 0 (
    echo [OK] Database created successfully.
  ) else (
    echo [ERROR] Failed to create database.
  )
)
echo.

REM Check table existence
echo Checking table existence...
psql -U postgres -h localhost -p 5432 -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public'" mechanism_sharing_development | findstr "users mechanisms categories mechanism_categories" > nul
if %errorlevel% equ 0 (
  echo [OK] Required tables exist.
) else (
  echo [WARNING] Some tables may not exist.
  echo Running migrations...
  cd /d %~dp0
  npx sequelize-cli db:migrate
  if %errorlevel% equ 0 (
    echo [OK] Migrations executed successfully.
  ) else (
    echo [ERROR] Failed to execute migrations.
  )
)
echo.

REM Check upload directory
echo Checking upload directory...
if exist "public\uploads\" (
  echo [OK] Upload directory exists.
) else (
  echo [WARNING] Upload directory does not exist.
  echo Creating directory...
  mkdir "public\uploads"
  if %errorlevel% equ 0 (
    echo [OK] Upload directory created successfully.
  ) else (
    echo [ERROR] Failed to create upload directory.
  )
)
echo.

REM Check API server status
echo Checking API server status...
netstat -ano | findstr ":3001" > nul
if %errorlevel% equ 0 (
  echo [OK] API server is running.
) else (
  echo [WARNING] API server may not be running.
  echo To start the server, run the following command:
  echo npm run dev
)
echo.

REM Test file upload
echo Testing file upload...
echo This test needs to be performed manually through the browser.
echo 1. Access http://localhost:3000 in your browser
echo 2. Log in
echo 3. Navigate to the new post page
echo 4. Try uploading a file
echo 5. If an error occurs, check the error message in the browser console
echo.

echo ===== Diagnosis Complete =====
echo If problems persist, perform these additional checks:
echo 1. Check error messages in the browser console
echo 2. Check error messages in the server logs
echo 3. Check database table structure: npx sequelize-cli db:migrate:status
echo.

pause
