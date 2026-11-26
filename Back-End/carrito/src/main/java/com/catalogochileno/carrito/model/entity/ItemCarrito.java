package com.catalogochileno.carrito.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entidad que representa un producto individual agregado al carrito.
 */
@Entity
@Table(name = "item_carrito")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ItemCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idItemCarrito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_carrito", nullable = false)
    @JsonIgnoreProperties("items")
    private Carrito carrito;

    @Column(nullable = false)
    private Long idProductoRef;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Integer precioUnitarioClp;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaAgregado = LocalDateTime.now();

    // --- GETTERS Y SETTERS EXPLÍCITOS (Compatibilidad Java 21) ---

    public Long getIdItemCarrito() {
        return idItemCarrito;
    }

    public void setIdItemCarrito(Long idItemCarrito) {
        this.idItemCarrito = idItemCarrito;
    }

    public Carrito getCarrito() {
        return carrito;
    }

    public void setCarrito(Carrito carrito) {
        this.carrito = carrito;
    }

    public Long getIdProductoRef() {
        return idProductoRef;
    }

    public void setIdProductoRef(Long idProductoRef) {
        this.idProductoRef = idProductoRef;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Integer getPrecioUnitarioClp() {
        return precioUnitarioClp;
    }

    public void setPrecioUnitarioClp(Integer precioUnitarioClp) {
        this.precioUnitarioClp = precioUnitarioClp;
    }

    public LocalDateTime getFechaAgregado() {
        return fechaAgregado;
    }

    public void setFechaAgregado(LocalDateTime fechaAgregado) {
        this.fechaAgregado = fechaAgregado;
    }

    // --- MÉTODOS DE NEGOCIO SEGÚN UML ---

    /**
     * Actualiza la cantidad demandada del ítem en el carrito.
     */
    public void actualizarCantidad(Integer nuevaCantidad) {
        if (nuevaCantidad == null || nuevaCantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero.");
        }
        this.cantidad = nuevaCantidad;
    }

    /**
     * Calcula el subtotal multiplicando el precio unitario por la cantidad.
     */
    public Integer calcularSubtotal() {
        return this.precioUnitarioClp * this.cantidad;
    }
}
