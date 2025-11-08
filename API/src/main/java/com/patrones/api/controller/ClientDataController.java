package com.patrones.api.controller;

import com.patrones.api.dto.ClientDataDTO;
import com.patrones.api.entity.ClientData;
import com.patrones.api.repository.ClientDataRepository;
import com.patrones.api.service.ImageValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/client-data")
@CrossOrigin(origins = "*")
public class ClientDataController {

    @Autowired
    private ClientDataRepository clientDataRepository;

    @Autowired
    private ImageValidationService imageValidationService;

    /**
     * 🔍 Obtener datos por UID o crearlos si no existen
     */
    @GetMapping("/{uid}")
    public ResponseEntity<?> getOrCreateClientData(@PathVariable String uid, @AuthenticationPrincipal Jwt jwt) {
        Optional<ClientData> existing = clientDataRepository.findByUid(uid).stream().findFirst();

        if (existing.isPresent()) {
            return ResponseEntity.ok(convertToDTO(existing.get()));
        }

        // Crear automáticamente si no existe
        ClientData newData = new ClientData();
        newData.setUid(uid);
        newData.setCorreo(jwt.getClaimAsString("email"));
        newData.setUsoCodigoDescuento(false);
        clientDataRepository.save(newData);

        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(newData));
    }

    /**
     * 🧾 ✅ Endpoint para alternar el estado del cupón en tiempo real
     */
    @PutMapping("/{uid}/toggle-coupon")
    public ResponseEntity<?> toggleCoupon(@PathVariable String uid, @RequestParam boolean useCoupon) {
        Optional<ClientData> opt = clientDataRepository.findByUid(uid).stream().findFirst();

        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\":\"Cliente no encontrado\"}");
        }

        ClientData client = opt.get();
        client.setUsoCodigoDescuento(useCoupon);
        clientDataRepository.save(client);

        return ResponseEntity.ok("{\"usoCodigoDescuento\": " + client.isUsoCodigoDescuento() + "}");
    }

    /**
     * 📤 Crear nuevo registro de cliente (imagen opcional)
     */
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createClientData(
            @RequestPart("correo") String correo,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen,
            @RequestPart("usoCodigoDescuento") boolean usoCodigoDescuento,
            @AuthenticationPrincipal Jwt jwt) {

        try {
            String uid = jwt.getClaimAsString("sub");
            byte[] imageBytes = null;

            if (imagen != null && !imagen.isEmpty()) {
                imageValidationService.validateImage(imagen);
                imageBytes = imagen.getBytes();
            }

            ClientData entity = new ClientData();
            entity.setUid(uid);
            entity.setCorreo(correo);
            entity.setImagen(imageBytes);
            entity.setUsoCodigoDescuento(usoCodigoDescuento);

            ClientData saved = clientDataRepository.save(entity);
            return ResponseEntity.ok(convertToDTO(saved));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al leer la imagen: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creando ClientData: " + e.getMessage());
        }
    }

    /**
     * 🖼️ Actualizar imagen de cliente existente
     */
    @PutMapping(value = "/{uid}/image", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateClientImage(
            @PathVariable String uid,
            @RequestPart("imagen") MultipartFile imagen,
            @AuthenticationPrincipal Jwt jwt) {

        try {
            String tokenUid = jwt.getClaimAsString("sub");
            if (!tokenUid.equals(uid)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("No autorizado para modificar este usuario.");
            }

            ClientData client = clientDataRepository.findByUid(uid)
                    .stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

            if (imagen == null || imagen.isEmpty()) {
                return ResponseEntity.badRequest().body("Debe enviar una imagen válida.");
            }

            imageValidationService.validateImage(imagen);
            client.setImagen(imagen.getBytes());
            clientDataRepository.save(client);

            return ResponseEntity.ok("✅ Imagen actualizada correctamente.");

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar la imagen: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar la imagen: " + e.getMessage());
        }
    }

    /**
     * 📸 Obtener imagen de perfil (si existe)
     */
    @GetMapping("/{uid}/image")
    public ResponseEntity<byte[]> getClientImage(@PathVariable String uid) {
        Optional<ClientData> opt = clientDataRepository.findByUid(uid).stream().findFirst();

        if (opt.isPresent() && opt.get().getImagen() != null) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(opt.get().getImagen());
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * 🔄 Conversión a DTO
     */
    private ClientDataDTO convertToDTO(ClientData entity) {
        ClientDataDTO dto = new ClientDataDTO();
        dto.setId(entity.getId());
        dto.setUid(entity.getUid());
        dto.setCorreo(entity.getCorreo());
        dto.setImagen(entity.getImagen());
        dto.setUsoCodigoDescuento(entity.isUsoCodigoDescuento());
        return dto;
    }
}
