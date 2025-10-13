# Test Edge Assistant AI in Production
# Usage: Update $workerUrl with your deployed worker URL

param(
    [Parameter(Mandatory=$false)]
    [string]$workerUrl = "https://edge-assistant.<YOUR-SUBDOMAIN>.workers.dev"
)

Write-Host "Testing Edge Assistant AI on Production" -ForegroundColor Cyan
Write-Host "Worker URL: $workerUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$workerUrl/health" -Method Get
    Write-Host "   Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Version: $($health.version)" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Simple Chat Request
Write-Host "`n2. Testing Simple Chat (No Tools)..." -ForegroundColor Yellow
try {
    $chatRequest = @{
        message = "Hello! What can you help me with today?"
        user_id = "test_user"
        session_id = "test_session_$(Get-Date -Format 'yyyyMMddHHmmss')"
        mode = "chat"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$workerUrl/chat" -Method Post -Body $chatRequest -ContentType "application/json"
    
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Gray
    
    if ($response.status -ne "success" -and $response.status -ne "needs_tool") {
        Write-Host "   WARNING: Unexpected status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   FAIL: $_" -ForegroundColor Red
    Write-Host "   Response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test 3: Chat with Memory Request
Write-Host "`n3. Testing Chat with Memory Intent..." -ForegroundColor Yellow
try {
    $chatRequest = @{
        message = "Remember that my favorite color is blue."
        user_id = "test_user_memory"
        session_id = "test_session_memory"
        mode = "chat"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$workerUrl/chat" -Method Post -Body $chatRequest -ContentType "application/json"
    
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
    Write-Host "   Message: $($response.message.Substring(0, [Math]::Min(100, $response.message.Length)))..." -ForegroundColor Gray
    
    if ($response.memory_writes) {
        Write-Host "   Memory Writes: $($response.memory_writes.Count)" -ForegroundColor Cyan
        foreach ($write in $response.memory_writes) {
            Write-Host "     - $($write.key): $($write.value) [$($write.scope)]" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   FAIL: $_" -ForegroundColor Red
}

# Test 4: Chat Requesting HTTP Fetch
Write-Host "`n4. Testing Tool Use (HTTP Fetch)..." -ForegroundColor Yellow
try {
    $chatRequest = @{
        message = "Can you fetch the content from https://jsonplaceholder.typicode.com/todos/1 for me?"
        user_id = "test_user_tools"
        session_id = "test_session_tools"
        mode = "chat"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$workerUrl/chat" -Method Post -Body $chatRequest -ContentType "application/json"
    
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
    
    if ($response.tool_calls) {
        Write-Host "   Tool Calls: $($response.tool_calls.Count)" -ForegroundColor Cyan
        foreach ($tool in $response.tool_calls) {
            Write-Host "     - Tool: $($tool.tool)" -ForegroundColor Gray
        }
    }
    
    if ($response.citations) {
        Write-Host "   Citations: $($response.citations.Count)" -ForegroundColor Cyan
    }
    
    Write-Host "   Message Preview: $($response.message.Substring(0, [Math]::Min(150, $response.message.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "   FAIL: $_" -ForegroundColor Red
}

# Test 5: Voice Mode
Write-Host "`n5. Testing Voice Mode..." -ForegroundColor Yellow
try {
    $chatRequest = @{
        message = "Tell me a quick tip about productivity."
        user_id = "test_user_voice"
        session_id = "test_session_voice"
        mode = "voice"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$workerUrl/chat" -Method Post -Body $chatRequest -ContentType "application/json"
    
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
    Write-Host "   Message Length: $($response.message.Length) chars" -ForegroundColor Gray
    Write-Host "   Message: $($response.message)" -ForegroundColor Gray
    
    if ($response.message.Length -lt 300) {
        Write-Host "   Good: Voice response is concise" -ForegroundColor Green
    } else {
        Write-Host "   Note: Voice response might be lengthy" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   FAIL: $_" -ForegroundColor Red
}

# Test 6: Output Contract Validation
Write-Host "`n6. Validating Output Contract..." -ForegroundColor Yellow
try {
    $chatRequest = @{
        message = "What's 2+2?"
        user_id = "test_contract"
        session_id = "test_contract"
        mode = "chat"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$workerUrl/chat" -Method Post -Body $chatRequest -ContentType "application/json"
    
    $validStatuses = @("success", "needs_tool", "refusal", "error")
    
    if ($response.status -and $response.message) {
        Write-Host "   PASS: Required fields present (status, message)" -ForegroundColor Green
    } else {
        Write-Host "   FAIL: Missing required fields" -ForegroundColor Red
    }
    
    if ($validStatuses -contains $response.status) {
        Write-Host "   PASS: Valid status value ($($response.status))" -ForegroundColor Green
    } else {
        Write-Host "   FAIL: Invalid status value" -ForegroundColor Red
    }
    
    if ($response.PSObject.Properties.Name -notcontains "undefined") {
        Write-Host "   PASS: No undefined fields in output" -ForegroundColor Green
    }
} catch {
    Write-Host "   FAIL: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "AI TESTING COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Review the responses above to ensure AI is working correctly." -ForegroundColor Yellow
Write-Host "      All tests should show status 'success' or 'needs_tool'." -ForegroundColor Yellow
