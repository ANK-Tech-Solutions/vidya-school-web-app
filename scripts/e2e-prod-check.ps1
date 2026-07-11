$ErrorActionPreference = 'Continue'
$api = 'https://vidya-school-web-app.onrender.com'
$origin = 'https://vidya-school-web-app.vercel.app'
$results = New-Object System.Collections.Generic.List[object]

function Add-Result([string]$name, [bool]$ok, [string]$detail) {
  $results.Add([pscustomobject]@{ Step = $name; OK = $ok; Detail = $detail })
  $tag = if ($ok) { 'PASS' } else { 'FAIL' }
  Write-Host "[$tag] $name : $detail"
}

foreach ($path in @('/login', '/', '/admin', '/driver', '/student')) {
  try {
    $r = Invoke-WebRequest -Uri ($origin + $path) -TimeoutSec 30 -UseBasicParsing -MaximumRedirection 5
    Add-Result "UI $path" ($r.StatusCode -eq 200) "HTTP $($r.StatusCode)"
  } catch {
    Add-Result "UI $path" $false $_.Exception.Message
  }
}

try {
  $opt = Invoke-WebRequest -Uri "$api/api/v1/auth/login" -Method OPTIONS -Headers @{
    Origin = $origin
    'Access-Control-Request-Method' = 'POST'
    'Access-Control-Request-Headers' = 'content-type,authorization'
  } -TimeoutSec 60
  $acao = [string]$opt.Headers['Access-Control-Allow-Origin']
  Add-Result 'CORS preflight' (($opt.StatusCode -in 200, 204) -and ($acao.Length -gt 0)) "HTTP $($opt.StatusCode) ACAO=$acao"
} catch {
  Add-Result 'CORS preflight' $false $_.Exception.Message
}

function Test-Role([string]$user, [string]$pass, [string]$rolePath) {
  try {
    $body = @{ username = $user; password = $pass } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$api/api/v1/auth/login" -Method POST -ContentType 'application/json' -Headers @{ Origin = $origin } -Body $body -TimeoutSec 90
    $token = $login.data.accessToken
    $roles = ($login.data.user.roles -join ',')
    Add-Result "Login $user" (($login.success -eq $true) -and ($null -ne $token)) "roles=$roles"

    $me = Invoke-RestMethod -Uri "$api/api/v1/auth/me" -Headers @{ Authorization = "Bearer $token"; Origin = $origin } -TimeoutSec 60
    Add-Result "Me $user" ($me.success -eq $true) ([string]$me.data.username)

    $dash = Invoke-WebRequest -Uri ($api + $rolePath) -Headers @{ Authorization = "Bearer $token"; Origin = $origin } -TimeoutSec 60 -UseBasicParsing
    Add-Result "API $rolePath" ($dash.StatusCode -eq 200) "HTTP $($dash.StatusCode)"
  } catch {
    Add-Result "Flow $user" $false $_.Exception.Message
  }
}

Test-Role 'admin' 'Password@123' '/api/v1/admin/dashboard'
Test-Role 'driver1' 'Password@123' '/api/v1/driver/dashboard'
Test-Role 'parent1' 'Password@123' '/api/v1/student/dashboard'

try {
  $html = (Invoke-WebRequest -Uri "$origin/login" -TimeoutSec 30 -UseBasicParsing).Content
  $m = [regex]::Match($html, '/_next/static/chunks/app/\(auth\)/login/page-[^"]+\.js')
  if ($m.Success) {
    $js = (Invoke-WebRequest -Uri ($origin + $m.Value) -TimeoutSec 30 -UseBasicParsing).Content
    if ($js -match 'onrender\.com') {
      Add-Result 'Frontend API_URL' $true 'onrender.com present in login bundle'
    } elseif ($js -match 'localhost:808') {
      Add-Result 'Frontend API_URL' $false 'bundle still points at localhost'
    } else {
      Add-Result 'Frontend API_URL' $false 'API host not found in login bundle'
    }
  } else {
    Add-Result 'Frontend API_URL' $false 'login chunk not found'
  }
} catch {
  Add-Result 'Frontend API_URL' $false $_.Exception.Message
}

Write-Host ''
Write-Host '=== SUMMARY ==='
$results | Format-Table -AutoSize
$fail = @($results | Where-Object { -not $_.OK }).Count
$pass = @($results | Where-Object { $_.OK }).Count
Write-Host "Passed: $pass  Failed: $fail"
if ($fail -gt 0) { exit 1 } else { exit 0 }
