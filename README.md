# 🌟 WikIAmochi - Enciclopedia Tamagotchi Autónoma

> **Una experiencia interactiva y educativa diseñada para niños.**  
> 100% Autónoma, Segura y Offline por defecto con física de gelatina 2.5D, voz de caricatura Web Audio y enciclopedia infantil.

---

## 🎯 Arquitectura de Código Único (Windows + Android)

WikIAmochi está diseñado bajo el principio de **Single Source of Truth (Fuente Única de la Verdad)**:
- **`resources/app/`**: Contiene el 100% del código de la aplicación (Canvas HTML5, físicas del slime, sintetizador procedimental de voz, cerebro infantil y base de conocimiento).
- **Cualquier mejora o cambio realizado en `resources/app/` se refleja inmediatamente tanto en la versión de Windows como en la de Android.**

---

## 🖥️ Ejecución en Windows

Para desarrollo o ejecución directa:
```bash
npm start
```
O simplemente haciendo doble clic sobre el ejecutable:
```text
Gloop Enciclopedia.exe
```

---

## 📱 Compilación para Android (Google Play Store)

El proyecto utiliza **Capacitor** para empaquetar el código compartido en una app nativa de Android de alto rendimiento:

1. **Instalar dependencias de desarrollo:**
   ```bash
   npm install
   ```

2. **Inicializar y sincronizar la plataforma Android:**
   ```bash
   npx cap add android
   npx cap sync android
   ```

3. **Abrir en Android Studio para generar el APK / AAB:**
   ```bash
   npx cap open android
   ```

---

## 🔒 Privacidad y Modo 100% Offline
- **Modo Offline:** Por defecto, WikIAmochi consulta la enciclopedia local sin tocar internet.
- **PIN de 4 dígitos (Opcional):** Permite a los padres bloquear el paso a Modo Online Híbrido mediante el candado superior (`🔓` / `🔒`).

