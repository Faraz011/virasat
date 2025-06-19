-- Add order_number column to orders table if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Update existing orders without order numbers
UPDATE orders 
SET order_number = 'VIR' || EXTRACT(EPOCH FROM created_at)::bigint || LPAD((id % 1000)::text, 3, '0')
WHERE order_number IS NULL;
