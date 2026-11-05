package com.catalogochileno.autenticacion.service;

import com.catalogochileno.autenticacion.client.UsuarioClienteFeign;
import com.catalogochileno.autenticacion.model.entity.Credencial;
import com.catalogochileno.autenticacion.model.enums.RolNombre;
import com.catalogochileno.autenticacion.repository.CredencialRepositorio;
import com.catalogochileno.autenticacion.repository.TokenRefrescoRepositorio;
import com.catalogochileno.autenticacion.security.JwtProveedor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutenticacionServicioTest {

    @Mock
    private CredencialRepositorio credencialRepo;

    @Mock
    private TokenRefrescoRepositorio tokenRefrescoRepo;

    @Mock
    private JwtProveedor jwtProveedor;

    @Mock
    private UsuarioClienteFeign usuarioCliente;

    @InjectMocks
    private AutenticacionServicio autenticacionServicio;

    private Credencial credencialPrueba;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        credencialPrueba = new Credencial();
        credencialPrueba.setIdCredencial(1L);
        credencialPrueba.setCorreoElectronico("cliente@test.cl");
        credencialPrueba.setContrasenaEncriptada(passwordEncoder.encode("Password123!"));
        credencialPrueba.setRol(RolNombre.ROLE_CLIENTE);
        credencialPrueba.setEstaActivo(true);
    }

    @Test
    @DisplayName("Debe autenticar exitosamente y retornar token JWT cuando las credenciales son válidas")
    void autenticar_CredencialesValidas_RetornaJwt() {
        // Arrange
        String correo = "cliente@test.cl";
        String password = "Password123!";
        String tokenAccesoEsperado = "mocked.jwt.token";
        String tokenRefrescoEsperado = "mocked.refresh.token";

        when(credencialRepo.findByCorreoElectronico(correo)).thenReturn(Optional.of(credencialPrueba));
        when(jwtProveedor.generarTokenRefresco(credencialPrueba)).thenReturn(tokenRefrescoEsperado);
        when(jwtProveedor.generarTokenAcceso(credencialPrueba)).thenReturn(tokenAccesoEsperado);

        // Act
        String token = autenticacionServicio.autenticar(correo, password);

        // Assert
        assertNotNull(token);
        assertEquals(tokenAccesoEsperado, token);
        verify(credencialRepo, times(1)).save(credencialPrueba);
        verify(tokenRefrescoRepo, times(1)).deleteByCredencial(credencialPrueba);
        verify(tokenRefrescoRepo, times(1)).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el correo no está registrado")
    void autenticar_CorreoNoExiste_LanzaExcepcion() {
        // Arrange
        String correo = "desconocido@test.cl";
        when(credencialRepo.findByCorreoElectronico(correo)).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException excepcion = assertThrows(IllegalArgumentException.class, () ->
                autenticacionServicio.autenticar(correo, "Cualquiera123!")
        );
        assertEquals("Credenciales inválidas.", excepcion.getMessage());
        verify(jwtProveedor, never()).generarTokenAcceso(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la contraseña es errónea")
    void autenticar_ContrasenaErronea_LanzaExcepcion() {
        // Arrange
        String correo = "cliente@test.cl";
        when(credencialRepo.findByCorreoElectronico(correo)).thenReturn(Optional.of(credencialPrueba));

        // Act & Assert
        IllegalArgumentException excepcion = assertThrows(IllegalArgumentException.class, () ->
                autenticacionServicio.autenticar(correo, "PasswordIncorrecta999")
        );
        assertEquals("Credenciales inválidas.", excepcion.getMessage());
        verify(jwtProveedor, never()).generarTokenAcceso(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la cuenta se encuentra desactivada")
    void autenticar_CuentaDesactivada_LanzaExcepcion() {
        // Arrange
        credencialPrueba.setEstaActivo(false);
        when(credencialRepo.findByCorreoElectronico("cliente@test.cl")).thenReturn(Optional.of(credencialPrueba));

        // Act & Assert
        IllegalStateException excepcion = assertThrows(IllegalStateException.class, () ->
                autenticacionServicio.autenticar("cliente@test.cl", "Password123!")
        );
        assertEquals("La cuenta de usuario se encuentra desactivada.", excepcion.getMessage());
    }

    @Test
    @DisplayName("Debe registrar una nueva credencial y llamar al microservicio usuario vía Feign")
    void registrar_UsuarioNuevo_LlamaFeignYGuarda() {
        // Arrange
        String correo = "nuevo@test.cl";
        String password = "NuevoPassword123!";
        when(credencialRepo.existsByCorreoElectronico(correo)).thenReturn(false);
        when(credencialRepo.save(any(Credencial.class))).thenAnswer(invocation -> {
            Credencial c = invocation.getArgument(0);
            c.setIdCredencial(99L);
            return c;
        });

        // Act
        Credencial creada = autenticacionServicio.registrar(
                correo, password, RolNombre.ROLE_CLIENTE, "Carlos Perez", "11.111.111-1", "+56911111111"
        );

        // Assert
        assertNotNull(creada);
        assertEquals(99L, creada.getIdCredencial());
        assertEquals(correo, creada.getCorreoElectronico());
        assertTrue(creada.getEstaActivo());
        verify(credencialRepo, times(1)).save(any(Credencial.class));
        verify(usuarioCliente, times(1)).crearPerfilInicial(
                eq(99L), eq("Carlos Perez"), eq("11.111.111-1"), eq("+56911111111"), eq(RolNombre.ROLE_CLIENTE)
        );
    }
}
