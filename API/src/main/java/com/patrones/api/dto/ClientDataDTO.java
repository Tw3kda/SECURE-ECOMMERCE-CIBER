package com.patrones.api.dto;

public class ClientDataDTO {
    private Long id;
    private String uid;
    private byte[] imagen;
    private boolean usoCodigoDescuento;

    public ClientDataDTO() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }

    public byte[] getImagen() { return imagen; }
    public void setImagen(byte[] imagen) { this.imagen = imagen; }

    public boolean isUsoCodigoDescuento() { return usoCodigoDescuento; }
    public void setUsoCodigoDescuento(boolean usoCodigoDescuento) { 
        this.usoCodigoDescuento = usoCodigoDescuento; 
    }
}