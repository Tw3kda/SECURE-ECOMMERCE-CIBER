package com.patrones.api.controller;

import com.patrones.api.entity.Product;
import com.patrones.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class TestController {
    
    @Autowired
    private ProductRepository productRepository;
    
    @GetMapping("/api/test/{id}")
    public ResponseEntity<?> debugProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    Map<String, Object> debugInfo = new HashMap<>();
                    debugInfo.put("id", product.getId());
                    debugInfo.put("name", product.getName());
                    debugInfo.put("imageName", product.getImageName());
                    debugInfo.put("imageType", product.getImageType());
                    debugInfo.put("hasImageData", product.getImageData() != null);
                    debugInfo.put("imageDataLength", product.getImageData() != null ? product.getImageData().length : 0);
                    return ResponseEntity.ok(debugInfo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/api/test/all")
    public ResponseEntity<?> debugAllProducts() {
        var products = productRepository.findAll();
        var debugInfo = new HashMap<>();
        
        products.forEach(product -> {
            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("id", product.getId());
            productInfo.put("name", product.getName());
            productInfo.put("imageName", product.getImageName());
            productInfo.put("imageType", product.getImageType());
            productInfo.put("hasImageData", product.getImageData() != null);
            productInfo.put("imageDataLength", product.getImageData() != null ? product.getImageData().length : 0);
            debugInfo.put("product_" + product.getId(), productInfo);
        });
        
        return ResponseEntity.ok(debugInfo);
    }
}