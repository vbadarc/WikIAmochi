# Respuestas Oficiales para el Formulario de Seguridad de los Datos (Data Safety) en Google Play Console

**Aplicación:** WikIAmochi (`com.wikiamochi.app`)  
**Versión:** 1.0.0  
**Desarrollador:** VicThor Dev  
**Fecha:** Noviembre 2026  

Este documento recoge las respuestas exactas, campo por campo, que deben marcarse en la sección **Seguridad de los datos** de Google Play Console, basadas estrictamente en la auditoría del código fuente y el comportamiento de la app en Android.

---

## 1. Recopilación y Seguridad de Datos

### ¿Tu aplicación recopila o comparte alguno de los tipos de datos de usuario obligatorios?
- **Respuesta:** **SÍ**.
- *Nota técnica:* Aunque WikIAmochi no recopila datos para sus propios servidores, la delegación del reconocimiento de voz en el servicio del sistema Android (`SpeechRecognizer` de Google) puede implicar la transmisión de clips de audio para su procesamiento por parte de Google si el dispositivo carece de paquetes offline.

### ¿Se cifran en tránsito todos los datos de usuario que recopila tu aplicación?
- **Respuesta:** **SÍ**.
- *Explicación:* Tanto las conexiones HTTPS con Vikidia (cuando se activa el modo online) como las conexiones seguras de Google Speech Services utilizan TLS/HTTPS cifrado en tránsito.

### ¿Ofreces a los usuarios una forma de solicitar que se eliminen sus datos?
- **Respuesta:** **SÍ**.
- *Mecanismo:* La aplicación incluye en los ajustes de adultos el botón directo "🗑️ Borrar todos los datos de la app" que restablece la memoria, preferencias y PIN. Además, los usuarios pueden solicitar asistencia directa por correo a `vjbadenassepe@gmail.com`.

---

## 2. Tipos de Datos Específicos

### Categoría: Audio (Voz o grabaciones de sonido)
- **¿Se recopilan datos de audio?** **SÍ** (a través de `android.permission.RECORD_AUDIO` al pulsar el botón del micrófono).
- **¿Se comparten datos de audio?** **SÍ** (se transmiten a los Servicios de Voz de Google para la transcripción texto-a-voz en caso de procesamiento en la nube).
- **¿Es obligatoria la recopilación de audio o los usuarios pueden decidir si se recopila?**
  - **Los usuarios pueden decidir si se recopila:** Los usuarios pueden utilizar la app escribiendo sus preguntas con el teclado sin necesidad de usar el micrófono jamás.
- **Finalidades de la recopilación de audio:**
  - **Funcionalidad de la aplicación:** Permitir a los niños hacer preguntas hablando.

### Categoría: Ubicación
- **¿Se recopila o comparte?** **NO**.

### Categoría: Información personal (Nombre, email, dirección, teléfono)
- **¿Se recopila o comparte?** **NO**.

### Categoría: Información financiera
- **¿Se recopila o comparte?** **NO**.

### Categoría: Salud y actividad física
- **¿Se recopila o comparte?** **NO**.

### Categoría: Mensajes
- **¿Se recopila o comparte?** **NO**.

### Categoría: Fotos y vídeos
- **¿Se recopila o comparte?** **NO**.

### Categoría: Archivos y documentos
- **¿Se recopila o comparte?** **NO**.

### Categoría: Calendario
- **¿Se recopila o comparte?** **NO**.

### Categoría: Contactos
- **¿Se recopila o comparte?** **NO**.

### Categoría: Actividad en aplicaciones (Páginas vistas, toques, interacciones)
- **¿Se recopila o comparte?** **NO** (no hay analíticas de terceros ni Firebase).

### Categoría: Navegación web
- **¿Se recopila o comparte?** **NO**.

### Categoría: Información y rendimiento de la app (Registros de fallos, diagnósticos)
- **¿Se recopila o comparte?** **NO**.

### Categoría: Identificadores de dispositivo u otros IDs
- **¿Se recopila o comparte?** **NO** (la app no utiliza `AD_ID` ni genera GUIDs persistentes para rastreo).

---

## 3. Prácticas de Privacidad para Menores y Familias

- **¿La aplicación se adhiere a la Política de Familias de Google Play?** **SÍ**.
- **¿La aplicación incluye SDKs de anuncios no aprobados para Familias?** **NO** (cero SDKs de anuncios).
- **Enlace a la Política de Privacidad:**  
  `https://vbadarc.github.io/WikIAmochi/politica-privacidad.html`
