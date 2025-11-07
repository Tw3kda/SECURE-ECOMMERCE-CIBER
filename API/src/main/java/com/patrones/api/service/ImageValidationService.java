package com.patrones.api.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.util.Arrays;
import java.util.List;

@Service
public class ImageValidationService {

    // 🔒 Configuración del escáner antivirus
    private static final String CLAMAV_HOST = "clamav";
    private static final int CLAMAV_PORT = 3310;
    private static final int SOCKET_TIMEOUT = 5000; // 5 segundos

    // 📏 Configuración de imagen
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
    );

    /**
     * Valida tipo, tamaño y escanea con ClamAV.
     */
    public void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return; // Imagen opcional
        }

        // 🧩 Validar tipo MIME
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Tipo de imagen no permitido: " + contentType
            );
        }

        // 📦 Validar tamaño
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "La imagen excede el tamaño máximo permitido de 5MB"
            );
        }

        // 🦠 Escanear con ClamAV
        try {
            byte[] imageData = file.getBytes();
            String clamResponse = scanWithClamAV(imageData);

            if (!clamResponse.contains("OK")) {
                String virusMessage = extractVirusMessage(clamResponse);
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La imagen contiene código malicioso: " + virusMessage
                );
            }
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al procesar la imagen: " + e.getMessage(),
                    e
            );
        }
    }

    /**
     * Envía los bytes de la imagen al socket de ClamAV para escaneo.
     */
    private String scanWithClamAV(byte[] data) throws IOException {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(CLAMAV_HOST, CLAMAV_PORT), SOCKET_TIMEOUT);
            socket.setSoTimeout(SOCKET_TIMEOUT);

            try (OutputStream out = socket.getOutputStream();
                 BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

                // Iniciar stream de ClamAV
                out.write("zINSTREAM\0".getBytes());
                try (ByteArrayInputStream bis = new ByteArrayInputStream(data)) {
                    byte[] buffer = new byte[2048];
                    int read;
                    while ((read = bis.read(buffer)) >= 0) {
                        out.write(ByteBuffer.allocate(4).putInt(read).array());
                        out.write(buffer, 0, read);
                    }
                }

                // Indicar fin del stream
                out.write(ByteBuffer.allocate(4).putInt(0).array());
                out.flush();

                String response = in.readLine();
                return response != null ? response.trim() : "";
            }
        } catch (IOException e) {
            throw new IOException("Error al conectar o comunicarse con ClamAV: " + e.getMessage(), e);
        }
    }

    /**
     * Extrae el mensaje de virus de la respuesta de ClamAV.
     * Ejemplo: "stream: Eicar-Test-Signature FOUND" → "Eicar-Test-Signature FOUND"
     */
    private String extractVirusMessage(String clamResponse) {
        if (clamResponse == null || !clamResponse.contains(":")) {
            return clamResponse != null ? clamResponse : "Desconocido";
        }
        String[] parts = clamResponse.split(":", 2);
        return parts[1].trim();
    }
}
