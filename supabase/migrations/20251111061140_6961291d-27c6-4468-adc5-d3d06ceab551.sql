-- Update default tariff in periods table
UPDATE periods SET tariff_per_year = 1000000 WHERE tariff_per_year = 300000;

-- Update default amount in payment_items table
ALTER TABLE payment_items ALTER COLUMN amount SET DEFAULT 1000000;