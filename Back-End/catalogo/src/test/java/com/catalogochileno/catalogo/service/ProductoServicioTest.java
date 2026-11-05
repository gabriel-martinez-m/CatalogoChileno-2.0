package com.catalogochileno.catalogo.service;

import com.catalogochileno.catalogo.model.entity.Producto;
import com.catalogochileno.catalogo.model.enums.EstadoProductoEnum;
import com.catalogochileno.catalogo.model.enums.TipoMedioEnum;
import com.catalogochileno.catalogo.model.enums.TipoVentaEnum;
import com.catalogochileno.catalogo.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServicioTest {

    @Mock
    private ProductoRepositorio productoRepo;

    @Mock
    private CategoriaRepositorio categoriaRepo;

    @Mock
    private EtiquetaRepositorio etiquetaRepo;

    @Mock
    private RegionRepositorio regionRepo;

    @Mock
    private ComunaRepositorio comunaRepo;

    @InjectMocks
    private ProductoServicio productoServicio;

    private Producto productoPrueba;

    @BeforeEach
    void setUp() {
        productoPrueba = new Producto();
        productoPrueba.setId(1L);
        productoPrueba.setTitulo("Atardecer en Cuernos del Paine");
        productoPrueba.setPrecio(new BigDecimal("24990"));
        productoPrueba.setTipoMedio(TipoMedioEnum.FOTO);
        productoPrueba.setTipoVenta(TipoVentaEnum.VENTA_NORMAL);
        productoPrueba.setEstado(EstadoProductoEnum.APROBADO);
    }

    @Test
    @DisplayName("Debe retornar true cuando el producto existe y está aprobado para la venta")
    void estaDisponibleParaCompra_ProductoAprobado_RetornaTrue() {
        // Arrange
        when(productoRepo.findById(1L)).thenReturn(Optional.of(productoPrueba));

        // Act
        Boolean disponible = productoServicio.estaDisponibleParaCompra(1L);

        // Assert
        assertTrue(disponible);
        verify(productoRepo, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Debe retornar false cuando el producto existe pero no está aprobado")
    void estaDisponibleParaCompra_ProductoPendiente_RetornaFalse() {
        // Arrange
        productoPrueba.setEstado(EstadoProductoEnum.PENDIENTE_REVISION);
        when(productoRepo.findById(1L)).thenReturn(Optional.of(productoPrueba));

        // Act
        Boolean disponible = productoServicio.estaDisponibleParaCompra(1L);

        // Assert
        assertFalse(disponible);
    }

    @Test
    @DisplayName("Debe retornar false cuando el producto no existe en el catálogo")
    void estaDisponibleParaCompra_ProductoNoExiste_RetornaFalse() {
        // Arrange
        when(productoRepo.findById(999L)).thenReturn(Optional.empty());

        // Act
        Boolean disponible = productoServicio.estaDisponibleParaCompra(999L);

        // Assert
        assertFalse(disponible);
    }

    @Test
    @DisplayName("Debe cambiar el estado a APROBADO al ejecutar aprobarProducto")
    void aprobarProducto_Exitoso() {
        // Arrange
        productoPrueba.setEstado(EstadoProductoEnum.PENDIENTE_REVISION);
        when(productoRepo.findById(1L)).thenReturn(Optional.of(productoPrueba));
        when(productoRepo.save(productoPrueba)).thenReturn(productoPrueba);

        // Act
        Producto resultado = productoServicio.aprobarProducto(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(EstadoProductoEnum.APROBADO, resultado.getEstado());
        verify(productoRepo, times(1)).save(productoPrueba);
    }

    @Test
    @DisplayName("Debe lanzar excepción si se intenta obtener un producto inexistente")
    void obtenerPorId_Inexistente_LanzaExcepcion() {
        // Arrange
        when(productoRepo.findById(500L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                productoServicio.obtenerPorId(500L)
        );
        assertTrue(ex.getMessage().contains("Producto no encontrado"));
    }
}
