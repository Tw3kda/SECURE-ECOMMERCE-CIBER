package com.patrones.api.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private String cardNumber;
    private String cardholderName;
    private String expiryMonth;
    private String expiryYear;
    private String ccv; // ✅ Campo agregado
    private Double amount;
    private String currency;
    private String items;
    private String direccion;
    private boolean usedCoupon;
    private String clientDataId; // ✅ String para UUID de Keycloak
}