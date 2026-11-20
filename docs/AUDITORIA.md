# Auditoría Técnica y de Privacidad de Datos en WikIAmochi

**Fecha de la auditoría:** Noviembre 2026  
**Versión de la app:** 1.0.0 (`com.wikiamochi.app`)  
**Titular y Desarrollador:** VicThor Dev (`vjbadenassepe@gmail.com`)  
**Entorno de ejecución:** Kiwix/libzim + Capacitor 8 en Android 16 (API 36) / Android 11 (API 30) / Electron  

---

## 1. Inventario Exhaustivo de Datos Almacenados ("Memoria")

La aplicación WikIAmochi opera bajo el principio de **Privacidad desde el Diseño (Privacy by Design)** y minimización absoluta de datos personales. Todos los datos persisten exclusivamente de forma local dentro del entorno aislado (sandbox) del dispositivo del usuario.

| Clave / Identificador | Tipo de Dato | Ubicación Técnica | Finalidad / Propósito | ¿Sale del dispositivo? |
|---|---|---|---|---|
| `gloop_offline_only` | Booleano (`true`/`false`) | `Preferences` / `localStorage` | Controla si la app opera al 100% desconectada (por defecto) o si permite consultas a Vikidia. | **NO (100% Local)** |
| `gloop_pin_enabled` | Booleano (`true`/`false`) | `Preferences` / `localStorage` | Indica si el control parental de adultos está activo. | **NO (100% Local)** |
| `gloop_parent_pin` | Cadena (4 dígitos) | `Preferences` / `localStorage` | Código numérico de seguridad configurado por el padre/tutor. | **NO (100% Local)** |
| `gloop_theme_color` | Cadena (ej: `#00E676`) | `Preferences` / `localStorage` | Color cosmético del personaje Mochi seleccionado por el niño. | **NO (100% Local)** |
| `gloop_voice_profile` | Cadena (identificador de personaje) | `Preferences` / `localStorage` | Personalidad vocal elegida (Flubber, Toon, Kid Soft). | **NO (100% Local)** |
| `gloop_voice_rate_*` / `gloop_voice_pitch_*` | Números decimales | `Preferences` / `localStorage` | Calibración acústica de tono y velocidad por voz (solo en builds debug). | **NO (100% Local)** |
| `gloop_known_topics` | Lista JSON de cadenas | `Preferences` / `localStorage` | Temas consultados previamente para ofrecer sugerencias de lectura infantiles en pantalla. | **NO (100% Local)** |

---

## 2. Red y Comunicaciones Externas

- **Modo 100% Offline (Por defecto):** Cero conexiones de red. La aplicación lee los artículos e ilustraciones directamente desde el paquete local ZIM empaquetado en los activos (`assets/es-vikidia.zim`).
- **Modo Online Supervisado (Opcional, desactivado por defecto):**
  - Restringido exclusivamente al dominio educativo `https://es.vikidia.org`.
  - Peticiones HTTPS GET directas para obtener extractos de artículos escolares infantiles no disponibles en el ZIM.
  - **No se transmiten credenciales, identificadores del dispositivo, cookies de rastreo ni datos personales.**
- **SDKs de Publicidad o Rastreo:**  
  - No contiene Google AdMob, Unity Ads, Facebook Audience Network ni ningún otro intermediario de anuncios.
  - No solicita ni utiliza el permiso `com.google.android.gms.permission.AD_ID`.
  - No contiene Firebase Analytics, Mixpanel, AppsFlyer ni herramientas de telemetría o perfilado de usuarios.

---

## 3. Micrófono y Reconocimiento de Voz

- **Permiso `RECORD_AUDIO`:**  
  - Permiso estándar de Android para capturar el audio cuando el usuario pulsa activamente el botón del micrófono.
  - **Uso bajo demanda:** No escucha en segundo plano ni graba audio de forma continua. La captura finaliza inmediatamente al recibir el texto reconocido o al bloquearse la pantalla / pasar la app a segundo plano (`visibilitychange`).
- **Naturaleza del motor `SpeechRecognizer`:**  
  - En dispositivos Android estándar, el reconocimiento de voz delega en el servicio del sistema (`com.google.android.googlequicksearchbox` de Google). Dependiendo de si el dispositivo tiene descargados los paquetes de voz sin conexión, el audio puede ser procesado localmente o enviado a los servidores de reconocimiento de Google bajo los términos de servicio de Google Speech Services. Por ello, se declara con transparencia que el audio "puede enviarse a los servidores de Google".

---

## 4. Botón de Borrado Total de Datos ("Derecho al Olvido")

- En cumplimiento estricto del RGPD (Reglamento General de Protección de Datos de la UE), la LOPDGDD española y la política de Familias de Google Play:
  - En la **Zona de Familias y Ajustes** (protegida por el PIN de adulto), se ha implementado el botón:
    `🗑️ Borrar todos los datos de la app`.
  - Al pulsarlo, tras una ventana modal de confirmación obligatoria:
    1. Se ejecuta `localStorage.clear()`.
    2. Se ejecuta `window.Capacitor.Plugins.Preferences.clear()`.
    3. Se recarga la aplicación devolviéndola al estado inicial de fábrica (eliminando preguntas, memoria, preferencias y PIN).

---

## 5. Mediciones Reales de Memoria (RAM) y Rendimiento

Medición ejecutada sobre **dispositivo físico real**:
- **Dispositivo:** Xiaomi Redmi Note 8 Pro (`cyu48hfu5de6emlv`, Android 11, API 30).
- **Comando ejecutado:** `adb shell dumpsys meminfo com.wikiamochi.app`
- **Registro de memoria capturado (en reposo tras arranque e interacción):**
  - **Java Heap:** 13.724 KB
  - **Native Heap:** 40.360 KB
  - **Code (mmap):** 12.500 KB
  - **Graphics (EGL/GL mtrack):** 79.049 KB
  - **Private Other / System:** 28.551 KB
  - **TOTAL PSS:** **175.888 KB** (~171,7 MB)
  - **TOTAL RSS:** **308.701 KB**
- **Comportamiento tras búsquedas:** Al realizar múltiples búsquedas consecutivas con visualización de artículos e imágenes ZIM, el PSS se sitúa en torno a ~256 MB debido a la retención de búferes gráficos de WebView y asignaciones activas de WebAssembly.
- **Tiempo de respuesta de primera búsqueda:** ~420 ms desde almacenamiento flash local.

---

## 6. Conclusión de la Auditoría

WikIAmochi cumple los requerimientos de privacidad infantil de Google Play Designed for Families, COPPA y normativas europeas, garantizando que los datos de los niños nunca son vendidos, compartidos ni explotados con fines comerciales.
