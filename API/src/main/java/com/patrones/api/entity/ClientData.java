package com.patrones.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "client_data")
public class ClientData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String uid;

    @Column(nullable = false, unique = true)
    private String correo;   // <-- nuevo campo


    @Column(columnDefinition = "BYTEA")
    private byte[] imagen;   // <-- opcional

    @Column(name = "uso_codigo_descuento", nullable = false)
    private boolean usoCodigoDescuento = false;

    // Constructor por defecto
    public ClientData() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public byte[] getImagen() { return imagen; }
    public void setImagen(byte[] imagen) { this.imagen = imagen; }

    public boolean isUsoCodigoDescuento() { return usoCodigoDescuento; }
    public void setUsoCodigoDescuento(boolean usoCodigoDescuento) { 
        this.usoCodigoDescuento = usoCodigoDescuento; 
    }
}
