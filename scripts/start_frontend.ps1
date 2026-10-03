$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$envFile = Join-Path $repoRoot '..\.env'
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^[\s#]' -or $_ -match '^[\s]*$') { } else {
            $parts = $_ -split '='
            $name = $parts[0].Trim()
            $value = ($parts[1..($parts.Length-1)] -join '=').Trim('"')
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

Set-Location -Path (Join-Path $repoRoot '..\web_ui')
$Env:PORT = '5174'
npm run dev
