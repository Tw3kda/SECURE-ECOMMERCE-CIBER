package com.patrones.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false, unique = true)
    private String transactionId;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String token;

    @Column(name = "card_bin", length = 6)
    private String cardBin;

    @Column(name = "card_last4", length = 4)
    private String cardLast4;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(length = 255)
    private String direccion;

    @Column(length = 255)
    private String items;

    @Column(name = "used_coupon")
    private boolean usedCoupon;

    @Column(name = "client_uid", nullable = false)
    private String clientUid;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;

    @Column(name = "client_data_id")
    private Long clientDataId;

    @Column(name = "id_compra", nullable = false, unique = true)
    private Long idCompra;
}
