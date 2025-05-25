package com.ejemplo.productos;

import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public class ProductoRepositorio {
    private final Map<Long, Producto> productos = new HashMap<>();
    private long contadorId = 1;

    public List<Producto> obtenerTodos() {
        return new ArrayList<>(productos.values());
    }

    public Producto obtenerPorId(Long id) {
        return productos.get(id);
    }

    public Producto guardar(Producto producto) {
        producto.setId(contadorId++);
        actualizarEstado(producto);
        productos.put(producto.getId(), producto);
        return producto;
    }

    public Producto actualizar(Long id, Producto productoNuevo) {
        Producto existente = productos.get(id);
        if (existente != null) {
            productoNuevo.setId(id);
            actualizarEstado(productoNuevo);
            productos.put(id, productoNuevo);
            return productoNuevo;
        }
        return null;
    }

    public boolean eliminar(Long id) {
        return productos.remove(id) != null;
    }

    private void actualizarEstado(Producto producto) {
        producto.setEstado(producto.getCantidadStock() > 0 ? "Disponible" : "Agotado");
    }
}