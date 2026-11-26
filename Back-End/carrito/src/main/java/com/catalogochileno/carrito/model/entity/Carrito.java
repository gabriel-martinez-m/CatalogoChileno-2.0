package com.catalogochileno.carrito.model.entity;

import com.catalogochileno.carrito.model.enums.EstadoCarrito;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad principal del carrito de compras (usuario registrado o invitado).
 */
@Entity
@Table(name = "carrito")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCarrito;

    private Long idUsuarioRef;

    private String tokenSesionInvitado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCarrito estado = EstadoCarrito.ACTIVO;

    @OneToMany(mappedBy = "carrito", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("carrito")
    private List<ItemCarrito> items = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    private LocalDateTime fechaActualizacion;

    @PreUpdate
    public void alActualizar() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    // --- GETTERS Y SETTERS EXPLÍCITOS (Compatibilidad Java 21) ---

    public Long getIdCarrito() {
        return idCarrito;
    }

    public void setIdCarrito(Long idCarrito) {
        this.idCarrito = idCarrito;
    }

    public Long getIdUsuarioRef() {
        return idUsuarioRef;
    }

    public void setIdUsuarioRef(Long idUsuarioRef) {
        this.idUsuarioRef = idUsuarioRef;
    }

    public String getTokenSesionInvitado() {
        return tokenSesionInvitado;
    }

    public void setTokenSesionInvitado(String tokenSesionInvitado) {
        this.tokenSesionInvitado = tokenSesionInvitado;
    }

    public EstadoCarrito getEstado() {
        return estado;
    }

    public void setEstado(EstadoCarrito estado) {
        this.estado = estado;
    }

    public List<ItemCarrito> getItems() {
        return items;
    }

    public void setItems(List<ItemCarrito> items) {
        this.items = items;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    // --- MÉTODOS DE NEGOCIO SEGÚN UML ---

    /**
     * Calcula la suma total de los subtotales de todos los ítems contenidos.
     */
    public Integer calcularMontoTotal() {
        return items.stream()
                .mapToInt(ItemCarrito::calcularSubtotal)
                .sum();
    }

    /**
     * Vacía todos los ítems contenidos en el carrito.
     */
    public void vaciar() {
        this.items.clear();
        this.fechaActualizacion = LocalDateTime.now();
    }

    /**
     * Cambia el estado del carrito a procesado tras generar una orden de compra.
     */
    public void marcarComoProcesado() {
        this.estado = EstadoCarrito.CONVERTIDO_EN_ORDEN;
        this.fechaActualizacion = LocalDateTime.now();
    }
}
