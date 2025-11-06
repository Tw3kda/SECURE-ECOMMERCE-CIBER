package com.patrones.api.controller;

import com.patrones.api.entity.ClientData;
import com.patrones.api.dto.ClientDataDTO;
import com.patrones.api.repository.ClientDataRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/client-data")
@CrossOrigin(origins = "*")
public class ClientDataController {

    @Autowired
    private ClientDataRepository clientDataRepository;

    @PostMapping
    public ResponseEntity<?> createClientData(
            @RequestBody ClientDataDTO dto,
            @AuthenticationPrincipal Jwt jwt) {
        
        try {
            String uid = jwt.getClaimAsString("sub");
            
            // Crear manualmente sin builder
            ClientData entity = new ClientData();
            entity.setUid(uid);
            entity.setImagen(dto.getImagen());
            entity.setUsoCodigoDescuento(dto.isUsoCodigoDescuento());
            
            ClientData saved = clientDataRepository.save(entity);
            
            // Convertir a DTO manualmente
            ClientDataDTO responseDto = convertToDTO(saved);
            
            return ResponseEntity.ok(responseDto);
            
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Error creating client data");
        }
    }

    @GetMapping
    public ResponseEntity<List<ClientDataDTO>> getMyClientData(@AuthenticationPrincipal Jwt jwt) {
        String uid = jwt.getClaimAsString("sub");
        List<ClientDataDTO> list = clientDataRepository.findByUid(uid)
                .stream()
                .map(this::convertToDTO) // ✅ Ahora el método existe
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientDataDTO> getClientDataById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        
        String uid = jwt.getClaimAsString("sub");
        ClientData entity = clientDataRepository.findByIdAndUid(id, uid).orElse(null);
        
        if (entity == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(convertToDTO(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClientData(
            @PathVariable Long id,
            @RequestBody ClientDataDTO dto,
            @AuthenticationPrincipal Jwt jwt) {
        
        try {
            String uid = jwt.getClaimAsString("sub");
            ClientData existing = clientDataRepository.findByIdAndUid(id, uid).orElse(null);
            
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Actualizar campos
            existing.setImagen(dto.getImagen());
            existing.setUsoCodigoDescuento(dto.isUsoCodigoDescuento());
            
            ClientData updated = clientDataRepository.save(existing);
            return ResponseEntity.ok(convertToDTO(updated));
            
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Error updating client data");
        }
    }

    // ✅ MÉTODO convertToDTO AÑADIDO
    private ClientDataDTO convertToDTO(ClientData entity) {
        ClientDataDTO dto = new ClientDataDTO();
        dto.setId(entity.getId());
        dto.setUid(entity.getUid());
        dto.setImagen(entity.getImagen());
        dto.setUsoCodigoDescuento(entity.isUsoCodigoDescuento());
        return dto;
    }
}