// src/main/java/com/patrones/api/repository/ProductRepository.java
package com.patrones.api.repository;

import com.patrones.api.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Método para obtener todos los productos ordenados por fecha de creación descendente
    List<Product> findAllByOrderByCreatedAtDesc();
    
    // También puedes agregar otros métodos útiles:
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);
}