CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    cantidad_stock INT NOT NULL CHECK (cantidad_stock >= 0),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario > 0),
    estado VARCHAR(20) GENERATED ALWAYS AS (
        CASE WHEN cantidad_stock > 0 THEN 'Disponible' ELSE 'Agotado' END
    ) STORED
);