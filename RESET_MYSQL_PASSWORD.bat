@echo off
echo ===================================================
echo  G-PDMS MySQL Password Reset Tool
echo  Run this as Administrator!
echo ===================================================
echo.

REM Step 1: Stop MySQL service
echo [1/5] Stopping MySQL service...
net stop MySQL80
timeout /t 2 /nobreak >nul

REM Step 2: Create the init file
echo ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Ayush123'; > "%TEMP%\mysql_reset.sql"
echo FLUSH PRIVILEGES; >> "%TEMP%\mysql_reset.sql"

REM Step 3: Start MySQL with init file to reset password
echo [2/5] Starting MySQL in reset mode...
start "MySQL Reset" "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --init-file="%TEMP%\mysql_reset.sql" --console
echo Waiting 10 seconds for MySQL to apply reset...
timeout /t 10 /nobreak >nul

REM Step 4: Kill the temporary mysqld process
echo [3/5] Stopping reset MySQL...
taskkill /F /IM mysqld.exe >nul 2>&1
timeout /t 3 /nobreak >nul

REM Step 5: Start MySQL service normally
echo [4/5] Starting MySQL service normally...
net start MySQL80
timeout /t 3 /nobreak >nul

REM Step 6: Verify
echo [5/5] Testing connection with password 'Ayush123'...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pAyush123 -e "SELECT 'Connection OK!' as result;" 2>&1

echo.
echo ===================================================
echo  Done! If you see 'Connection OK!' above,
echo  your backend is ready. Run: npm run dev
echo ===================================================
pause
