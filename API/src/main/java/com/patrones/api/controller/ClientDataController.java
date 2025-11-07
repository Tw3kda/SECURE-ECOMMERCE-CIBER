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
     * 📤 Crear nuevo registro de cliente con imagen opcional y correo
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
                // ✅ Validar con ClamAV
                imageValidationService.validateImage(imagen);
                imageBytes = imagen.getBytes();
            }

            // Guardar en DB
            ClientData entity = new ClientData();
            entity.setUid(uid);
            entity.setCorreo(correo);
            entity.setImagen(imageBytes); // puede ser null
            entity.setUsoCodigoDescuento(usoCodigoDescuento);

            ClientData saved = clientDataRepository.save(entity);

            return ResponseEntity.ok(convertToDTO(saved));

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error al leer la imagen: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creando ClientData: " + e.getMessage());
        }
    }

    /**
     * 🔍 Obtener los datos de un cliente por UID
     */
    @GetMapping("/{uid}")
    public ResponseEntity<?> getClientDataByUid(@PathVariable String uid) {
        List<ClientData> list = clientDataRepository.findByUid(uid);
        if (list.isEmpty()) return ResponseEntity.notFound().build();

        List<ClientDataDTO> dtos = list.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

   

    private ClientDataDTO convertToDTO(ClientData entity) {
        ClientDataDTO dto = new ClientDataDTO();
        dto.setId(entity.getId());
        dto.setUid(entity.getUid());
        dto.setCorreo(entity.getCorreo()); // <-- correo incluido
        dto.setImagen(entity.getImagen()); // opcional
        dto.setUsoCodigoDescuento(entity.isUsoCodigoDescuento());
        return dto;
    }
}
