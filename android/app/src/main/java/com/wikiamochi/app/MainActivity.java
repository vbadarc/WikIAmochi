package com.wikiamochi.app;

import android.content.pm.ApplicationInfo;
import android.content.res.AssetFileDescriptor;
import android.net.Uri;
import android.os.Bundle;
import android.os.ParcelFileDescriptor;
import android.system.Os;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "WikIAmochiZIM";
    private static final String ZIM_FILE_NAME = "vikidia_es_all_maxi_2026-09.zim";

    private AssetFileDescriptor zimAssetFd = null;
    private ParcelFileDescriptor zimParcelFd = null;
    private long zimStartOffset = 0;
    private long zimTotalLength = 0;
    private String zimAccessMode = "NONE";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        initZimDescriptor();
        installZimRangeInterceptor();
    }

    private synchronized void initZimDescriptor() {
        if (zimParcelFd != null) return;
        long t0 = System.currentTimeMillis();

        // Candidata A2: abrir AssetFileDescriptor directo sobre el asset sin comprimir (0 MB duplicados en disco)
        try {
            zimAssetFd = getAssets().openFd(ZIM_FILE_NAME);
            zimParcelFd = zimAssetFd.getParcelFileDescriptor();
            zimStartOffset = zimAssetFd.getStartOffset();
            zimTotalLength = zimAssetFd.getLength();
            zimAccessMode = "A2_DIRECT_ASSET_FD";
            Log.i(TAG, "[MODO_ZIM_ACTIVO] " + zimAccessMode + " (Lectura directa sin copia, 0 MB duplicados). Size="
                    + zimTotalLength + " bytes, Offset=" + zimStartOffset + ", Tiempo=" + (System.currentTimeMillis() - t0) + " ms");
            return;
        } catch (Exception e) {
            Log.w(TAG, "openFd directo no disponible, pasando a Alternativa B (filesDir): " + e.getMessage());
        }

        // Alternativa B (Plan de reserva): copiar una sola vez a filesDir si el asset estuviera comprimido
        try {
            File outFile = new File(getFilesDir(), ZIM_FILE_NAME);
            if (!outFile.exists() || outFile.length() < 100_000_000L) {
                try (InputStream is = getAssets().open(ZIM_FILE_NAME);
                     FileOutputStream fos = new FileOutputStream(outFile)) {
                    byte[] buf = new byte[131072];
                    int r;
                    while ((r = is.read(buf)) != -1) {
                        fos.write(buf, 0, r);
                    }
                    fos.flush();
                }
            }
            zimParcelFd = ParcelFileDescriptor.open(outFile, ParcelFileDescriptor.MODE_READ_ONLY);
            zimStartOffset = 0;
            zimTotalLength = outFile.length();
            zimAccessMode = "B_FILESDIR_COPY";
            Log.w(TAG, "[MODO_ZIM_ACTIVO] " + zimAccessMode + " (Fallback activado: copia en filesDir). Size="
                    + zimTotalLength + " bytes, Tiempo=" + (System.currentTimeMillis() - t0) + " ms");
        } catch (Exception ex) {
            Log.e(TAG, "Error abriendo ZIM en A2 y B: " + ex.getMessage(), ex);
        }
    }

    private void installZimRangeInterceptor() {
        if (getBridge() == null) return;
        getBridge().setWebViewClient(new BridgeWebViewClient(getBridge()) {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri != null && "localhost".equals(uri.getHost())) {
                    String path = uri.getPath();
                    if ("/__zim_meta__".equals(path)) {
                        initZimDescriptor();
                        String json = "{\"name\":\"" + ZIM_FILE_NAME + "\",\"size\":" + zimTotalLength
                                + ",\"mode\":\"" + zimAccessMode + "\"}";
                        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
                        Map<String, String> headers = new HashMap<>();
                        headers.put("Access-Control-Allow-Origin", "*");
                        headers.put("Cache-Control", "no-store");
                        return new WebResourceResponse("application/json", "UTF-8", 200, "OK",
                                headers, new ByteArrayInputStream(bytes));
                    } else if ("/__zim_slice__".equals(path)) {
                        initZimDescriptor();
                        if (zimParcelFd == null || zimTotalLength <= 0) {
                            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                                    null, new ByteArrayInputStream(new byte[0]));
                        }
                        try {
                            String offStr = uri.getQueryParameter("offset");
                            String lenStr = uri.getQueryParameter("length");
                            if (offStr == null || lenStr == null) {
                                return new WebResourceResponse("text/plain", "UTF-8", 400, "Bad Request",
                                        null, new ByteArrayInputStream("Missing parameters".getBytes(StandardCharsets.UTF_8)));
                            }
                            long offset = Long.parseLong(offStr);
                            int length = Integer.parseInt(lenStr);

                            // Validación de seguridad estricta:
                            // 1. offset y length deben ser no negativos.
                            // 2. tope por petición de 1 MB (1048576 bytes) para prevenir sobrecarga de memoria o ataques DoS locales.
                            // 3. offset debe estar dentro de los límites del archivo ZIM.
                            // 4. offset + length no puede ser negativo ni superar los límites del ZIM.
                            final int MAX_SLICE_BYTES = 1024 * 1024; // 1 MB
                            if (offset < 0 || length <= 0 || length > MAX_SLICE_BYTES || offset >= zimTotalLength || (offset + length) < 0) {
                                boolean isDebug = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
                                if (isDebug) {
                                    Log.w(TAG, "Petición a __zim_slice__ rechazada por límites: offset=" + offset + ", length=" + length);
                                }
                                return new WebResourceResponse("text/plain", "UTF-8", 400, "Bad Request",
                                        null, new ByteArrayInputStream("Invalid offset or length".getBytes(StandardCharsets.UTF_8)));
                            }

                            // Si offset + length supera el tamaño total del ZIM, recortamos limpiamente
                            int toRead = (int) Math.min((long) length, zimTotalLength - offset);
                            byte[] buffer = new byte[toRead];
                            int totalRead = 0;
                            while (totalRead < toRead) {
                                int n = Os.pread(zimParcelFd.getFileDescriptor(),
                                        buffer, totalRead, toRead - totalRead,
                                        zimStartOffset + offset + totalRead);
                                if (n <= 0) break;
                                totalRead += n;
                            }
                            Map<String, String> headers = new HashMap<>();
                            headers.put("Access-Control-Allow-Origin", "https://localhost");
                            headers.put("Content-Length", String.valueOf(totalRead));
                            return new WebResourceResponse("application/octet-stream", "binary", 200, "OK",
                                    headers, new ByteArrayInputStream(buffer, 0, totalRead));
                        } catch (NumberFormatException nfe) {
                            return new WebResourceResponse("text/plain", "UTF-8", 400, "Bad Request",
                                    null, new ByteArrayInputStream("Parameters must be numeric".getBytes(StandardCharsets.UTF_8)));
                        } catch (Exception e) {
                            Log.e(TAG, "Error en __zim_slice__: " + e.getMessage());
                            return new WebResourceResponse("text/plain", "UTF-8", 500, "Internal Error",
                                    null, new ByteArrayInputStream(new byte[0]));
                        }
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (url != null) {
                    String scheme = url.getScheme();
                    String host = url.getHost();
                    // Bloqueo estricto de navegación del WebView:
                    // La app corre exclusivamente en https://localhost/
                    if ("https".equalsIgnoreCase(scheme) && "localhost".equalsIgnoreCase(host)) {
                        return false; // Permitir navegación interna de la SPA
                    }
                }
                // Cualquier URL externa o esquema no permitido se bloquea dentro del WebView.
                // En fases posteriores, los enlaces aprobados pasan por puerta parental antes de abrirse en navegador externo del sistema.
                Log.w(TAG, "Navegación externa no autorizada bloqueada en WebView: " + url);
                return true;
            }
        });
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        try {
            if (zimAssetFd != null) zimAssetFd.close();
            else if (zimParcelFd != null) zimParcelFd.close();
        } catch (Exception ignored) {}
    }
}
