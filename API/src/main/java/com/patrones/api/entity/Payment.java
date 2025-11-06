package com.patrones.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String uid;

    @Column(nullable = false, unique = true)
    private String idCompra;

    @Lob
    private String items;

    @Column(nullable = false)
    private Double amount;

    @Column(length = 3, nullable = false)
    private String currency;

    @Column(nullable = false)
    private LocalDateTime fechaPago;

    @Lob
    private String direccion;

    @Column(length = 6, name = "card_first6")
    private String cardNumberFirst6;

    @Column(length = 4, name = "card_last4")
    private String cardNumberLast4;

    @Column(name = "cardholder_name")
    private String cardholderName;

    private String transactionId;
    private String paymentStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_data_id")
    private ClientData clientData;

    public Payment() {
        this.idCompra = UUID.randomUUID().toString();
        this.fechaPago = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }

    public String getIdCompra() { return idCompra; }
    public void setIdCompra(String idCompra) { this.idCompra = idCompra; }

    public String getItems() { return items; }
    public void setItems(String items) { this.items = items; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getCardNumberFirst6() { return cardNumberFirst6; }
    public void setCardNumberFirst6(String cardNumberFirst6) { this.cardNumberFirst6 = cardNumberFirst6; }

    public String getCardNumberLast4() { return cardNumberLast4; }
    public void setCardNumberLast4(String cardNumberLast4) { this.cardNumberLast4 = cardNumberLast4; }

    public String getCardholderName() { return cardholderName; }
    public void setCardholderName(String cardholderName) { this.cardholderName = cardholderName; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public ClientData getClientData() { return clientData; }
    public void setClientData(ClientData clientData) { this.clientData = clientData; }
}