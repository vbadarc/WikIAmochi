# 🌟 WikIAmochi - Enciclopedia Inteligente Infantil

> **Una experiencia interactiva y educativa diseñada para niños de 4 a 12 años y sus familias.**  
> 100% Autónoma, Segura y Offline por defecto con física interactiva en Canvas 2D, síntesis de voz adaptada y la enciclopedia escolar infantil Vikidia en español.

---

## 🎯 Filosofía del Proyecto y Arquitectura de Código Único

WikIAmochi está desarrollado bajo el principio de **Single Source of Truth (Fuente Única de la Verdad)** para escritorio y dispositivos móviles:
- **`resources/app/`**: Contiene la totalidad del motor de la aplicación (Canvas HTML5, físicas elásticas del personaje Mochi, sintetizador procedimental de voz, cerebro infantil y catálogo de conocimiento).
- **Multiplataforma:** La misma base de código se ejecuta en **Windows (Electron)** y en **Android (Capacitor 8)** sin duplicación de lógica ni divergencias de comportamiento.

---

## 🛡️ Privacidad y Seguridad Infantil

- **100% Desconectada por defecto (Offline):** La aplicación no requiere conexión a internet para funcionar. Las consultas se realizan sobre un archivo local ZIM de Vikidia empaquetado en el almacenamiento del dispositivo.
- **Sin Publicidad ni Compras:** 0 anuncios, 0 micropagos, 0 rastreadores (`AD_ID` no utilizado).
- **Zona de Familias Protegida por PIN:** El acceso a los ajustes avanzados, activación del modo online supervisado y el borrado de memoria requieren un PIN de 4 dígitos creado por el adulto, con un reto matemático de dos cifras para recuperación en caso de olvido.
- **Derecho al Olvido Directo:** Botón de borrado total en los ajustes de adultos que reinicia la memoria y preferencias a estado de fábrica.
- **Política de Privacidad pública:** Consultable en [vbadarc.github.io/WikIAmochi/politica-privacidad.html](https://vbadarc.github.io/WikIAmochi/politica-privacidad.html).

---

## 🖥️ Ejecución en Escritorio (Windows)

Para ejecutar la aplicación en entorno de desarrollo con Electron:
```bash
npm start
```
O ejecutando directamente el binario compilado:
```text
WikIAmochi.exe
```

---

## 📱 Compilación para Android (Google Play Store)

El empaquetado nativo para Android se gestiona a través de **Capacitor 8**:

1. **Construir y sincronizar los activos web:**
   ```bash
   npm run build:web
   npx cap copy android
   ```

2. **Compilar el paquete de producción (AAB):**
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
   cd android
   .\gradlew.bat bundleRelease
   ```

El archivo resultante (`app-release.aab`) se genera optimizado con R8 y reducción de recursos (Resource Shrinking), listo para ser firmado mediante el almacén seguro de claves especificado en `android/keystore.properties`.

Consulte [RELEASE.md](RELEASE.md) para la guía completa de firma y publicación.

---

## 📜 Licencias y Créditos

- **Código fuente de WikIAmochi:** Licenciado bajo la **GNU General Public License v3.0 (GPLv3)**.
- **Contenidos enciclopédicos:** Procedentes de **Vikidia en español**, bajo licencia **Creative Commons Atribución-CompartirIgual 3.0 (CC BY-SA 3.0)** y Wikimedia Commons.
- **Lector ZIM:** Basado en la tecnología de **libzim** y Kiwix (LGPLv3 / GPLv3).

Para más detalles, consulte [LICENCIAS_Y_ATRIBUCIONES.md](docs/legal/LICENCIAS_Y_ATRIBUCIONES.md).
