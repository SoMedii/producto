package com.ejemplo.productos;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/productos")
public class ProductoControlador {

    private final ProductoRepositorio repositorio;

    public ProductoControlador(ProductoRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    @GetMapping
    public List<Producto> obtenerTodos() {
        return repositorio.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        Producto producto = repositorio.obtenerPorId(id);
        return producto != null ? ResponseEntity.ok(producto) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Producto producto) {
        if (producto.getPrecioUnitario() <= 0 || producto.getCantidadStock() < 0) {
            return ResponseEntity.badRequest().body("Precio debe ser > 0 y cantidad no puede ser negativa.");
        }
        Producto creado = repositorio.guardar(producto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Producto producto) {
        if (producto.getPrecioUnitario() <= 0 || producto.getCantidadStock() < 0) {
            return ResponseEntity.badRequest().body("Precio debe ser > 0 y cantidad no puede ser negativa.");
        }
        Producto actualizado = repositorio.actualizar(id, producto);
        return actualizado != null ? ResponseEntity.ok(actualizado) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        return repositorio.eliminar(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/estadisticas")
    public Map<String, Object> estadisticas() {
        List<Producto> productos = repositorio.obtenerTodos();
        long total = productos.size();
        double promedioPrecio = productos.stream().mapToDouble(Producto::getPrecioUnitario).average().orElse(0.0);
        long disponibles = productos.stream().filter(p -> "Disponible".equals(p.getEstado())).count();
        long agotados = productos.stream().filter(p -> "Agotado".equals(p.getEstado())).count();

        Map<String, Object> estadisticas = new LinkedHashMap<>();
        estadisticas.put("totalProductos", total);
        estadisticas.put("promedioPrecios", promedioPrecio);
        estadisticas.put("productosDisponibles", disponibles);
        estadisticas.put("productosAgotados", agotados);
        return estadisticas;
    }
}