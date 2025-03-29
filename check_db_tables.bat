@echo off
echo ===== Database Table Structure Verification Tool =====
echo.

REM PostgreSQL connection information
set PGUSER=postgres
set PGPASSWORD=postgres
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=mechanism_sharing_development

REM Test database connection
echo Testing database connection...
psql -c "SELECT 1" > nul 2>&1
if %errorlevel% equ 0 (
  echo [OK] Successfully connected to PostgreSQL.
) else (
  echo [ERROR] Could not connect to PostgreSQL.
  echo Please verify that PostgreSQL is properly installed and running.
  goto :end
)
echo.

REM Get table list
echo Retrieving table list...
echo.
echo === Table List ===
psql -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"
echo.

REM Check structure of each table
echo Checking structure of each table...
echo.

echo === users table ===
psql -c "\d users"
echo.

echo === mechanisms table ===
psql -c "\d mechanisms"
echo.

echo === categories table ===
psql -c "\d categories"
echo.

echo === mechanism_categories table ===
psql -c "\d mechanism_categories"
echo.

REM Check foreign key constraints
echo Checking foreign key constraints...
echo.
echo === Foreign Key Constraints ===
psql -c "SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE constraint_type = 'FOREIGN KEY';"
echo.

REM Check record count for each table
echo Checking record count for each table...
echo.
echo === Record Counts ===
psql -c "SELECT 'users' AS table_name, COUNT(*) FROM users UNION ALL SELECT 'mechanisms', COUNT(*) FROM mechanisms UNION ALL SELECT 'categories', COUNT(*) FROM categories UNION ALL SELECT 'mechanism_categories', COUNT(*) FROM mechanism_categories ORDER BY table_name;"
echo.

REM Check migration status
echo Checking migration status...
echo.
echo === Migration Status ===
cd /d %~dp0
npx sequelize-cli db:migrate:status
echo.

:end
echo ===== Verification Complete =====
echo.
echo If issues are found, consider the following actions:
echo 1. Reset migrations: npx sequelize-cli db:migrate:undo:all
echo 2. Re-run migrations: npx sequelize-cli db:migrate
echo 3. Seed data: npx sequelize-cli db:seed:all
echo.

pause
