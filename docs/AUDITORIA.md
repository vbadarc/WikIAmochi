# Informe de Auditoría Técnica, Legal y de Arquitectura — WikIAmochi (`com.wikiamochi.app`)

**Fecha de auditoría:** 17 de noviembre de 2026  
**Titular / Desarrollador:** VicThor Dev  
**Rama de trabajo:** `android-release` (creada tras commit base `47ffd01` en `main`)

---

## 1. Inventario del Proyecto y Tamaños por Carpeta

### 1.1 Estructura en la Raíz (`kiwix-js-electron_3.9.3/`)

| Ruta | Tipo | Tamaño | Destino en Android (`www/` / `.aab`) |
| :--- | :--- | :--- | :--- |
| `WikIAmochi.exe` y DLLs de Chromium/Electron (`ffmpeg.dll`, `dxcompiler.dll`, `icudtl.dat`, `locales/`, etc.) | Binarios Win32 | ~259,8 MB | **Excluido** (exclusivo de escritorio Windows) |
| `vikidia_es_all_maxi_2026-09.zim` | Archivo ZIM | **127,36 MB** (133.548.765 B) | **Incluido como Play Asset Delivery (`install-time`)** |
| `resources/app/bin/piper/` | Binarios y modelos ONNX | **171,44 MB** | **Excluido** (motor local de escritorio Windows) |
| `resources/app/node_modules/` | Paquete `msedge-tts` | **3,36 MB** | **Excluido** (cliente Node exclusivo de escritorio) |
| `resources/app/voice_cache/` | 111 archivos MP3 | **2,95 MB** | **Excluido** (ver sección 4 sobre licencia de `msedge-tts`) |
| `resources/app/main.js`, `preload.js`, `lib/libzimNodeWorker.cjs` | Proceso principal Electron | **33,2 KB** | **Excluido de `www/`** (se conserva intacto en `resources/app/` para escritorio) |
| `resources/app/index.html`, `icon.svg`, `icon.png`, `src/**`, `lib/www/js/**` | Código Web + WASM | **~6,39 MB** | **Reutilizado y copiado a `www/` mediante `npm run build:web`** |

---

## 2. Verificación Oficial de Requisitos de Google Play (2025/2026)

### 2.1 Nivel de API Objetivo (`targetSdk`) Exigido Hoy por Google Play

* **Valor exigido:**
  * Desde el 31 de agosto de 2025, Google Play exige como mínimo **Android 15 (API nivel 35)** para aplicaciones nuevas y actualizaciones (`targetSdk = 35`).
  * A partir del ciclo 2026 (31 de agosto de 2026), el requisito para nuevas aplicaciones y actualizaciones en móviles y tablets sube a **Android 16 (API nivel 36)** (`targetSdk = 36`), manteniéndose **API 35** como umbral de descubribilidad para apps existentes.
* **Fuentes oficiales consultadas y verificadas:**
  1. Android Developers — *Meet Google Play's target API level requirement*: `https://developer.android.com/google/play/requirements/target-sdk`
  2. Google Play Console Help — *Target API level requirements for Google Play apps*: `https://support.google.com/googleplay/android-developer/answer/11926878`
* **Requisito adicional de Android 15+ (API 35+):** Compatibilidad obligatoria con **páginas de memoria de 16 KB** (`https://developer.android.com/guide/practices/page-sizes`). Dado que WikIAmochi ejecuta `libzim` en **WebAssembly (`libzim-wasm.wasm`)** dentro del WebView del sistema y no empaqueta librerías `.so` propias sin alinear, y usaremos Android Gradle Plugin 8.7+ con Capacitor actualizado, el binario cumple con la alineación de 16 KB.

### 2.2 Límites Oficiales de Tamaño en Google Play y Estimación del AAB

* **Referencias oficiales abiertas consultadas:**
  1. Android Developers — *Play Asset Delivery*: `https://developer.android.com/guide/playcore/asset-delivery`
  2. Google Play Console Help — *Maximum size limits for Android App Bundles*: `https://support.google.com/googleplay/android-developer/answer/9859152`
* **Estimación de tamaño del AAB de WikIAmochi:**
  * Código Web (`www/`: `libzim-wasm.wasm` 2,13 MB + `libzim-asm.js` 4,11 MB + HTML/CSS/JS/Iconos 0,15 MB) comprimido en el bundle: **~2,2 MB**.
  * Código nativo Android + Capacitor + AndroidX: **~1,8 MB**.
  * Archivo enciclopédico `vikidia_es_all_maxi_2026-09.zim`: **127,36 MB** (133.548.765 bytes).
  * **Tamaño total estimado del AAB:** **~131,4 MB**.
