# Avisos de Software y Contenidos de Terceros (Third-Party Notices)

**Proyecto:** WikIAmochi (`com.wikiamochi.app`)  
**Titular / Desarrollador:** VicThor Dev  
**Licencia principal del proyecto:** GNU General Public License v3.0 or later (`GPL-3.0-or-later`)  
**Repositorio de código fuente:** `https://github.com/vbadarc/wikiamochi`

---

## 1. Obligaciones bajo GNU GPLv3

Dado que **WikIAmochi** incorpora el motor de lectura ZIM compilado a WebAssembly (`libzim-wasm.js`, `libzim-wasm.wasm` y `libzim-asm.js`) derivado de **libzim (openZIM)** y la estructura base de **Kiwix JS / Kiwix JS Electron**, ambos licenciados bajo **GNU GPLv3**, la distribución de esta aplicación en formato binario (tanto para escritorio como en Google Play Store) cumple con las siguientes obligaciones de la licencia GPLv3:

1. **Licenciamiento recíproco:** El código fuente completo de WikIAmochi se distribuye bajo los términos de la licencia **GNU GPLv3** (véase el archivo `LICENSE` en la raíz del proyecto y el texto oficial en `https://www.gnu.org/licenses/gpl-3.0.html`).
2. **Disponibilidad del código fuente:** El código fuente completo correspondiente a la versión distribuida está disponible públicamente y sin cargos en `https://github.com/vbadarc/wikiamochi`.
3. **Avisos visibles en la aplicación:** La aplicación incluye una sección interna **"Acerca de / Licencias"** accesible desde la interfaz con los avisos de autoría, la licencia GPLv3 y la referencia al repositorio de código fuente.

---

## 2. Componentes de Software de Terceros Incluidos en la App

| Componente / Paquete | Versión | Licencia | Autor / Titular | Uso en WikIAmochi |
| :--- | :--- | :--- | :--- | :--- |
| **Kiwix JS / Kiwix JS Electron** | 3.9.3 (base) | `GPL-3.0-or-later` | Kiwix Contributors (Mossroy, Jaifroid y colaboradores) | Base arquitectónica y adaptadores de lectura ZIM |
| **libzim / libzim-wasm** | 9.x (WASM/ASM) | `GPL-3.0-or-later` | openZIM / Kiwix | Lector de archivos enciclopédicos `.zim` en WebAssembly |
| **@capacitor/core** | 7.x / 8.x | `MIT` | Ionic / Drifty Co. | Puente de ejecución híbrido WebView nativo en Android |
| **@capacitor/android** | 7.x / 8.x | `MIT` | Ionic / Drifty Co. | Plataforma nativa Android para Capacitor |
| **@capacitor/app** | 7.x | `MIT` | Ionic / Drifty Co. | Gestión del ciclo de vida y botón atrás en Android |
| **@capacitor/filesystem** | 7.x | `MIT` | Ionic / Drifty Co. | Almacenamiento en directorio privado de la app |
| **@capacitor/preferences** | 7.x | `MIT` | Ionic / Drifty Co. | Persistencia clave-valor nativa en Android (`SharedPreferences`) |
| **@capacitor/splash-screen** | 7.x | `MIT` | Ionic / Drifty Co. | Pantalla de carga de arranque en Android |
| **@capacitor/status-bar** | 7.x | `MIT` | Ionic / Drifty Co. | Configuración de barras del sistema y áreas seguras |
| **@capacitor-community/text-to-speech** | 6.x / 7.x | `MIT` | Capacitor Community | Síntesis de voz nativa en Android (`android.speech.tts.TextToSpeech`) |
| **@capacitor-community/speech-recognition** | 6.x / 7.x | `MIT` | Capacitor Community | Reconocimiento de voz nativo en Android (`android.speech.SpeechRecognizer`) |
| **Electron** *(solo versión escritorio)* | 33.x | `MIT` | Electron Contributors / OpenJS Foundation | Contenedor de escritorio para Windows (`WikIAmochi.exe`) |

---

## 3. Componentes Exclusivos de Escritorio (Excluidos del Build de Android)

Los siguientes componentes se utilizan únicamente en el entorno local de escritorio Windows y **están explícitamente excluidos** del paquete de Android (`.aab` / `.apk`) y del directorio `www/`:

| Componente | Licencia | Estado en Android | Notas de Auditoría |
| :--- | :--- | :--- | :--- |
| **Piper TTS (`piper.exe`, `espeak-ng`, `onnxruntime`)** | `MIT` / `GPL-3.0` | **Excluido** | Binarios Win32 locales en `resources/app/bin/piper/` |
| **Modelo `es_ES-sharvard-medium.onnx`** | `CC BY 3.0` | **Excluido de Android** | Basado en el corpus *Sharvard* (V. Aubanel, M. L. García Lecumberri, M. Cooke, 2014) |
| **Modelo `es_MX-claude-high.onnx`** | Licencia comunitaria con linaje de entrenamiento no verificado | **Excluido de Android** | Uso restringido a pruebas locales; no se redistribuye en Play Store |
| **Paquete `msedge-tts` y `voice_cache/*.mp3`** | Código `MIT`, pero el servicio online está sujeto al Contrato de Servicios de Microsoft | **Excluido de Android y de Git** | El servicio consumidor *Read Aloud* de Microsoft Edge no autoriza redistribuir grabaciones pre-generadas dentro de aplicaciones en tiendas de terceros |

---

## 4. Licencias de Contenido Enciclopédico y Multimedia

1. **Textos enciclopédicos de Vikidia en español (`vikidia_es_all_maxi_2026-09.zim` y `https://es.vikidia.org`):**
   * **Licencia:** **Creative Commons Atribución-CompartirIgual 3.0 Unported (`CC BY-SA 3.0`)** (y términos equivalentes `CC BY-SA 4.0`).
   * **Titularidad:** Autores y colaboradores de Vikidia (`https://es.vikidia.org`).
   * **Cumplimiento en la app:** Cada artículo consultado muestra la atribución a **Vikidia (CC BY-SA)** y la pantalla *"Acerca de / Licencias"* incluye la referencia completa a Vikidia y al enlace de la licencia.
2. **Ilustraciones e imágenes (`Wikimedia Commons` / `Vikidia`):**
   * **Licencia:** Variable por archivo (**Dominio Público**, **CC0**, **CC BY 3.0/4.0** o **CC BY-SA 3.0/4.0**).
   * **Cumplimiento en la app:** Se conserva la atribución de origen (*"Ilustración de Vikidia / Wikimedia Commons bajo licencia libre CC BY-SA"*).
3. **Aviso de No Respaldo Oficial (Marcas Registradas):**
   * *Vikidia*, *Wikipedia*, *Wikimedia*, *Wikimedia Commons* y *Kiwix* son marcas de sus respectivos titulares (Association Vikidia, Wikimedia Foundation, Inc. y Kiwix). **WikIAmochi** es un proyecto independiente desarrollado por **VicThor Dev** y no está avalado ni patrocinado oficialmente por dichas organizaciones.
