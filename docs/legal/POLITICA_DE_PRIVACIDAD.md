# Política de Privacidad de WikIAmochi

**Última actualización:** 19 de noviembre de 2026  
**Versión:** 1.0.0  
**Titular y Desarrollador:** VicThor Dev  
**Contacto de privacidad:** vjbadenassepe@gmail.com  
**Repositorio oficial:** https://github.com/vbadarc/WikIAmochi  
**URL de publicación en la web:** https://vbadarc.github.io/WikIAmochi/politica-privacidad.html  

---

## 1. Compromiso de Privacidad y Público Infantil

WikIAmochi es una aplicación educativa interactiva diseñada especialmente para niños de 4 a 12 años y sus familias. Cumplimos de manera estricta con:
- **RGPD (Reglamento General de Protección de Datos de la UE 2016/679)**.
- **LOPDGDD (Ley Orgánica 3/2018 española)**, reconociendo el umbral de consentimiento digital en España fijado en los **14 años** (Art. 7). Todo uso por menores de 14 años requiere la supervisión o autorización de sus padres o tutores legales.
- **COPPA (Children's Online Privacy Protection Act de EE. UU.)**.
- **Política del Programa Diseñado para Familias de Google Play**.

La aplicación se rige por el principio de **Privacidad por Defecto y Minimización de Datos**: no recopilamos, no vendemos, no compartimos ni monetizamos ningún dato personal de los menores.

---

## 2. Sección para Padres y Tutores Legales

Como padres o tutores, ustedes tienen el control absoluto sobre la experiencia de sus hijos en WikIAmochi:
- **100% Desconectada por defecto:** La app funciona con la enciclopedia escolar Vikidia integrada localmente en el dispositivo. No requiere conexión a internet para responder preguntas, mostrar imágenes ni interactuar con el personaje Mochi.
- **Zona de Familias protegida por PIN:** Cualquier cambio en la configuración (activar modo online, ver licencias o borrar la memoria) requiere un PIN de 4 números establecido por un adulto, respaldado por un reto matemático de dos cifras en caso de olvido.
- **Sin Publicidad ni Compras Integradas:** WikIAmochi no contiene anuncios de ningún tipo ni compras dentro de la aplicación.
- **Sin Identificadores de Rastreo:** La app no utiliza identificadores publicitarios (`AD_ID`), cookies de seguimiento ni herramientas de analítica o telemetría (cero Firebase Analytics, cero SDKs de terceros).

---

## 3. Uso del Micrófono y Reconocimiento de Voz

- **Permiso solicitado:** `android.permission.RECORD_AUDIO`.
- **Propósito:** Permitir al niño formular preguntas hablando en lugar de escribir con el teclado.
- **Funcionamiento bajo demanda:** El micrófono se activa **únicamente** cuando el usuario pulsa deliberadamente el botón del micrófono y se detiene automáticamente en cuanto termina la frase, o de inmediato si la pantalla se bloquea o la aplicación pasa a segundo plano.
- **Tratamiento del audio:**
  - WikIAmochi no almacena archivos de audio ni grabaciones de voz en el dispositivo ni en servidores propios.
  - La transcripción se realiza mediante el servicio del sistema Android (`SpeechRecognizer`). En la mayoría de dispositivos Android, este servicio delega en los Servicios de Voz de Google (`Google Speech Services`). Si el dispositivo no tiene instalados los paquetes de voz sin conexión, el audio puede ser transmitido temporalmente a los servidores de Google para su conversión a texto, rigiéndose por la Política de Privacidad de Google. WikIAmochi nunca tiene acceso al flujo de audio enviado a Google, recibiendo únicamente el texto transcrito.

---

## 4. Consultas en Línea (Modo Online Supervisado)

- Por defecto, la aplicación se encuentra en **Modo 100% Offline**.
- Si un adulto activa el **Modo Online Supervisado** desde la Zona de Familias:
  - Las consultas se realizan **únicamente** hacia la enciclopedia escolar infantil **Vikidia en español** (`https://es.vikidia.org`).
  - No se realizan búsquedas en Google ni en internet abierto.
  - No se envían identificadores personales, nombres ni cuentas de usuario; únicamente la palabra o concepto consultado para obtener el artículo escolar correspondiente.

---

## 5. Datos Guardados Localmente ("Memoria de la App")

Toda la información se almacena exclusivamente en la memoria local aislada (sandbox) del dispositivo mediante `Capacitor Preferences` y almacenamiento web local (`localStorage`):
1. **Preferencias cosméticas:** Color del personaje Mochi y voz seleccionada.
2. **Seguridad:** PIN de 4 números de la Zona de Familias (cifrado localmente).
3. **Historial de aprendizaje:** Lista de temas de interés consultados para sugerir nuevas lecturas infantiles.

**Ninguno de estos datos es transmitido fuera del teléfono ni accesible por otras aplicaciones.**

---

## 6. Ejercicio de Derechos y Borrado de Datos ("Derecho al Olvido")

Los padres o tutores pueden eliminar instantáneamente toda la información guardada por la aplicación en cualquier momento:
1. Acceder a la **Zona de Familias y Ajustes** introduciendo el PIN de adulto.
2. Pulsar el botón **"🗑️ Borrar todos los datos de la app"**.
3. Confirmar la acción. Esto restablece la aplicación al estado original de fábrica, eliminando de forma irreversible el PIN, la memoria de temas y las preferencias.

Asimismo, al desinstalar la aplicación desde los ajustes de Android, el sistema operativo borra automáticamente todos los datos asociados.

Para cualquier consulta legal o ejercicio de derechos de acceso, rectificación o supresión, puede contactar directamente con el desarrollador:  
**Correo electrónico:** `vjbadenassepe@gmail.com`  
**Titular:** VicThor Dev  
