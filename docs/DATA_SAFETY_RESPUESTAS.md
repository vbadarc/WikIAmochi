# Declaración de Seguridad de los Datos (Google Play Data Safety) — WikIAmochi

**Aplicación:** WikIAmochi (`com.wikiamochi.app`)  
**Desarrollador:** VicThor Dev  
**Público objetivo:** Familias y niños (Cumplimiento de Google Play Families Policy, COPPA y RGPD-K)  
**Fecha de elaboración:** 18 de noviembre de 2026  
**Estado:** Decisión de diseño confirmada por el desarrollador.

---

## 1. Resumen Ejecutivo de Recogida y Uso de Datos

| Pregunta de Google Play Console | Respuesta Oficial | Justificación Técnica y Legal |
| :--- | :--- | :--- |
| **¿La aplicación recoge o comparte algún tipo de dato de usuario?** | **SÍ (con restricciones estrictas para familias)** | Solo se procesa voz efímera si un adulto la activa expresamente. |
| **¿Todos los datos que recoge la aplicación se cifran en tránsito?** | **SÍ** | Cualquier petición HTTP externa (solo cuando un adulto activa el modo online o el servicio de transcripción de Google) utiliza TLS/HTTPS. |
| **¿La app está sujeta a las Políticas de Familias de Google Play?** | **SÍ** | La aplicación está diseñada específicamente para niños, no incluye publicidad, no contiene compras integradas (IAP) y no utiliza SDKs de analítica o rastreo. |
| **¿Permite a los usuarios solicitar la eliminación de datos?** | **SÍ** | Todos los datos locales (conceptos aprendidos, configuración, PIN) se borran al desinstalar la app o al pulsar "Borrar datos" en Ajustes de Android. |

---

## 2. Sección Detallada de Audio y Micrófono

### 2.1 Política y Decisión de Activación
* **Estado predeterminado:** **DESACTIVADO POR DEFECTO.**
* **Requisito de control parental:** El botón del micrófono permanece bloqueado (con candado visual `🔒`). El niño **no puede activar el micrófono por sí mismo**.
* **Acción exclusiva del adulto:** Solo un adulto (padre, madre o tutor) puede activar el reconocimiento de voz desde la Zona de Familias tras superar la puerta parental protegida por PIN.
* **Permiso del sistema:** El permiso `android.permission.RECORD_AUDIO` **nunca se solicita al sistema operativo en el primer inicio de la app**, sino única y exclusivamente en el instante en que el adulto decide activarlo en el panel de Ajustes.
* **Derecho de revocación:** El adulto puede desactivar el micrófono en cualquier momento desde los Ajustes, volviendo inmediatamente el botón al estado de bloqueo y cancelando cualquier proceso de escucha activo.

### 2.2 Tratamiento del Audio y Flujo de Red
* **Grabaciones persistentes:** **NO SE GRABAN NI SE GUARDAN AUDIOS.** WikIAmochi no almacena archivos de audio ni en el almacenamiento local ni en servidores propios.
* **Procesamiento de voz:**
  * La aplicación utiliza la API oficial de Android `android.speech.SpeechRecognizer` a través del plugin `@capacitor-community/speech-recognition`.
  * **En dispositivos con reconocimiento en el dispositivo:** Si el dispositivo Android cuenta con el modelo de voz sin conexión instalado (`SpeechRecognizer.isOnDeviceRecognitionAvailable() == true`), el audio se procesa 100% de forma local y **ningún byte de audio sale del terminal**.
  * **En dispositivos que requieren servicio de red:** Si el motor de Android no cuenta con modelo local, la transcripción a texto es delegada en el servicio oficial de voz de Google. El texto transcrito resultante se inserta en el campo de búsqueda de la enciclopedia.
* **Fines de uso:** Estrictamente **Funcionalidad de la aplicación** (permitir al niño formular su pregunta mediante la voz en lugar del teclado).

---

## 3. Inventario de Permisos Declarados en `AndroidManifest.xml`

1. `android.permission.INTERNET`: Requerido por el WebView local (`https://localhost/`) y para el modo online supervisado opcional (consultas a Vikidia).
2. `android.permission.RECORD_AUDIO`: **ÚNICO PERMISO SENSIBLE.** Apagado por defecto y controlado bajo puerta parental para transcripción efímera de voz a texto.
3. **Ausencia total de otros permisos sensibles:** No se solicita acceso a ubicación, cámara, contactos, almacenamiento externo compartido ni identificadores de publicidad (AAID).
