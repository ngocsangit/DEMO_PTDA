
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


