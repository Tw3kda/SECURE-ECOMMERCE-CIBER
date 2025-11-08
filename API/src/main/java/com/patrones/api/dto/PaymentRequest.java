package com.patrones.api.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private String cardNumber;
    private String cardholderName;
    private String expiryMonth;
    private String expiryYear;
    private String ccv;
    private Double amount;
    private String currency;
    private String items;
    private String direccion;
    private boolean usedCoupon;
    private String clientDataId; // ✅ Mantener como String para UUID
    
}