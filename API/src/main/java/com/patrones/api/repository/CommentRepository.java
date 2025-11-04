// src/main/java/com/patrones/api/repository/CommentRepository.java
package com.patrones.api.repository;

import com.patrones.api.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByProductIdOrderByCreatedAtDesc(Long productId);
}