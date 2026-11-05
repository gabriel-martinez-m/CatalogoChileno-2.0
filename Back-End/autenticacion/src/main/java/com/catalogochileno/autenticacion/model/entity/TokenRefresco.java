package com.catalogochileno.autenticacion.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Entidad para almacenar los Tokens de Refresco (Refresh Tokens) asociados a una credencial.
 */
@Entity
@Table(name = "token_refresco")
@Getter
@Setter
@NoArgsConstructor
public class TokenRefresco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idToken;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_credencial", nullable = false)
    private Credencial credencial;

    @Column(nullable = false)
    private Instant fechaExpiracion;

    private Boolean estaRevocado = false;

    // --- GETTERS Y SETTERS EXPLÍCITOS (Compatibilidad Java 21) ---

    public Long getIdToken() {
        return idToken;
    }

    public void setIdToken(Long idToken) {
        this.idToken = idToken;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Credencial getCredencial() {
        return credencial;
    }

    public void setCredencial(Credencial credencial) {
        this.credencial = credencial;
    }

    public Instant getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(Instant fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }

    public Boolean getEstaRevocado() {
        return estaRevocado;
    }

    public void setEstaRevocado(Boolean estaRevocado) {
        this.estaRevocado = estaRevocado;
    }

    // --- MÉTODOS DE NEGOCIO SEGÚN UML ---

    /**
     * Verifica si el token no está revocado y no ha superado su fecha de expiración.
     */
    public Boolean esValido() {
        return !this.estaRevocado && this.fechaExpiracion.isAfter(Instant.now());
    }

    /**
     * Revoca explícitamente el token de refresco (p. ej. al cerrar sesión).
     */
    public void revocar() {
        this.estaRevocado = true;
    }
}
