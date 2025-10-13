# Quick AI Test
$url = "https://cf-ai-edge-assistant.ns-2004.workers.dev"

Write-Host "Testing AI..." -ForegroundColor Cyan

# Health check
$health = Invoke-RestMethod -Uri "$url/health"
Write-Host "Health: $($health.status)" -ForegroundColor Green

# AI Chat test
Write-Host "Testing AI chat (this may take 10-20 seconds)..." -ForegroundColor Yellow
$body = '{"message":"What is 2+2?","user_id":"test","session_id":"test001","mode":"chat"}'
try {
    $response = Invoke-RestMethod -Uri "$url/chat" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "AI says: $($response.message)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
}
