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

### 2.2 Límites Oficiales de Tamaño en Google Play (Módulo Base y Play Asset Delivery)
* **Valores oficiales vigentes:**
  * **Módulo base (`base`) del Android App Bundle (`.aab`):** Hasta **500 MB** de tamaño de descarga comprimido (ampliado desde el límite histórico de 200 MB).
  * **Play Asset Delivery (`install-time` asset pack):** Hasta **1,5 GB** por asset pack individual, y hasta **4 GB** acumulados entre el módulo base y todos los paquetes `install-time`.
  * **Paquetes `fast-follow` y `on-demand`:** Hasta **1,5 GB** por paquete individual y hasta **30 GB** acumulados.
* **Fuentes oficiales consultadas y verificadas:**
  1. Android Developers — *Play Asset Delivery*: `https://developer.android.com/guide/playcore/asset-delivery`
  2. Google Play Console Help — *Maximum size limits for Android App Bundles*: `https://support.google.com/googleplay/android-developer/answer/9859152`

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
   * En **Android (Capacitor):** ejecuta `libzim-wasm.js` o el lector ZIM por acceso aleatorio sin cargar los 127 MB en memoria RAM.
2. **Voz de Entrada (Reconocimiento de Voz):**
   * En **Electron/Web:** usa `webkitSpeechRecognition` si existe.
   * En **Android:** `SpeechRecognition` web no está implementado de forma fiable en Android WebView. Se sustituye por `@capacitor-community/speech-recognition` en `es-ES`, solicitando el permiso `RECORD_AUDIO` **únicamente cuando el niño o adulto pulsa el botón del micrófono**, mostrando antes una tarjeta explicativa amigable.
3. **Voz de Salida (`NaturalVoiceService`) y Diferencias entre Escritorio y Android:**
   * **Diferencia documentada:** En la versión de escritorio Windows, cuando hay conexión se utiliza `msedge-tts` (voces neuronales de Microsoft Edge) y en modo offline `piper.exe` (binario Win32 x64). En Android no pueden incluirse `piper.exe` ni redistribuirse los MP3 de `msedge-tts`.
   * **Cómo acercar al máximo las 3 voces en Android (`Flubber`, `Ardillita` y `Chiquillo`):**
     1. Utilizaremos `@capacitor-community/text-to-speech` conectado al motor nativo de Android (`com.google.android.tts` — *Servicios de voz de Google*, preinstalado en todos los dispositivos Android con Google Play y capaz de sintetizar 100% offline con voces neuronales locales de alta calidad en `es-ES` / `es-US`).
     2. Seleccionaremos voces distintas disponibles en el motor TTS de Android (`getSupportedVoices()`) o modularemos de forma diferenciada los parámetros nativos `pitch` y `rate` de `TextToSpeech` (que en Android usa un vocoder de fase nativo sin producir aliasing):
        * **🐸 Muñeco Flubber Gracioso:** Voz grave/jovial (`pitch: 1.12`, `rate: 1.06`).
        * **🐿️ Ardillita / Toon Travieso:** Voz aguda y rápida (`pitch: 1.48`, `rate: 1.24`).
        * **🧒 Chiquillo / Amigo Tierno:** Voz infantil dulce y pausada (`pitch: 1.26`, `rate: 0.96`).
     3. Añadiremos detección automática de disponibilidad del idioma `es-ES` en el TTS del dispositivo y un aviso claro si el dispositivo no tuviera voces en español instaladas.
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
   * `es_ES-sharvard-medium.onnx`: basado en el *Sharvard Corpus* (Aubanel, García Lecumberri & Cooke, 2014), licenciado bajo **CC BY 3.0** (permite uso con atribución).
   * `es_MX-claude-high.onnx`: modelo comunitario cuyo linaje de entrenamiento original en `MODEL_CARD` no especifica la licencia de la grabación fuente. Por prudencia legal, **tampoco se incluye en Android ni en el repositorio público de GitHub**.

---

## 5. Auditoría de Contenido (Vikidia / Wikipedia) y Puerta Parental

1. **Atribución CC BY-SA:**
   * El contenido de Vikidia (`vikidia_es_all_maxi_2026-09.zim` y `es.vikidia.org`) está licenciado bajo **CC BY-SA 3.0**.
   * Añadiremos en la interfaz un botón **"ℹ️ Acerca de y Licencias"** que muestra la licencia **GPLv3** de la app, la atribución a **Vikidia (CC BY-SA)**, **Wikimedia Commons** y **Kiwix/libzim**, protegiendo cualquier enlace externo tras la **Puerta Parental**.
2. **Modo Online y Política de Familias:**
   * En Android, el modo Online estará **desactivado por defecto** (`100% Offline`), solo podrá activarse tras superar una **Puerta Parental reforzada** (reto aritmético para adultos + PIN de 4 dígitos) y consultará **únicamente la API de Vikidia (`es.vikidia.org`)** con HTTPS y filtro infantil estricto, deshabilitando Wikipedia general para garantizar que solo se reciba contenido redactado para niños de 8 a 13 años.
