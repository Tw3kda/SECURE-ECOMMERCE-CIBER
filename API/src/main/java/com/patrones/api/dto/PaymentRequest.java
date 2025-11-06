package com.patrones.api.dto;

public class PaymentRequest {
    private String items;
    private Double amount;
    private String currency;
    private String direccion;
    private String cardNumber;
    private String cardholderName;
    private String expiryDate;
    private String cvv;
    private Long clientDataId;

    // Constructor por defecto
    public PaymentRequest() {}

    // Getters y Setters
    public String getItems() { return items; }
    public void setItems(String items) { this.items = items; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getCardholderName() { return cardholderName; }
    public void setCardholderName(String cardholderName) { this.cardholderName = cardholderName; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }

    public Long getClientDataId() { return clientDataId; }
    public void setClientDataId(Long clientDataId) { this.clientDataId = clientDataId; }
}