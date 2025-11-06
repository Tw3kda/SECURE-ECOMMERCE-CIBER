package com.patrones.api.service;

import com.patrones.api.dto.ProductDTO;
import com.patrones.api.entity.Product;
import com.patrones.api.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    // Tamaño máximo permitido: 5MB
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    // Tipos MIME permitidos
    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductDTO createProduct(String name, String description, Double price, MultipartFile imageFile) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio");
        }
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("La descripción del producto es obligatoria");
        }
        if (price == null || price <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor que cero");
        }

        Product product = new Product();
        product.setName(name.trim());
        product.setDescription(description.trim());
        product.setPrice(price);

        // Manejo de imagen
        if (imageFile != null && !imageFile.isEmpty()) {
            validateImage(imageFile);
            try {
                product.setImageData(imageFile.getBytes());
                product.setImageName(imageFile.getOriginalFilename());
                product.setImageType(imageFile.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Error al procesar la imagen", e);
            }
        }

        Product saved = productRepository.save(product);

        return toDTO(saved);
    }

    private void validateImage(MultipartFile imageFile) {
        if (!ALLOWED_TYPES.contains(imageFile.getContentType())) {
            throw new IllegalArgumentException(
                    "Tipo de imagen no permitido: " + imageFile.getContentType() +
                            ". Solo se permiten: " + String.join(", ", ALLOWED_TYPES)
            );
        }
        if (imageFile.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException(
                    "El tamaño de la imagen excede el límite de " + (MAX_IMAGE_SIZE / (1024 * 1024)) + "MB"
            );
        }
    }

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
