Add-Type -AssemblyName System.Drawing

$srcPath = (Get-Item "icon.png").FullName
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$densities = @(
    @{ Name = "mipmap-mdpi"; Size = 48; ForeSize = 108; SafeSize = 72 },
    @{ Name = "mipmap-hdpi"; Size = 72; ForeSize = 162; SafeSize = 108 },
    @{ Name = "mipmap-xhdpi"; Size = 96; ForeSize = 216; SafeSize = 144 },
    @{ Name = "mipmap-xxhdpi"; Size = 144; ForeSize = 324; SafeSize = 216 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192; ForeSize = 432; SafeSize = 288 }
)

$baseRes = "android/app/src/main/res"

foreach ($d in $densities) {
    $dir = Join-Path $baseRes $d.Name
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    # 1. ic_launcher.png (legacy / fallback)
    $bmp = New-Object System.Drawing.Bitmap($d.Size, $d.Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $d.Size, $d.Size)
    $g.Dispose()
    $bmp.Save((Join-Path $dir "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save((Join-Path $dir "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    # 2. ic_launcher_foreground.png (Adaptive Icon con margen seguro)
    $foreBmp = New-Object System.Drawing.Bitmap($d.ForeSize, $d.ForeSize)
    $fg = [System.Drawing.Graphics]::FromImage($foreBmp)
    $fg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $fg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $fg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $fg.Clear([System.Drawing.Color]::Transparent)
    $offset = [int](($d.ForeSize - $d.SafeSize) / 2)
    $fg.DrawImage($src, $offset, $offset, $d.SafeSize, $d.SafeSize)
    $fg.Dispose()
    $foreBmp.Save((Join-Path $dir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $foreBmp.Dispose()

    Write-Host "Generados iconos para $($d.Name)"
}

$src.Dispose()
Write-Host "Todos los iconos de Mochi generados con exito."
