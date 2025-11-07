package com.patrones.api.controller;

import com.patrones.api.dto.ProductDTO;
import com.patrones.api.dto.CommentDTO;
import com.patrones.api.entity.Product;
import com.patrones.api.entity.Comment;
import com.patrones.api.repository.ProductRepository;
import com.patrones.api.repository.CommentRepository;
import com.patrones.api.service.ImageValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ImageValidationService imageValidationService;

    // -----------------------------
    // Crear producto
    // -----------------------------
   // Crear producto
// -----------------------------
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("hasRole('admin')")
public ResponseEntity<?> createProduct(
        @RequestParam String name,
        @RequestParam String description,
        @RequestParam Double price,
        @RequestParam(value = "image", required = false) MultipartFile imageFile) {

    try {
        // DEBUG: Print received data
        System.out.println("=== DEBUG: CREATE PRODUCT REQUEST ===");
        System.out.println("Name: " + name);
        System.out.println("Description: " + description);
        System.out.println("Price: " + price);
        System.out.println("Image file: " + (imageFile != null ? imageFile.getOriginalFilename() : "null"));
        System.out.println("Image size: " + (imageFile != null ? imageFile.getSize() + " bytes" : "null"));
        System.out.println("Image content type: " + (imageFile != null ? imageFile.getContentType() : "null"));
        System.out.println("=====================================");

        if (name.isBlank() || description.isBlank() || price == null || price <= 0) {
            return ResponseEntity.badRequest().body("Campos inválidos: name, description o price");
        }

        Product product = new Product();
        product.setName(name.trim());
        product.setDescription(description.trim());
        product.setPrice(price);

        // Validar y escanear imagen si existe
        if (imageFile != null && !imageFile.isEmpty()) {
            imageValidationService.validateImage(imageFile);
            product.setImageName(imageFile.getOriginalFilename());
            product.setImageType(imageFile.getContentType());
            product.setImageData(imageFile.getBytes());
        }

        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(convertToDTO(savedProduct));

    } catch (ResponseStatusException e) {
        // Captura errores de validación de imagen (tipo, tamaño, virus)
          
        return ResponseEntity.status(e.getStatusCode()).body(e.getReason() + "HOLO");
      
    } catch (IOException e) {
        return ResponseEntity.badRequest().body("⚠️ Error al procesar la imagen");
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().body("⚠️ Error al crear el producto");
    }
}

    // -----------------------------
    // Obtener todos los productos
    // -----------------------------
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<Product> products = productRepository.findAllByOrderByCreatedAtDesc();
        List<ProductDTO> productDTOs = products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productDTOs);
    }

    // -----------------------------
    // Obtener imagen de producto
    // -----------------------------
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getProductImage(@PathVariable Long id) {
        return productRepository.findById(id)
                .filter(p -> p.getImageData() != null)
                .map(p -> ResponseEntity.ok()
                        .header("Content-Type", p.getImageType())
                        .body(p.getImageData()))
                .orElse(ResponseEntity.notFound().build());
    }

    // -----------------------------
    // Agregar comentario
    // -----------------------------
    @PostMapping("/{productId}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long productId,
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {

        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

            Comment comment = new Comment();
            comment.setContent(request.getContent());
            comment.setProduct(product);
            comment.setAuthor(jwt.getClaimAsString("preferred_username"));

            Comment savedComment = commentRepository.save(comment);
            return ResponseEntity.ok(convertToCommentDTO(savedComment));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("⚠️ Error al agregar comentario");
        }
    }

    // -----------------------------
    // Conversión a DTO
    // -----------------------------
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setHasImage(product.getImageData() != null);
        dto.setImageType(product.getImageType());

        List<CommentDTO> commentDTOs = commentRepository.findByProductIdOrderByCreatedAtDesc(product.getId())
                .stream()
                .map(this::convertToCommentDTO)
                .collect(Collectors.toList());

        dto.setComments(commentDTOs);
        return dto;
    }

    private CommentDTO convertToCommentDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setAuthor(comment.getAuthor());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }

    // -----------------------------
    // Eliminar comentario
    // -----------------------------
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario no encontrado"));
            
            commentRepository.delete(comment);
            return ResponseEntity.ok().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar el comentario");
        }
    }

    // -----------------------------
    // Clase interna para requests de comentario
    // -----------------------------
    public static class CommentRequest {
        private String content;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
