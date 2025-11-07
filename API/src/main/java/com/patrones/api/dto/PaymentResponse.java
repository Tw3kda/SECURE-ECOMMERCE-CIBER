package com.patrones.api.dto;

import lombok.Data;

@Data
public class PaymentResponse {
    private String transactionId;
    private String status;
    private String token;
    private String cardBin; // first 6
    private String cardLast4; // last 4
    private String cardholderName;
    private String expiryMonth;
    private String expiryYear;
    private boolean usedCoupon;
}