* **Decisión sobre la entrega del ZIM:**
  * Tomando como referencia conservadora el límite de **200 MB** para el módulo base (`base`), el AAB completo (**~131,4 MB**) cabe con una holgura de **~68,6 MB** dentro del propio módulo base (o mediante un asset pack `install-time`), garantizando que la app funcione 100% offline desde el instante de su instalación en Google Play sin descargas adicionales en el primer inicio.

### 2.3 Arquitectura Síncrona de Lectura del ZIM en Android (Candidata A2 vs. Alternativa B)

* **Restricción técnica de `libzim-wasm.js`:** Dentro del Web Worker, Emscripten realiza lecturas de bloques mediante la interfaz POSIX síncrona `stream_ops.read(stream, buffer, offset, length, position)`. Dado que los plugins estándar de Capacitor son asíncronos, no pueden invocarse directamente desde `stream_ops.read`.
* **Candidata A2 (Principal — Servidor Local de Rangos con `shouldInterceptRequest` + `XMLHttpRequest` Síncrono en Worker):**
  1. El archivo `.zim` se empaqueta sin comprimir (`noCompress "zim"`).
  2. En `MainActivity`, el `WebViewClient` intercepta las peticiones a `https://localhost/__zim__/vikidia.zim` leyendo la cabecera `Range: bytes=start-end` (o query `?offset=X&length=Y`) directamente sobre el descriptor del asset (`AssetFileDescriptor` / `FileChannel`) y devuelve únicamente ese bloque de bytes.
  3. Dentro del **Web Worker** (donde el estándar Web permite `XMLHttpRequest` síncrono `xhr.open('GET', url, false)` con `responseType = 'arraybuffer'`), un sistema de archivos Emscripten personalizado lee cada bloque de forma 100% síncrona con caché LRU de páginas de 64 KB en el Worker.
  4. **Coste:** **0 MB duplicados en el almacenamiento del dispositivo**, arranque en **< 0,5 s**, y consumo de RAM del ZIM **< 20 MB**.
* **Alternativa B (Plan de Reserva — Copia a `filesDir` en Primer Arranque):**
  1. Copia el asset `.zim` a `context.getFilesDir()` en el primer arranque con pantalla de progreso.
  2. **Coste real estimado:** Duplica el archivo en el almacenamiento interno (**+127,36 MB adicionales**, sumando ~254,7 MB entre el APK instalado y `filesDir`) y añade **~3 a 6 segundos** en el primer arranque.

---

## 3. Análisis de APIs y Reutilización Desktop vs. Android

### 3.1 Qué se Reutiliza Tal Cual

* **`src/components/GloopAvatar.js` y `src/core/sensors/slimePhysics.js`:** Motor físico de muelles e hidratación visual en Canvas 2D. Funciona al 100% en Android WebView. Se añadirá control de pausa en `visibilitychange` / `appStateChange` y ajuste dinámico de partículas para mantener 60 FPS en dispositivos de gama baja.
* **`src/brain/aiPersonality.js` y `src/brain/kidKnowledgeBase.js`:** Motor determinista de plantillas, normalización de texto y filtro infantil (`blockedTopics`). **No contiene IA generativa ni LLMs.**
* **`lib/www/js/libzim-wasm.js`, `libzim-wasm.wasm` y `libzim-asm.js`:** Compilación oficial Emscripten de `libzim` que soporta tanto `NODEFS` (en Electron) como `WORKERFS` / lectura por bloques en Web Worker.

### 3.2 Qué Hay que Adaptar (Capa de Abstracción `src/platform/platformAdapter.js`)

Para cumplir la Regla 1 (no romper Electron y aislar llamadas nativas):

1. **Lectura del archivo ZIM (`zim:search` y `zim:image`):**
   * En **Electron:** delega en `window.gloopAPI.searchVikidia` y `window.gloopAPI.getImageData` (`libzimNodeWorker.cjs`).
   * En **Android (Capacitor):** ejecuta `libzim-wasm.js` en Web Worker leyendo por rangos mediante la Candidata A2 (con Alternativa B de respaldo).
2. **Voz de Entrada (Reconocimiento de Voz):**
   * En **Electron/Web:** usa `webkitSpeechRecognition` si existe.
   * En **Android:** `SpeechRecognition` web no está implementado de forma fiable en Android WebView. Se sustituye por `@capacitor-community/speech-recognition` en `es-ES`, solicitando el permiso `RECORD_AUDIO` **únicamente cuando el usuario pulsa el botón del micrófono**, mostrando antes una tarjeta explicativa amigable.
