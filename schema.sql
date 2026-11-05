
CREATE TABLE carts (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT       NULL,
  guest_token VARCHAR(64)  NULL,
  status      VARCHAR(10)  NOT NULL DEFAULT 'active',   
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT ck_carts_owner  CHECK (user_id IS NOT NULL OR guest_token IS NOT NULL),
  CONSTRAINT ck_carts_status CHECK (status IN ('active','ordered')),
  INDEX idx_carts_user  (user_id, status),
  INDEX idx_carts_guest (guest_token, status)
);


CREATE TABLE cart_items (
  id          BIGINT        PRIMARY KEY AUTO_INCREMENT,
  cart_id     BIGINT        NOT NULL,
  product_id  BIGINT        NOT NULL,
  quantity    INT           NOT NULL,
  unit_price  DECIMAL(12,0) NOT NULL,                   
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_cart    FOREIGN KEY (cart_id)    REFERENCES carts(id)    ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT uq_cart_product  UNIQUE (cart_id, product_id),
  CONSTRAINT ck_items_qty     CHECK (quantity BETWEEN 1 AND 10)
);
CREATE TABLE dbo.orders (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    recipient_name NVARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    shipping_address NVARCHAR(500) NOT NULL,
    note NVARCHAR(500) NULL,
    subtotal DECIMAL(12,0) NOT NULL,
    shipping_fee DECIMAL(12,0) NOT NULL,
    total DECIMAL(12,0) NOT NULL,
    status VARCHAR(20) NOT NULL CONSTRAINT DF_orders_status DEFAULT 'pending',
    created_at DATETIME2 NOT NULL CONSTRAINT DF_orders_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_orders_users FOREIGN KEY (user_id) REFERENCES dbo.users(id),
    CONSTRAINT CK_orders_status CHECK (status IN ('pending','confirmed','shipping','completed','cancelled'))
);
CREATE TABLE dbo.order_items (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name NVARCHAR(200) NOT NULL,
    unit NVARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,0) NOT NULL,
    line_total AS (quantity * unit_price) PERSISTED,
    CONSTRAINT FK_order_items_orders FOREIGN KEY (order_id) REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_order_items_products FOREIGN KEY (product_id) REFERENCES dbo.products(id)
);

