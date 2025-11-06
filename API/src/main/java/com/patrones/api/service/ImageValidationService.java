package com.patrones.api.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.ByteArrayInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.ByteBuffer;

@Service
public class ImageValidationService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final String[] ALLOWED_TYPES = { "image/jpeg", "image/png", "image/webp" };

    // Configuración del host y puerto de ClamAV en Docker
    private static final String CLAMAV_HOST = "clamav";
    private static final int CLAMAV_PORT = 3310;

    public void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return; // Imagen opcional
        }

        // 1️⃣ Validar tipo MIME
        String contentType = file.getContentType();
        boolean allowed = false;
        for (String type : ALLOWED_TYPES) {
            if (type.equalsIgnoreCase(contentType)) {
                allowed = true;
                break;
            }
        }
        if (!allowed) {
            throw new ResponseStatusException(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "Tipo de imagen no permitido: " + contentType
            );
        }

        // 2️⃣ Validar tamaño
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "La imagen excede el tamaño máximo permitido de 5MB"
            );
        }

        // 3️⃣ Escaneo con ClamAV
        try {
            byte[] imageData = file.getBytes();
            String clamResponse = scanWithClamAV(imageData);

            if (!clamResponse.contains("OK")) {
                // Extraemos el mensaje de ClamAV para logs o mensaje al cliente
                String virusMessage = clamResponse.split(":")[1].trim();
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La imagen contiene código malicioso: " + virusMessage
                );
            }
        } catch (IOException e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error al procesar la imagen"
            );
        }
    }

    /**
     * Escanea los bytes de la imagen usando ClamAV via socket.
     * Devuelve el mensaje completo de ClamAV.
     */
    private String scanWithClamAV(byte[] data) {
        try (Socket socket = new Socket(CLAMAV_HOST, CLAMAV_PORT);
             OutputStream out = socket.getOutputStream();
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

            // Iniciar stream de ClamAV
            out.write("zINSTREAM\0".getBytes());
            ByteArrayInputStream bis = new ByteArrayInputStream(data);
            byte[] buffer = new byte[2048];
            int read;
            while ((read = bis.read(buffer)) >= 0) {
                out.write(ByteBuffer.allocate(4).putInt(read).array());
                out.write(buffer, 0, read);
            }
            // Indicar fin del stream
            out.write(ByteBuffer.allocate(4).putInt(0).array());

            String response = in.readLine(); // Ej: stream: OK o stream: Eicar-Test-Signature FOUND
            return response != null ? response : "";
        } catch (IOException e) {
            throw new RuntimeException("Error al conectar con ClamAV", e);
        }
    }
}
