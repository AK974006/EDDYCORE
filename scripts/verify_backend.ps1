$ErrorActionPreference = "Stop"

Write-Host ">>> Stopping any existing Backend (Port 8000)..."
$tcp = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($tcp) {
    $pid8000 = $tcp.OwningProcess
    Write-Host "Found process $pid8000 on port 8000. Killing it..."
    Stop-Process -Id $pid8000 -Force
}
else {
    Write-Host "No process found on port 8000."
}

Write-Host ">>> Starting Backend..."
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-File", "scripts\start_backend.ps1"

Write-Host ">>> Waiting for Backend to be ready..."
for ($i = 1; $i -le 20; $i++) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -Method Get -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "Backend is UP!"
            break
        }
    }
    catch {}
    Write-Host "." -NoNewline
}

if ($i -gt 20) {
    Write-Host "`nTimed out waiting for backend."
    exit 1
}

Write-Host "`n>>> Testing Eddie API..."
$body = @{
    message = "Hello, are you online?"
    history = @()
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/eddie/chat" -Method Post -Body $body -ContentType "application/json"
    Write-Host ">>> RESPONSE FROM EDDIE:"
    Write-Host $response.response
    Write-Host ">>> TEST PASSED."
}
catch {
    Write-Host ">>> API ERROR:"
    Write-Host $_
    Write-Host ">>> TEST FAILED."
}