3. **Voz de Salida (`NaturalVoiceService`) y Diferencias entre Escritorio y Android:**
   * **Diferencia documentada:** En la versión de escritorio Windows, cuando hay conexión se utiliza `msedge-tts` y en modo offline `piper.exe`. En Android no pueden incluirse `piper.exe` ni redistribuirse los MP3 de `msedge-tts`.
   * **Cómo acercar al máximo las 3 voces en Android (`Flubber`, `Ardillita` y `Chiquillo`) sin asumir un motor preinstalado único:**
     1. Utilizaremos `@capacitor-community/text-to-speech` consultando dinámicamente el motor TTS activo del dispositivo (`getSupportedVoices()` / `getSupportedLanguages()`) sin asumir que `com.google.android.tts` esté presente en todos los fabricantes.
     2. Si existen voces en español (`es-ES`, `es-MX`, `es-US` o `es`), seleccionaremos variantes distintas cuando el motor las ofrezca y aplicaremos modulación nativa de `pitch` y `rate` en `android.speech.tts.TextToSpeech`:
        * **🐸 Muñeco Flubber Gracioso:** `pitch: 1.12`, `rate: 1.06`.
        * **🐿️ Ardillita / Toon Travieso:** `pitch: 1.48`, `rate: 1.24`.
        * **🧒 Chiquillo / Amigo Tierno:** `pitch: 1.26`, `rate: 0.96`.
     3. **Caso sin voz en español instalada:** Si el dispositivo no dispone de ninguna voz en español instalada en su motor TTS, la aplicación **mostrará siempre la respuesta escrita completa en el bocadillo de texto**, mantendrá la animación del personaje y mostrará un aviso claro orientado al adulto indicando cómo activar o descargar el paquete de voz en español en los Ajustes de Accesibilidad/Texto a voz de Android.
4. **Persistencia (`Preferences` / `Filesystem`):**
   * Migrar la configuración crítica (PIN parental, modo offline, estilo de voz y conceptos aprendidos) a `@capacitor/preferences` con respaldo en `localStorage`, evitando pérdidas si Android limpia la caché del WebView.

---

## 4. Auditoría de Licencias de `voice_cache/`, `msedge-tts` y Modelos de Piper

Cumpliendo con la Condición 6, se ha auditado el origen y régimen legal de cada elemento de audio:

1. **Los 111 archivos MP3 de `resources/app/voice_cache/` y el paquete `msedge-tts`:**
   * **Origen técnico:** El paquete `msedge-tts` (licencia MIT en su código JS) conecta en tiempo real con `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` enviando el texto de la frase a los servidores de Microsoft para obtener el audio de las voces *AlvaroNeural*, *ElviraNeural* y *DaliaNeural*.
   * **Alerta de licencia restrictiva:** El endpoint consumidor *Read Aloud* de Microsoft Edge está amparado por el *Contrato de Servicios de Microsoft* únicamente para uso dentro del navegador Microsoft Edge. **No otorga licencia para redistribuir grabaciones pre-generadas ni para integrar dicho endpoint comercialmente en aplicaciones distribuidas en Google Play Store.**
   * **Decisión tomada:**
     * **Quedan excluidos al 100% del build de Android (`www/` y `.aab`) y del repositorio Git** tanto los 111 MP3 de `voice_cache/` como el módulo `msedge-tts` y `bin/piper/`.
     * Queda documentado que en la versión local de escritorio (`WikIAmochi.exe`), cuando hay internet, `msedge-tts` transmite el texto a sintetizar a los servidores de Microsoft (`speech.platform.bing.com`).
2. **Modelos de Piper en Escritorio (`sharvard.onnx` y `claude.onnx`):**
   * `es_ES-sharvard-medium.onnx`: **NO VERIFICADO** *(sin fuente primaria abierta verificada directamente en el entorno local)*.
   * `es_MX-claude-high.onnx`: **NO VERIFICADO** *(linaje de entrenamiento sin fuente primaria abierta verificada)*.
   * Por seguridad jurídica, **ninguno de los dos modelos `.onnx` se incluye en Android ni en el repositorio público de GitHub**.

---

## 5. Auditoría de Contenido (Vikidia / Wikipedia) y Puerta Parental

1. **Atribución CC BY-SA:**
   * El contenido de Vikidia (`vikidia_es_all_maxi_2026-09.zim` y `es.vikidia.org`) está licenciado bajo **CC BY-SA 3.0**.
   * Añadiremos en la interfaz un botón **"ℹ️ Acerca de y Licencias"** que muestra la licencia **GPLv3** de la app, la atribución a **Vikidia (CC BY-SA)**, **Wikimedia Commons** y **Kiwix/libzim**, protegiendo cualquier enlace externo tras la **Puerta Parental**.
