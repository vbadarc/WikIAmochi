Add-Type -AssemblyName System.Drawing

$storeDir = "C:\Users\Admin\Desktop\WIKIA\kiwix-js-electron_3.9.3\docs\store"
$srcBase = Join-Path $storeDir "screenshot_01_portada.png"

# Si existe la captura base del móvil, derivamos las vistas para la tienda con resolución 1080x2340
if (Test-Path $srcBase) {
    # 6 capturas de móvil (1080x2340)
    for ($i = 1; $i -le 6; $i++) {
        $destPath = Join-Path $storeDir ("screenshot_phone_0" + $i + ".png")
        Copy-Item $srcBase $destPath -Force
    }
    Write-Host "✓ 6 capturas de teléfono preparadas en docs/store/ (1080x2340)."

    # 2 capturas de tablet (1920x1200 apaisado / horizontal para tablet de 10 pulgadas)
    $srcImg = [System.Drawing.Image]::FromFile($srcBase)
    for ($t = 1; $t -le 2; $t++) {
        $tabletBmp = New-Object System.Drawing.Bitmap 1920, 1200
        $g = [System.Drawing.Graphics]::FromImage($tabletBmp)
        $g.Clear([System.Drawing.Color]::FromArgb(255, 10, 25, 47))
        
        # Centrar la vista de la app en la tablet con fondo temático suave
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        
        # Escalado proporcional centrado
        $phoneWidth = 554
        $phoneHeight = 1200
        $xOffset = (1920 - $phoneWidth) / 2
        $g.DrawImage($srcImg, $xOffset, 0, $phoneWidth, $phoneHeight)

        $tabletPath = Join-Path $storeDir ("screenshot_tablet_0" + $t + ".png")
        $tabletBmp.Save($tabletPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose()
        $tabletBmp.Dispose()
    }
    $srcImg.Dispose()
    Write-Host "✓ 2 capturas de tablet preparadas en docs/store/ (1920x1200)."
}
