$envPath = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envPath)) {
    Write-Error "Missing .env file. Create it from .env.example and add your Google OAuth values."
    exit 1
}

Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()

    if ($line -eq "" -or $line.StartsWith("#")) {
        return
    }

    $key, $value = $line.Split("=", 2)

    if (-not $key -or $null -eq $value) {
        return
    }

    Set-Item -Path "Env:$($key.Trim())" -Value $value.Trim()
}

$env:SPRING_PROFILES_ACTIVE = "oauth"

Write-Host "Starting backend with Spring profile: $env:SPRING_PROFILES_ACTIVE"

.\mvnw.cmd clean spring-boot:run "-Dspring-boot.run.profiles=oauth"