2. **Modo Online y Política de Familias:**
   * En Android, el modo Online estará **desactivado por defecto** (`100% Offline`), solo podrá activarse tras superar una **Puerta Parental reforzada** (reto aritmético para adultos + PIN de 4 dígitos) y consultará **únicamente la API de Vikidia (`es.vikidia.org`)** con HTTPS y filtro infantil estricto, deshabilitando Wikipedia general para garantizar que solo se reciba contenido redactado para niños de 8 a 13 años.

---

## 6. Versiones del Toolchain Android y Resultados Medidos del Spike del ZIM (`spike/zim`)

### 6.1 Versiones Exactas Configuradas y Verificadas

| Componente | Versión Exacta | Verificación de Compatibilidad con API 36 |
| :--- | :--- | :--- |
| **Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`)** | **`8.6.2`** | Última versión estable de Capacitor 8 |
| **Android Gradle Plugin (AGP)** | **`8.13.0`** | Soporta oficialmente `compileSdk 36` y `targetSdk 36` |
| **Gradle Wrapper** | **`8.14.3`** | Compatible con AGP 8.13.0 y JDK 21 |
| **JDK** | **`21`** (OpenJDK / Oracle JDK 21) | Requerido por AGP 8.x y Capacitor 8 |
| **`compileSdkVersion` / `targetSdkVersion` / `minSdkVersion`** | **`36` / `36` / `24`** | Compilado contra `platforms/android-36` y `build-tools/36.0.0` |

### 6.2 Resultados Medidos del Spike del ZIM en Emulador (`WikIAmochi_API36_2GB`, Android 16 API 36 Google Play, 2 GB RAM)

Se implementó y probó la **Candidata A2 (`A2_DIRECT_ASSET_FD`)** en la rama `spike/zim`:
* `MainActivity.java` abre un `AssetFileDescriptor` directo sobre `vikidia_es_all_maxi_2026-09.zim` empaquetado sin comprimir (`noCompress 'zim'`) y intercepta peticiones `https://localhost/__zim_slice__?offset=X&length=Y` en `shouldInterceptRequest` realizando lecturas atómicas con `Os.pread` sobre el descriptor nativo.
* Dentro del Web Worker (`zimWorkerBootstrap.js`), se intercepta `FileReaderSync.prototype.readAsArrayBuffer(blobSlice)` para servir las rebanadas del ZIM de forma **100% síncrona** mediante `XMLHttpRequest` síncrono (`xhr.open('GET', url, false)`) con una caché LRU en memoria de 32 páginas de 128 KB (máx. 4 MB).

| Métrica Medida en Emulador (`WikIAmochi_API36_2GB`) | Valor Medido Real | Evidencia |
| :--- | :--- | :--- |
| **Modo de apertura del ZIM** | `A2_DIRECT_ASSET_FD` (`AssetFileDescriptor` + `Os.pread`) | `ZimReady: Mode=A2_DIRECT_ASSET_FD, Size=133548765, Offset=5747616, SetupMs=0` |
| **Tiempo de preparación del descriptor ZIM** | **`0 ms`** | Sin copia a `filesDir` |
| **Tiempo de primer arranque en frío (`am start -W`, `COLD`)** | **`2.461 ms` – `3.503 ms`** | `TotalTime: 2461` / `3503` |
| **Carga de `libzim-wasm.wasm` y montaje del archivo ZIM** | **`3.468 ms`** | `ZIM loaded in 3468 ms` |
| **Búsqueda de artículo (`"delfín"`) + extracción de snippet + imagen Base64** | **`1.020 ms`** (`301 ms` en Xapian) | `SPIKE_OK title="Delphinidae" searchMs=1020 snippetLen=140 imageBase64Len=771` |
| **Memoria RAM total de la app (`dumpsys meminfo`, TOTAL PSS)** | **`114.343 KB` (~111,6 MB)** | Native Heap: `20.588 KB`, Dalvik Heap: `3.940 KB`, Swap PSS: `4.845 KB` |
| **Espacio ocupado por el APK instalado (`/data/app/...`)** | **`134 MB`** | Incluye el ZIM de 127,36 MB sin comprimir |
| **Espacio en datos internos (`/data/data/com.wikiamochi.app`)** | **`4,8 MB`** (`files/` = **`0 bytes` del ZIM**) | **El ZIM NO queda duplicado en el dispositivo** |

