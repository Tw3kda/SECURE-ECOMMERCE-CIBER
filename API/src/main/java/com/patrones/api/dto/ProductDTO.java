// src/main/java/com/patrones/api/dto/ProductDTO.java
package com.patrones.api.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private List<CommentDTO> comments;
    private LocalDateTime createdAt;

    // Constructor vacío (IMPORTANTE para Spring)
    public ProductDTO() {
        this.comments = new ArrayList<>();
    }

    // Constructor con parámetros
    public ProductDTO(Long id, String name, String description, Double price, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.createdAt = createdAt;
        this.comments = new ArrayList<>();
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public List<CommentDTO> getComments() { return comments; }
    public void setComments(List<CommentDTO> comments) { this.comments = comments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}