# Declaraciones de Google Play Console para WikIAmochi

**Aplicación:** WikIAmochi (`com.wikiamochi.app`)  
**Desarrollador:** VicThor Dev (`vjbadenassepe@gmail.com`)  
**Versión:** 1.0.0  

Este documento proporciona las respuestas formales para todas las declaraciones obligatorias en el panel de **Contenido de la aplicación** en Google Play Console:

---

## 1. Público Objetivo y Contenido (Programa Familias)

- **Grupos de edad objetivo:**
  - Marcar: **5 años o menos**, **De 6 a 8 años**, **De 9 a 12 años**.
- **Atractivo para los niños:**
  - ¿Tu ficha de Play Store podría atraer a los niños de forma involuntaria?
  - Marcar: **SÍ, está diseñada expresamente para niños**.
- **Programa Diseñado para Familias:**
  - Marcar: **SÍ, participar en el Programa Diseñado para Familias**.
  - Declaración: Cumple con todas las directrices de contenido y privacidad infantil (sin SDKs no autorizados, sin publicidad, privacidad estricta).

---

## 2. Anuncios (Ads)

- **¿Tu aplicación contiene anuncios?**
  - **NO**, mi aplicación no contiene anuncios.
  - *Evidencia técnica:* El manifiesto `AndroidManifest.xml` no incluye ningún SDK de publicidad ni el permiso `com.google.android.gms.permission.AD_ID`.

---

## 3. Acceso a Aplicaciones (Credenciales de Prueba)

- **¿Todas las funciones de tu aplicación están disponibles sin restricciones especiales?**
  - **SÍ**, todas las funciones están disponibles sin credenciales.
  - *Instrucción para revisores de Google:*  
    "La aplicación es una enciclopedia escolar infantil de acceso libre. Para acceder a la Zona de Familias (Ajustes de Adultos), si no se ha configurado un PIN, el revisor puede definir libremente cualquier código de 4 dígitos (ej: 1234). En caso de olvidar el PIN, existe un botón de reto matemático que permite restablecerlo al instante."

---

## 4. Contenido Generado por Inteligencia Artificial (IA)

- **¿Tu aplicación genera contenido mediante modelos de Inteligencia Artificial generativa (LLMs externos en la nube, difusores de imagen generativa)?**
  - **NO**.
  - *Aclaración técnica:* WikIAmochi no consulta ningún modelo de lenguaje generativo como GPT, Gemini o Claude ni genera imágenes sintéticas. La inteligencia de la app consiste en un extractor semántico léxico determinista sobre artículos preexistentes de la enciclopedia escolar Vikidia y un avatar animado mediante física 2D en canvas.

---

## 5. Aplicaciones Financieras y Préstamos

- **¿Tu aplicación ofrece servicios bancarios, criptomonedas o préstamos?**
  - **NO**.

---

## 6. Estado de Comerciante de la Unión Europea (UE)

En virtud de la Ley de Servicios Digitales (DSA) de la UE, Google Play exige declarar si actúas como "Comerciante" (*Trader*) o "No comerciante" (*Non-trader*):

### Opción A: No comerciante (Recomendada si no hay monetización)
- **Definición:** Persona física que publica aplicaciones de software libre, educativas o sin ánimo de lucro, sin cobrar precio de descarga, sin suscripciones, sin compras integradas y sin monetización publicitaria.
- **Ventaja de privacidad:** No requiere mostrar públicamente tu dirección postal física ni número de teléfono personal en la ficha de Google Play; solo se muestra el correo de contacto (`vjbadenassepe@gmail.com`).

### Opción B: Comerciante (Trader)
- **Definición:** Cualquier entidad o persona que actúe en el marco de su actividad comercial, industrial, artesanal o profesional.
- **Requisito legal:** Obliga a mostrar públicamente en la ficha de Play Store el nombre fiscal, dirección física y teléfono de contacto para consumidores europeos.

> **Recomendación para WikIAmochi:** Dado que la app es 100% gratuita, libre (GPLv3) y no percibe ningún ingreso monetario, corresponde seleccionar **No comerciante (Non-trader)**. Si en el futuro se constituyera una empresa o se recibieran ingresos comerciales, se puede cambiar a Comerciante en cualquier momento.
