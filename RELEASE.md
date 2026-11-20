# Guía Oficial de Compilación y Publicación (Release) de WikIAmochi

**Aplicación:** WikIAmochi  
**Package ID:** `com.wikiamochi.app`  
**Versión inicial de producción:** `1.0.0` (versionCode: `1`)  
**Desarrollador:** VicThor Dev  

Esta guía detalla el procedimiento oficial y reproducible para compilar, firmar y verificar el paquete de publicación (Android App Bundle - `.aab`) para Google Play Store.

---

## 1. Requisitos Previos

- **JDK 21:** Configurado en la variable de entorno `JAVA_HOME` (ej: `C:\Program Files\Java\jdk-21`).
- **Android SDK:** Con `build-tools 35.0.0+` y `platform-tools` (incluyendo `apksigner` y `zipalign`).
- **Node.js:** v18 o superior con dependencias instaladas (`npm install`).

---

## 2. Generación del Keystore de Subida (Upload Keystore)

El keystore de subida debe generarse una única vez y conservarse en una ubicación segura **fuera del repositorio Git**:

```powershell
keytool -genkeypair -v -keystore wikiamochi-release.keystore -alias wikiamochi -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=VicThor Dev, OU=WikIAmochi, O=VicThor Dev, L=Madrid, ST=Madrid, C=ES"
```

> **IMPORTANTE:** Con los keystores de formato PKCS12 (predeterminado en JDK 21), la contraseña de la clave coincide con la contraseña del almacén.

---

## 3. Configuración Local de Firma (`android/keystore.properties`)

Para que Gradle firme automáticamente la compilación de release sin exponer credenciales en el código fuente, crea un archivo en `android/keystore.properties` (este archivo está estrictamente ignorado por `.gitignore`):

```properties
storeFile=../wikiamochi-release.keystore
storePassword=TU_CONTRASENA_AQUI
keyAlias=wikiamochi
keyPassword=TU_CONTRASENA_AQUI
```

*Nota:* Si el archivo `keystore.properties` no existe, Gradle compilará automáticamente una versión de release **sin firmar** (`unsigned`).

---

## 4. Compilación del Paquete de Producción (.aab)

1. **Sincronizar y compilar activos web:**
   ```powershell
   npm run build:web
   npx cap copy android
   ```

2. **Compilar el Android App Bundle con R8 y optimización de recursos:**
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
   cd android
   .\gradlew.bat bundleRelease
   ```

El artefacto generado se ubicará en:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 5. Verificación de la Firma

Para comprobar que el paquete `.aab` está correctamente firmado:

```powershell
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

O si se genera APK desde el bundletool:
```powershell
& "$env:ANDROID_HOME\build-tools\35.0.0\apksigner.bat" verify --verbose tu_archivo.apk
```

---

## 6. Prueba con Bundletool en Dispositivo Real

Para verificar el empaquetado final y la lectura del archivo enciclopédico ZIM sin compresión (`A2_DIRECT_ASSET_FD`):

```powershell
java -jar tools/bundletool.jar build-apks --bundle=android/app/build/outputs/bundle/release/app-release.aab --output=tools/app-release.apks --mode=default
java -jar tools/bundletool.jar install-apks --apks=tools/app-release.apks
```

---

## 7. Subida a Google Play Console

1. Acceder a [Google Play Console](https://play.google.com/console).
2. Seleccionar la aplicación **WikIAmochi** -> **Producción** (o **Pruebas cerradas / abiertas**).
3. Crear nueva versión y subir `app-release.aab`.
4. Asignar nombre de versión: `1.0.0 (1)`.
5. Pegar las notas de versión desde `docs/store/ficha_play_store.md`.
6. Enviar a revisión.
