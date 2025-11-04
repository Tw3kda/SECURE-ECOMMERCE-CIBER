// src/main/java/com/patrones/api/controller/ProductController.java
package com.patrones.api.controller;

import com.patrones.api.dto.ProductDTO;
import com.patrones.api.dto.CommentDTO;
import com.patrones.api.entity.Product;
import com.patrones.api.entity.Comment;
import com.patrones.api.repository.ProductRepository;
import com.patrones.api.repository.CommentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        try {
            Product product = new Product();
            product.setName(request.getName());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice());
            
            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(convertToDTO(savedProduct));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating product");
        }
    }
    
    // Todos los usuarios autenticados pueden ver productos
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<Product> products = productRepository.findAllByOrderByCreatedAtDesc();
        List<ProductDTO> productDTOs = products.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productDTOs);
    }
    
    // Agregar comentario (usuarios autenticados)
    @PostMapping("/{productId}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long productId, 
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        
        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            
            Comment comment = new Comment();
            comment.setContent(request.getContent());
            comment.setProduct(product);
            comment.setAuthor(jwt.getClaimAsString("preferred_username"));
            
            Comment savedComment = commentRepository.save(comment);
            return ResponseEntity.ok(convertToCommentDTO(savedComment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding comment");
        }
    }
    
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCreatedAt(product.getCreatedAt());
        
        // Cargar comentarios
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
    
    // Clases internas para requests
    public static class ProductRequest {
        private String name;
        private String description;
        private Double price;
        
        // Getters y Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
    }
    
    public static class CommentRequest {
        private String content;
        
        // Getters y Setters
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}