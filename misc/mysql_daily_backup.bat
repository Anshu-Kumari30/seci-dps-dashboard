@echo off
:: Set backup config
set DB_NAME=seci_prod_db
set DB_USER=root
set DB_PASS=Seci@1234
set DB_HOST=localhost
set DB_PORT=3309
set BACKUP_DIR=C:\MySQLBackups
set DATESTAMP=%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%
set FILENAME=%DB_NAME%_backup_%DATESTAMP%.sql

:: Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

:: Perform the backup
echo Backing up MySQL database...
mysqldump -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% --databases %DB_NAME% --single-transaction --quick --lock-tables=false > "%BACKUP_DIR%\%FILENAME%"

if %ERRORLEVEL% EQU 0 (
    echo Backup successful: %FILENAME%
) else (
    echo Backup failed.
)

:: Optional: delete backups older than 7 days
forfiles /p "%BACKUP_DIR%" /m *.sql /d -7 /c "cmd /c del @path"

exit /b
