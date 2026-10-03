$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$envFile = Join-Path $repoRoot '..\.env'
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^[\s#]' -or $_ -match '^[\s]*$') { } else {
            $parts = $_ -split '='
            $name = $parts[0].Trim()
            $value = ($parts[1..($parts.Length - 1)] -join '=').Trim('"')
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

Set-Location -Path (Join-Path $repoRoot '..')
# Use global python as .venv is currently incompatible with 3.14 on this system
python -m backend.main
