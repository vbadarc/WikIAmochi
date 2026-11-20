Add-Type -AssemblyName System.Drawing

$storeDir = "C:\Users\Admin\Desktop\WIKIA\kiwix-js-electron_3.9.3\docs\store"
if (!(Test-Path $storeDir)) {
    New-Item -ItemType Directory -Path $storeDir -Force | Out-Null
}

$v31Dir = "C:\Users\Admin\Desktop\WIKIA\kiwix-js-electron_3.9.3\android\app\src\main\res\values-v31"
if (!(Test-Path $v31Dir)) {
    New-Item -ItemType Directory -Path $v31Dir -Force | Out-Null
}

# 1. Android 12+ Splash Theme
$v31Styles = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/colorPrimary</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/splash</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
"@
Set-Content -Path (Join-Path $v31Dir "styles.xml") -Value $v31Styles -Encoding UTF8

# 2. Iconos adaptativos con soporte Monochrome (Android 13+)
$adaptiveXml = @"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"@
$anyDpiDir = "C:\Users\Admin\Desktop\WIKIA\kiwix-js-electron_3.9.3\android\app\src\main\res\mipmap-anydpi-v26"
Set-Content -Path (Join-Path $anyDpiDir "ic_launcher.xml") -Value $adaptiveXml -Encoding UTF8
Set-Content -Path (Join-Path $anyDpiDir "ic_launcher_round.xml") -Value $adaptiveXml -Encoding UTF8

# 3. Generar Icono de Tienda 512x512
$srcIconPath = "C:\Users\Admin\Desktop\WIKIA\kiwix-js-electron_3.9.3\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"
if (Test-Path $srcIconPath) {
    $srcImg = [System.Drawing.Image]::FromFile($srcIconPath)
    $destIcon = New-Object System.Drawing.Bitmap 512, 512
    $g = [System.Drawing.Graphics]::FromImage($destIcon)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(255, 10, 25, 47))
    $g.DrawImage($srcImg, 0, 0, 512, 512)
    $destIcon.Save((Join-Path $storeDir "icon_512x512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $destIcon.Dispose()
    $srcImg.Dispose()
    Write-Host "✓ Icono de tienda 512x512 generado en docs/store/icon_512x512.png"
}

# 4. Generar Gráfico de Funciones 1024x500 (Feature Graphic para Google Play)
$destFeature = New-Object System.Drawing.Bitmap 1024, 500
$gf = [System.Drawing.Graphics]::FromImage($destFeature)
$gf.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gf.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

# Fondo degradado atractivo infantil
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 0, 0),
    (New-Object System.Drawing.Point 1024, 500),
    [System.Drawing.Color]::FromArgb(255, 13, 71, 161),
    [System.Drawing.Color]::FromArgb(255, 0, 176, 255)
)
$gf.FillRectangle($brush, 0, 0, 1024, 500)
$brush.Dispose()

# Dibujar icono en el lateral
if (Test-Path $srcIconPath) {
    $srcImg = [System.Drawing.Image]::FromFile($srcIconPath)
    $gf.DrawImage($srcImg, 80, 75, 350, 350)
    $srcImg.Dispose()
}

# Texto del título y lema
$fontTitle = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
$fontSub2 = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Regular)
$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$brushYellow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 235, 59))

$gf.DrawString("WikIAmochi", $fontTitle, $brushWhite, 470, 140)
$gf.DrawString("Enciclopedia Inteligente Infantil", $fontSub, $brushYellow, 475, 230)
$gf.DrawString("100% Offline • Sin Publicidad • Seguro para Niños", $fontSub2, $brushWhite, 475, 280)

$fontTitle.Dispose()
$fontSub.Dispose()
$fontSub2.Dispose()
$brushWhite.Dispose()
$brushYellow.Dispose()
$gf.Dispose()

$destFeature.Save((Join-Path $storeDir "feature_graphic_1024x500.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$destFeature.Dispose()
Write-Host "✓ Gráfico de funciones 1024x500 generado en docs/store/feature_graphic_1024x500.png"
