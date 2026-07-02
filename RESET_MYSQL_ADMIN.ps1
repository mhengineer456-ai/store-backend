# MySQL 8.0 Password Reset - Run as Administrator
# This uses --skip-grant-tables which is the most reliable method

$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
$newPass = "Ayush123"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  MySQL 8.0 Password Reset (skip-grant method)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Kill any running mysqld
Write-Host "`n[1] Killing any existing MySQL processes..." -ForegroundColor Yellow
Stop-Service "MySQL80" -Force -ErrorAction SilentlyContinue
Start-Sleep 2
taskkill /F /IM mysqld.exe 2>$null | Out-Null
Start-Sleep 2
Write-Host "    Done." -ForegroundColor Green

# Start mysqld with skip-grant-tables in background
Write-Host "`n[2] Starting MySQL in skip-grant-tables mode..." -ForegroundColor Yellow
$proc = Start-Process -FilePath "$mysqlBin\mysqld.exe" `
    -ArgumentList "--skip-grant-tables", "--skip-networking", "--console" `
    -PassThru -WindowStyle Minimized
Write-Host "    mysqld PID: $($proc.Id)" -ForegroundColor Green
Write-Host "    Waiting 8 seconds for startup..." -ForegroundColor Yellow
Start-Sleep 8

# Connect and reset password (no password needed with skip-grant-tables)
Write-Host "`n[3] Resetting password..." -ForegroundColor Yellow
$sql = "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$newPass'; FLUSH PRIVILEGES;"
$out = echo $sql | & "$mysqlBin\mysql.exe" -u root 2>&1
Write-Host "    Output: $out" -ForegroundColor Gray

# Also try without plugin specification (MySQL 8 default)
$sql2 = "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY '$newPass'; FLUSH PRIVILEGES;"
$out2 = echo $sql2 | & "$mysqlBin\mysql.exe" -u root 2>&1
Write-Host "    Output2: $out2" -ForegroundColor Gray

# Kill the skip-grant instance
Write-Host "`n[4] Stopping skip-grant mysqld..." -ForegroundColor Yellow
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
taskkill /F /IM mysqld.exe 2>$null | Out-Null
Start-Sleep 3
Write-Host "    Done." -ForegroundColor Green

# Start MySQL service normally
Write-Host "`n[5] Starting MySQL80 service..." -ForegroundColor Yellow
Start-Service "MySQL80" -ErrorAction SilentlyContinue
Start-Sleep 5

# Test
Write-Host "`n[6] Testing connection..." -ForegroundColor Yellow
$test = & "$mysqlBin\mysql.exe" -u root "-p$newPass" -e "SELECT 'SUCCESS' as result; SHOW DATABASES;" 2>&1
if ($test -match "SUCCESS") {
    Write-Host "`n  PASSWORD RESET OK! New password: $newPass" -ForegroundColor Green
    Write-Host ($test | Where-Object { $_ -notmatch "Warning" })
} else {
    Write-Host "`n  Still failed. Trying empty password test..." -ForegroundColor Red
    $test2 = & "$mysqlBin\mysql.exe" -u root --password="" -e "SELECT 'EMPTY_PASS_WORKS' as result;" 2>&1
    if ($test2 -match "EMPTY_PASS_WORKS") {
        Write-Host "  Empty password works! Updating .env..." -ForegroundColor Yellow
        (Get-Content ".env") -replace "MYSQL_PASSWORD=.*", "MYSQL_PASSWORD=" | Set-Content ".env"
        Write-Host "  .env updated: MYSQL_PASSWORD=" -ForegroundColor Green
    } else {
        Write-Host "  Output: $test" -ForegroundColor Red
        Write-Host "  Output2: $test2" -ForegroundColor Red
    }
}

Write-Host "`nPress any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
