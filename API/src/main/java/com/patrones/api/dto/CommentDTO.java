// src/main/java/com/patrones/api/dto/CommentDTO.java
package com.patrones.api.dto;

import java.time.LocalDateTime;

public class CommentDTO {
    private Long id;
    private String content;
    private String author;
    private LocalDateTime createdAt;

    // Constructor vacío
    public CommentDTO() {}

    // Constructor con parámetros
    public CommentDTO(Long id, String content, String author, LocalDateTime createdAt) {
        this.id = id;
        this.content = content;
        this.author = author;
        this.createdAt = createdAt;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}