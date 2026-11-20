# Reglas de optimización y ofuscación de ProGuard / R8 para WikIAmochi

# 1. Preservar Clases y Métodos de Capacitor
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin
-keep public class * extends com.getcapacitor.Bridge
-keep public class * extends com.getcapacitor.BridgeActivity

# 2. Preservar interfaces de JavaScript y anotaciones de plugins
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
    @com.getcapacitor.PluginMethod <methods>;
}

# 3. Plugins Comunitarios Oficiales (Voz y Reconocimiento)
-keep class com.getcapacitor.community.speechrecognition.** { *; }
-keep class com.getcapacitor.community.tts.** { *; }
-keep class androidx.core.splashscreen.** { *; }

# 4. Atributos esenciales para depuración y trazas seguras
-keepattributes *Annotation*,Exceptions,InnerClasses,Signature,SourceFile,LineNumberTable
-dontwarn com.getcapacitor.**
