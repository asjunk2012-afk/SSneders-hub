# PowerShell script to convert images to base64 and update HTML
$images = @{
    "Profile-image.png.png" = "sidebar-profile-img,welcome-profile-img,about-profile-img";
    "pink-shirt-new.png" = "pink-shirt";
    "Pink-pants-new.png" = "pink-pants";
    "purple-shirt-new.png" = "purple-shirt";
    "purple-pants-new.png" = "purple-pants";
}

$htmlPath = "c:/Users/asjun/OneDrive/Desktop/assets ssneder/website/index.html"
$assetsPath = "c:/Users/asjun/OneDrive/Desktop/assets ssneder/website/assets/"
$htmlContent = Get-Content $htmlPath -Raw

foreach ($image in $images.GetEnumerator()) {
    $imageFile = $image.Key
    $classNames = $image.Value
    
    $fullPath = Join-Path $assetsPath $imageFile
    if (Test-Path $fullPath) {
        $base64 = [Convert]::ToBase64String((Get-Content $fullPath -Encoding Byte))
        $dataUrl = "data:image/png;base64,$base64"
        
        Write-Host "Converted $imageFile to base64 ($($base64.Length) characters)"
        
        # Replace all occurrences of this image
        $htmlContent = $htmlContent -replace "src=`"assets/$imageFile`"", "src=`"$dataUrl`""
    }
}

# Save the updated HTML
Set-Content $htmlPath $htmlContent -Encoding UTF8
Write-Host "HTML file updated with embedded images"
