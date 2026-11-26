package com.catalogochileno.carrito.service;

import com.catalogochileno.carrito.client.CatalogoClienteFeign;
import com.catalogochileno.carrito.model.entity.Carrito;
import com.catalogochileno.carrito.model.entity.ItemCarrito;
import com.catalogochileno.carrito.model.enums.EstadoCarrito;
import com.catalogochileno.carrito.repository.CarritoRepositorio;
import com.catalogochileno.carrito.repository.ItemCarritoRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarritoServicioTest {

    @Mock
    private CarritoRepositorio carritoRepo;

    @Mock
    private ItemCarritoRepositorio itemRepo;

    @Mock
    private CatalogoClienteFeign catalogoFeign;

    @InjectMocks
    private CarritoServicio carritoServicio;

    private Carrito carritoExistente;

    @BeforeEach
    void setUp() {
        carritoExistente = new Carrito();
        carritoExistente.setIdCarrito(1L);
        carritoExistente.setIdUsuarioRef(1L);
        carritoExistente.setEstado(EstadoCarrito.ACTIVO);
        carritoExistente.setItems(new ArrayList<>());
    }

    @Test
    @DisplayName("Debe agregar un producto y crear el carrito si el producto está disponible en catálogo")
    void agregarItem_ProductoDisponible_CreaOCarritoYAgregaItem() {
        // Arrange
        Long idUsuario = 1L;
        Long idProducto = 10L;
        Integer cantidad = 1;
        Integer precio = 24990;

        when(catalogoFeign.validarProductoParaCompra(idProducto)).thenReturn(true);
        when(carritoRepo.findByIdUsuarioRefAndEstado(idUsuario, EstadoCarrito.ACTIVO))
                .thenReturn(Optional.of(carritoExistente));
        when(carritoRepo.save(any(Carrito.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Carrito resultado = carritoServicio.agregarItem(idUsuario, null, idProducto, cantidad, precio);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getItems().size());
        ItemCarrito itemAgregado = resultado.getItems().get(0);
        assertEquals(idProducto, itemAgregado.getIdProductoRef());
        assertEquals(1, itemAgregado.getCantidad());
        assertEquals(precio, itemAgregado.getPrecioUnitarioClp());
        assertEquals(24990, itemAgregado.calcularSubtotal());

        verify(catalogoFeign, times(1)).validarProductoParaCompra(idProducto);
        verify(carritoRepo, times(1)).save(carritoExistente);
    }

    @Test
    @DisplayName("Debe lanzar excepción y no guardar cuando el catálogo indica que el producto no está disponible")
    void agregarItem_ProductoNoDisponible_LanzaExcepcion() {
        // Arrange
        Long idUsuario = 1L;
        Long idProducto = 999L;

        when(catalogoFeign.validarProductoParaCompra(idProducto)).thenReturn(false);

        // Act & Assert
        IllegalStateException excepcion = assertThrows(IllegalStateException.class, () ->
                carritoServicio.agregarItem(idUsuario, null, idProducto, 1, 15000)
        );

        assertTrue(excepcion.getMessage().contains("no se encuentra disponible"));
        verify(catalogoFeign, times(1)).validarProductoParaCompra(idProducto);
        verify(carritoRepo, never()).save(any());
    }

    @Test
    @DisplayName("Debe mantener 1 sola licencia si el producto ya estaba en el carrito")
    void agregarItem_ProductoYaExisteEnCarrito_MantieneUnaLicencia() {
        // Arrange
        Long idUsuario = 1L;
        Long idProducto = 10L;

        ItemCarrito itemInicial = new ItemCarrito();
        itemInicial.setIdItemCarrito(100L);
        itemInicial.setCarrito(carritoExistente);
        itemInicial.setIdProductoRef(idProducto);
        itemInicial.setCantidad(1);
        itemInicial.setPrecioUnitarioClp(24990);
        carritoExistente.getItems().add(itemInicial);

        when(catalogoFeign.validarProductoParaCompra(idProducto)).thenReturn(true);
        when(carritoRepo.findByIdUsuarioRefAndEstado(idUsuario, EstadoCarrito.ACTIVO))
                .thenReturn(Optional.of(carritoExistente));
        when(carritoRepo.save(any(Carrito.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Carrito resultado = carritoServicio.agregarItem(idUsuario, null, idProducto, 1, 24990);

        // Assert
        assertEquals(1, resultado.getItems().size(), "No debe duplicar la fila del ítem");
        assertEquals(1, resultado.getItems().get(0).getCantidad(), "Debe mantener 1 sola licencia por producto");
        assertEquals(24990, resultado.getItems().get(0).calcularSubtotal());
        verify(carritoRepo, times(1)).save(carritoExistente);
    }

    @Test
    @DisplayName("Debe lanzar excepción si se intenta obtener o crear un carrito sin usuario ni token de invitado")
    void obtenerOCrearCarrito_SinIdentificador_LanzaExcepcion() {
        // Act & Assert
        IllegalArgumentException excepcion = assertThrows(IllegalArgumentException.class, () ->
                carritoServicio.obtenerOCrearCarrito(null, null)
        );

        assertEquals("Se requiere idUsuarioRef o tokenInvitado para identificar el carrito.", excepcion.getMessage());
    }

    @Test
    @DisplayName("Debe vaciar todos los ítems del carrito y guardar el cambio")
    void vaciarCarrito_Exitoso() {
        // Arrange
        ItemCarrito item = new ItemCarrito();
        item.setIdItemCarrito(1L);
        item.setIdProductoRef(5L);
        item.setCantidad(1);
        item.setPrecioUnitarioClp(10000);
        carritoExistente.getItems().add(item);

        when(carritoRepo.findById(1L)).thenReturn(Optional.of(carritoExistente));
        when(carritoRepo.save(any(Carrito.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        carritoServicio.vaciarCarrito(1L);

        // Assert
        assertTrue(carritoExistente.getItems().isEmpty());
        verify(carritoRepo, times(1)).save(carritoExistente);
    }
}
