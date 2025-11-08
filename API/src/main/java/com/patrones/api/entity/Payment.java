package com.patrones.api.entity;

import java.time.LocalDateTime;


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

    // Datos de la tarjeta
    private String cardBin;
    private String cardLast4;

    // Datos de la transacción
    private Double amount;
    private String currency;
    private String items;
    private String direccion;
    private boolean usedCoupon;

    // Relación con ClientData (mantener para foreign key)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_data_id")
    private ClientData clientData;

    // UUID de Keycloak (nuevo campo)
    @Column(name = "client_uid")
    private String clientUid;

    private LocalDateTime fechaPago;
}