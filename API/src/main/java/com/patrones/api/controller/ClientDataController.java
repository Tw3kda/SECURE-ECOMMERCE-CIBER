package com.patrones.api.controller;

import com.patrones.api.entity.ClientData;
import com.patrones.api.dto.ClientDataDTO;
import com.patrones.api.repository.ClientDataRepository;
import com.patrones.api.service.ImageValidationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/client-data")
@CrossOrigin(origins = "*")
public class ClientDataController {

    @Autowired
    private ClientDataRepository clientDataRepository;

    @Autowired
    private ImageValidationService imageValidationService;

    /**
     * 📤 Crear nuevo registro de cliente con imagen validada
     */
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createClientData(
            @RequestPart("imagen") MultipartFile imagen,
            @RequestPart("usoCodigoDescuento") boolean usoCodigoDescuento,
            @AuthenticationPrincipal Jwt jwt) {

        try {
            String uid = jwt.getClaimAsString("sub");

            // ✅ Validar con ClamAV
            imageValidationService.validateImage(imagen);

            // Convertir imagen a bytes
            byte[] imageBytes = imagen.getBytes();

            // Guardar en DB
            ClientData entity = new ClientData();
            entity.setUid(uid);
            entity.setImagen(imageBytes);
            entity.setUsoCodigoDescuento(usoCodigoDescuento);

            ClientData saved = clientDataRepository.save(entity);

            // Convertir a DTO
            return ResponseEntity.ok(convertToDTO(saved));

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error al leer la imagen: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creando ClientData: " + e.getMessage());
        }
    }

    /**
     * 🔍 Obtener todos los registros del usuario autenticado
     */
    @GetMapping
    public ResponseEntity<List<ClientDataDTO>> getMyClientData(@AuthenticationPrincipal Jwt jwt) {
        String uid = jwt.getClaimAsString("sub");
        List<ClientDataDTO> list = clientDataRepository.findByUid(uid)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /**
     * 📥 Descargar la imagen guardada (como archivo)
     */
    @GetMapping("/{id}/imagen")
    public ResponseEntity<byte[]> getClientImage(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        String uid = jwt.getClaimAsString("sub");
        ClientData entity = clientDataRepository.findByIdAndUid(id, uid).orElse(null);

        if (entity == null || entity.getImagen() == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] imageBytes = entity.getImagen();

        // 🔧 Cabeceras de respuesta
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG); // o IMAGE_PNG si lo prefieres
        headers.setContentLength(imageBytes.length);
        headers.setContentDisposition(
                ContentDisposition.builder("inline").filename("imagen_" + id + ".jpg").build()
        );

        return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
    }

    private ClientDataDTO convertToDTO(ClientData entity) {
        ClientDataDTO dto = new ClientDataDTO();
        dto.setId(entity.getId());
        dto.setUid(entity.getUid());
        dto.setImagen(entity.getImagen());
        dto.setUsoCodigoDescuento(entity.isUsoCodigoDescuento());
        return dto;
    }
}
