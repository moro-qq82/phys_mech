@echo off
echo ===== Upload API Diagnostic Tool =====
echo.

REM Check current directory
echo Current directory: %CD%
echo.

REM Create test file
echo Creating test file...
echo This is a test file > test_upload.txt
if exist "test_upload.txt" (
  echo [OK] Test file created successfully.
) else (
  echo [ERROR] Failed to create test file.
  goto :end
)
echo.

REM Check API server status
echo Checking API server status...
curl -s -o nul -w "%%{http_code}" http://localhost:3001 > temp.txt
set /p status=<temp.txt
del temp.txt
if "%status%"=="200" (
  echo [OK] API server is responding.
) else (
  echo [WARNING] API server is not responding. Status code: %status%
  echo To start the server, run the following command:
  echo npm run server
  echo.
  rem 自動的に続行する
  set continue=Y
  rem echo Continue with the test? (Y/N)
  rem set /p continue=
  if /i not "%continue%"=="Y" goto :end
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
    goto :end
  )
)
echo.

REM Test upload API
echo Testing upload API...
echo curl -X POST -F "file=@test_upload.txt" http://localhost:3001/api/upload
curl -X POST -F "file=@test_upload.txt" http://localhost:3001/api/upload
if %errorlevel% equ 0 (
  echo [OK] API request sent successfully.
) else (
  echo [ERROR] Failed to send API request.
)
echo.

REM Delete test file
echo Deleting test file...
del test_upload.txt
if not exist "test_upload.txt" (
  echo [OK] Test file deleted successfully.
) else (
  echo [WARNING] Failed to delete test file.
)
echo.

:end
echo ===== Diagnosis Complete =====
echo.
echo If problems persist, perform these additional checks:
echo 1. Check error messages in the server logs
echo 2. Check error messages in the browser console
echo 3. Verify network connectivity
echo.

pause
