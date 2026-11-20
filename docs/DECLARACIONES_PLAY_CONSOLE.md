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
  - *Aclaración técnica:* **No usa IA generativa**. WikIAmochi no consulta ningún modelo de lenguaje generativo como GPT, Gemini o Claude ni genera imágenes sintéticas. La aplicación utiliza un extractor semántico léxico determinista sobre artículos preexistentes de la enciclopedia escolar Vikidia y un avatar animado mediante física 2D en canvas.

---

## 5. Aplicaciones Financieras y Préstamos

- **¿Tu aplicación ofrece servicios bancarios, criptomonedas o préstamos?**
  - **NO**.

---

## 6. Estado de Comerciante de la Unión Europea (UE) - Ley de Servicios Digitales (DSA)

[PENDIENTE-USUARIO: Seleccionar entre Opción A u Opción B según la situación jurídica y preferencia de privacidad del desarrollador]

Google Play exige declarar si actúas como "Comerciante" (*Trader*) o "No comerciante" (*Non-trader*) para la Unión Europea. A continuación se detallan las implicaciones y los datos que se hacen públicos en cada caso:

### Opción A: No comerciante (Non-trader)
- **Definición legal:** Persona física que publica aplicaciones de software libre, educativas o sin fines comerciales, sin percibir contraprestación económica (sin precio de descarga, sin compras integradas, sin suscripciones y sin monetización mediante publicidad).
- **Datos que se hacen públicos en la ficha de Google Play:**
  - Únicamente la dirección de correo electrónico de soporte (`vjbadenassepe@gmail.com`).
  - Nombre del desarrollador (`VicThor Dev`).
- **Ventaja:** Preserva la privacidad personal, no obligando a exponer dirección postal particular ni número de teléfono personal ante el público general.

### Opción B: Comerciante (Trader)
- **Definición legal:** Cualquier persona física o jurídica que actúe con fines relacionados con su actividad comercial, negocio, oficio o profesión (por ejemplo, autónomos, sociedades mercantiles o desarrolladores que moneticen directa o indirectamente sus apps).
- **Datos que Google Play exige verificar y hacer públicos en la ficha de la tienda:**
  - Nombre completo o razón social del titular.
  - Dirección postal física completa (calle, número, código postal, localidad, país).
  - Número de teléfono verificado.
  - Correo electrónico verificado.
- **Implicación:** Todos estos datos personales quedan visibles públicamente en la ficha de Play Store para los usuarios de la UE.

**Elección del desarrollador:**  
`[PENDIENTE-USUARIO: Confirmar si se declara como "No comerciante" o como "Comerciante"]`
