# Simple HTTP Server for testing
$port = 8000
$root = Get-Location

$HttpListener = New-Object System.Net.HttpListener
$HttpListener.Prefixes.Add("http://localhost:$port/")
$HttpListener.Start()

Write-Host "Server running at http://localhost:$port/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "Serving files from: $root" -ForegroundColor Gray
Write-Host ""

try {
    while ($HttpListener.IsListening) {
        $Context = $HttpListener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response
        
        $FilePath = Join-Path -Path $root -ChildPath $Request.Url.LocalPath
        if ($Request.Url.LocalPath -eq "/") {
            $FilePath = Join-Path -Path $root -ChildPath "frame.html"
        }
        
        if (Test-Path $FilePath) {
            $Content = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentLength64 = $Content.Length
            
            # Set content type
            if ($FilePath.EndsWith(".html")) {
                $Response.ContentType = "text/html"
            } elseif ($FilePath.EndsWith(".js")) {
                $Response.ContentType = "application/javascript"
            } elseif ($FilePath.EndsWith(".css")) {
                $Response.ContentType = "text/css"
            } else {
                $Response.ContentType = "text/plain"
            }
            
            $Response.OutputStream.Write($Content, 0, $Content.Length)
        } else {
            $Response.StatusCode = 404
            $Response.StatusDescription = "Not Found"
            $NotFound = [System.Text.Encoding]::UTF8.GetBytes("404 - File not found")
            $Response.OutputStream.Write($NotFound, 0, $NotFound.Length)
        }
        
        $Response.OutputStream.Close()
    }
} finally {
    $HttpListener.Stop()
    $HttpListener.Close()
    Write-Host "Server stopped" -ForegroundColor Yellow
}
