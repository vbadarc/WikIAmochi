Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$capturesDir = "C:\Users\Admin\Desktop\WIKIA\kiwix-js-electron_3.9.3\docs\captures"
if (!(Test-Path $capturesDir)) {
    New-Item -ItemType Directory -Path $capturesDir -Force | Out-Null
}

Write-Host "Iniciando WikIAmochi.exe de escritorio..."
$proc = Start-Process -FilePath "C:\Users\Admin\Desktop\WIKIA\kiwix-js-electron_3.9.3\WikIAmochi.exe" -PassThru

Write-Host "Esperando 5 segundos a que la ventana se inicialice..."
Start-Sleep -Seconds 5

# Captura de pantalla de la ventana
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)

$capPath = Join-Path $capturesDir "electron_desktop_run.png"
$bitmap.Save($capPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Captura guardada en: $capPath"

Start-Sleep -Seconds 2
Stop-Process -Id $proc.Id -Force
Write-Host "Proceso WikIAmochi.exe cerrado tras verificacion."
