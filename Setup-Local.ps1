# Setup-Local.ps1
# This script automates the local setup of the Expense Tracker on a new machine.

$RootPath = Get-Location
$ClientPath = Join-Path $RootPath "client"
$ServerPath = Join-Path $RootPath "ExpenseTracker"
$PublishPath = Join-Path $RootPath "LocalHost"
$WwwRootPath = Join-Path $ServerPath "wwwroot"

Write-Host "--- 🚀 Starting Local Expense Tracker Setup ---" -ForegroundColor Cyan

# 1. Check Prerequisites
Write-Host "Checking prerequisites..."
if (!(Get-Command dotnet -ErrorAction SilentlyContinue)) { Write-Error ".NET SDK not found. Please install it."; exit }
if (!(Get-Command npm -ErrorAction SilentlyContinue)) { Write-Error "Node.js/npm not found. Please install it."; exit }

# 2. Build Frontend
Write-Host "Building React Frontend..." -ForegroundColor Yellow
Set-Location $ClientPath
npm install
npm run build

# 3. Prepare Backend wwwroot
Write-Host "Syncing Frontend to Backend..." -ForegroundColor Yellow
if (Test-Path $WwwRootPath) { Remove-Item -Recurse -Force $WwwRootPath }
New-Item -ItemType Directory -Path $WwwRootPath
Copy-Item -Path (Join-Path $ClientPath "dist\*") -Destination $WwwRootPath -Recurse

# 4. Publish Backend
Write-Host "Publishing .NET Backend..." -ForegroundColor Yellow
Set-Location $ServerPath
dotnet publish -c Release -o $PublishPath

# 5. Setup Auto-Start (Task Scheduler)
Write-Host "Configuring Auto-Start (Always Alive)..." -ForegroundColor Yellow
$ExePath = Join-Path $PublishPath "ExpenseTracker.exe"
$TaskName = "ExpenseTrackerLocal"
$Action = New-ScheduledTaskAction -Execute $ExePath -WorkingDirectory $PublishPath
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Remove existing task if it exists
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Runs Expense Tracker Local Backend on Startup"

Write-Host "--- ✅ Setup Complete! ---" -ForegroundColor Green
Write-Host "The application will now start automatically whenever you log in."
Write-Host "You can also run it manually now at: $ExePath"
Write-Host "Access it at: http://localhost:5000" -ForegroundColor Cyan

Set-Location $RootPath
