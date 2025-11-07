package com.patrones.api.service;

import com.patrones.api.dto.ProductDTO;
import com.patrones.api.entity.Product;
import com.patrones.api.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ImageValidationService imageValidationService;

    public ProductService(ProductRepository productRepository, ImageValidationService imageValidationService) {
        this.productRepository = productRepository;
        this.imageValidationService = imageValidationService;
    }

    /**
     * Crea un nuevo producto validando campos y escaneando la imagen con ClamAV.
     */
    public ProductDTO createProduct(String name, String description, Double price, MultipartFile imageFile) {
        // 🧩 Validaciones básicas de campos
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre del producto es obligatorio");
        }
        if (description == null || description.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La descripción del producto es obligatoria");
        }
        if (price == null || price <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El precio debe ser mayor que cero");
        }

        Product product = new Product();
        product.setName(name.trim());
        product.setDescription(description.trim());
        product.setPrice(price);

        // 🧠 Validación y escaneo de imagen (delegado)
        if (imageFile != null && !imageFile.isEmpty()) {
            imageValidationService.validateImage(imageFile); // ✅ centralizado
            try {
                product.setImageData(imageFile.getBytes());
                product.setImageName(imageFile.getOriginalFilename());
                product.setImageType(imageFile.getContentType());
            } catch (IOException e) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Error al procesar la imagen",
                        e
                );
            }
        }

        // 💾 Guardar en base de datos
        Product saved = productRepository.save(product);

        return toDTO(saved);
    }

    /**
     * Convierte una entidad Product a DTO.
     */
    private ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setHasImage(product.getImageData() != null);
        dto.setImageType(product.getImageType());
        return dto;
    }
}
