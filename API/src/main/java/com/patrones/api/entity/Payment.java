package com.patrones.api.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transactionId;
    private String status;
    private String token;

    // Datos de la tarjeta (solo lo necesario para auditoría segura)
    private String cardBin;        // Primeros 6 dígitos
    private String cardLast4;      // Últimos 4 dígitos

    // Datos de la transacción
    private Double amount;
    private String currency;
    private String items;
    private String direccion;
    private String clientDataId; // ✅ String para UUID de Keycloak

    private boolean usedCoupon;
}