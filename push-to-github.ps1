# PowerShell script to initialize repo and push to GitHub
# Run this from the project root: ./push-to-github.ps1

param(
  [string]$remoteUrl = "https://github.com/HETVI-UNDHAD/sgp.git",
  [string]$branch = "main",
  [switch]$force
)

Write-Host "Working directory: $(Get-Location)"

if (-not (Test-Path -Path .git)) {
  git init
  Write-Host "Initialized new git repo"
} else {
  Write-Host ".git already exists"
}

# Ensure .gitignore has backend/.env
$gitignore = "backend/.gitignore"
if (Test-Path $gitignore) {
  $content = Get-Content $gitignore -Raw
  if ($content -notmatch "\\.env") {
    Add-Content $gitignore "`n.env"
    Write-Host "Appended .env to backend/.gitignore"
  }
} else {
  "node_modules/`n.env" | Out-File $gitignore -Encoding utf8
  Write-Host "Created backend/.gitignore"
}

# Stage, commit, and add remote
git add .
try {
  git commit -m "Initial commit - MERN register scaffold" -q
  Write-Host "Committed changes"
} catch {
  Write-Host "No changes to commit or commit failed: $_"
}

# Add or set remote
$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Remote 'origin' exists: $existing"
  if ($existing -ne $remoteUrl) {
    git remote remove origin
    git remote add origin $remoteUrl
    Write-Host "Replaced origin with $remoteUrl"
  }
} else {
  git remote add origin $remoteUrl
  Write-Host "Added origin $remoteUrl"
}

# Ensure branch
git branch -M $branch

# Push
if ($force) {
  git push -u origin $branch --force
} else {
  git push -u origin $branch
}

Write-Host 'Done. If push failed, check authentication or run with -force to overwrite remote.'