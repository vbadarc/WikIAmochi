# Checklist Final de Lanzamiento para Google Play Store - WikIAmochi

**Aplicación:** WikIAmochi (`com.wikiamochi.app`)  
**Versión:** 1.0.0 (versionCode: 1)  
**Desarrollador:** VicThor Dev (`vjbadenassepe@gmail.com`)  
**Fecha:** Noviembre 2026  

---

## 1. Bloque Técnico y Binarios

- [x] **Target SDK 36 (Android 16)** y **Min SDK 24 (Android 7.0)** configurados en Gradle.
- [x] **R8 y ProGuard activados** (`minifyEnabled true`, `shrinkResources true`).
- [x] **Lectura desacoplada de Keystore:** `keystore.properties` fuera de Git.
- [x] **Artefacto AAB generado:** `android/app/build/outputs/bundle/release/app-release.aab`.
- [x] **Manifiesto limpio de permisos invasivos:**
  - `INTERNET`: Permitido (para Vikidia online opcional).
  - `RECORD_AUDIO`: Permitido (para búsqueda por voz infantil).
  - Cero permisos de publicidad (`AD_ID` no presente).
  - Cero permisos de geolocalización o almacenamiento externo.
- [x] **Ciclo de vida optimizado:** El avatar y canvas se pausan al bloquear pantalla o pasar a segundo plano (`visibilitychange`), apagando CPU/GPU.
- [x] **Memoria y borrado total:** Botón en la Zona de Familias para limpiar `Preferences` y `localStorage` con un solo toque.

---

## 2. Bloque de Ficha de la Tienda y Gráficos

- [x] **Título:** `WikIAmochi: Sabiduría Infantil` (30 caracteres).
- [x] **Descripción breve:** 80 caracteres orientados a padres y educación.
- [x] **Descripción completa:** Redactada y honesta, sin mención a marcas registradas de terceros.
- [x] **Icono de alta resolución:** `docs/store/icon_512x512.png` (512x512 PNG sin transparencia).
- [x] **Gráfico de funciones (Feature Graphic):** `docs/store/feature_graphic_1024x500.png` (1024x500 PNG).
- [x] **Iconos adaptativos:** Foreground, background y monochrome para Android 13+.
- [x] **Categoría seleccionada:** Educación / Referencia.

---

## 3. Bloque Legal y Declaraciones de Play Console

- [x] **Política de Privacidad pública:** Publicada en `https://vbadarc.github.io/WikIAmochi/politica-privacidad.html`.
- [x] **Sección específica para Familias y Niños:** Incluida en la política de privacidad.
- [x] **Declaración de Micrófono:** Explicación transparente de que el audio puede enviarse a los servidores de Google mediante `SpeechRecognizer`.
- [x] **Declaración de Anuncios:** "NO contiene anuncios".
- [x] **Declaración de IA:** "No usa IA generativa".
- [x] **Declaración de Acceso a Apps:** Sin credenciales de pago; indicación de PIN numérico para la zona parental.
- [x] **Declaración de Seguridad de los Datos (Data Safety):** Completada campo por campo en `docs/DATA_SAFETY_RESPUESTAS.md`.
- [x] **Cuestionario IARC:** Guía de respuestas completa en `docs/CUESTIONARIO_CONTENIDO_IARC.md`.
- [ ] **[PENDIENTE-USUARIO] Estado de Comerciante de la UE:** El desarrollador debe seleccionar en Play Console entre Opción A (No comerciante) u Opción B (Comerciante) según desee o no exponer públicamente su dirección postal y teléfono en la tienda.

---

## 4. Repositorio Git y Seguridad

- [x] **`.gitignore` reforzado:** Ignora `*.keystore`, `*.jks`, `keystore.properties`, `local.properties`.
- [x] **Verificación de secretos:** Sin claves API ni credenciales privadas en el historial ni en archivos rastreados.
- [ ] **[PENDIENTE-USUARIO] Confirmación de Push a GitHub:** `git remote` verificado y a la espera de confirmación explícita del usuario para enviar la rama a `https://github.com/vbadarc/WikIAmochi`.
