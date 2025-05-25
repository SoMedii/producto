package com.ejemplo.productos;

public class Producto {
    private Long id;
    private String nombre;
    private String descripcion;
    private int cantidadStock;
    private double precioUnitario;
    private String estado;

    public Producto() {}

    public Producto(Long id, String nombre, String descripcion, int cantidadStock, double precioUnitario) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.cantidadStock = cantidadStock;
        this.precioUnitario = precioUnitario;
        this.estado = cantidadStock > 0 ? "Disponible" : "Agotado";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public int getCantidadStock() { return cantidadStock; }
    public void setCantidadStock(int cantidadStock) { this.cantidadStock = cantidadStock; }
    public double getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(double precioUnitario) { this.precioUnitario = precioUnitario; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}