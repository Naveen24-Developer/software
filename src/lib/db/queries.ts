import { pool } from './connection';
import type { Customer, Product, Order, OrderItem, Vehicle, CustomerFormData, ProductFormData, OrderFormData } from './schema';

// Customer queries
export async function getCustomers(): Promise<Customer[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM customers ORDER BY created_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO customers (name, phone, address, aadhar, referred_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.name, data.phone, data.address, data.aadhar, data.referred_by]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateCustomer(id: string, data: CustomerFormData): Promise<Customer> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE customers SET name = $1, phone = $2, address = $3, aadhar = $4, referred_by = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [data.name, data.phone, data.address, data.aadhar, data.referred_by, id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM customers WHERE id = $1', [id]);
    return true;
  } finally {
    client.release();
  }
}

// Product queries
export async function getProducts(): Promise<Product[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM products ORDER BY name');
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO products (name, quantity, rate, rate_unit) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.quantity, data.rate, data.rate_unit]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateProduct(id: string, data: ProductFormData): Promise<Product> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE products SET name = $1, quantity = $2, rate = $3, rate_unit = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [data.name, data.quantity, data.rate, data.rate_unit, id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM products WHERE id = $1', [id]);
    return true;
  } finally {
    client.release();
  }
}

// Vehicle queries
export async function getVehicles(): Promise<Vehicle[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM vehicles ORDER BY number');
    return result.rows;
  } finally {
    client.release();
  }
}

// Order queries
export async function getOrders(): Promise<Order[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.address as customer_address
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `);
    
    const orders = result.rows.map(row => ({
      ...row,
      customer: {
        id: row.customer_id,
        name: row.customer_name,
        phone: row.customer_phone,
        address: row.customer_address
      }
    }));
    
    return orders;
  } finally {
    client.release();
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const client = await pool.connect();
  try {
    const orderResult = await client.query(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.address as customer_address
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1
    `, [id]);
    
    if (!orderResult.rows[0]) return null;
    
    const itemsResult = await client.query(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.rate as product_default_rate
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);
    
    const order = {
      ...orderResult.rows[0],
      customer: {
        id: orderResult.rows[0].customer_id,
        name: orderResult.rows[0].customer_name,
        phone: orderResult.rows[0].customer_phone,
        address: orderResult.rows[0].customer_address
      },
      items: itemsResult.rows.map(item => ({
        ...item,
        product: {
          id: item.product_id,
          name: item.product_name,
          rate: item.product_default_rate
        }
      }))
    };
    
    return order;
  } finally {
    client.release();
  }
}

export async function createOrder(data: OrderFormData): Promise<Order> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Calculate price details
    const price = data.items.reduce((total, item) => {
      return total + (item.quantity * item.rent_rate * item.number_of_days);
    }, 0);
    
    let discountAmount = 0;
    if (data.discount_type === 'fixed') {
      discountAmount = data.discount_value || 0;
    } else if (data.discount_type === 'percentage') {
      discountAmount = price * ((data.discount_value || 0) / 100);
    }
    
    const total = price - discountAmount + (data.delivery_charge || 0);
    const remainingAmount = total - (data.initial_paid || 0);
    
    // Generate order ID
    const orderIdResult = await client.query('SELECT COUNT(*) FROM orders');
    const orderCount = parseInt(orderIdResult.rows[0].count);
    const orderId = `ORD${(orderCount + 1).toString().padStart(3, '0')}`;
    
    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (
        id, customer_id, delivery_address, pickup_required, vehicle_id, remarks,
        discount_type, discount_value, delivery_charge, payment_method, initial_paid,
        price, discount_amount, total, remaining_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      orderId, data.customer_id, data.delivery_address, data.pickup_required, 
      data.vehicle_id, data.remarks, data.discount_type, data.discount_value,
      data.delivery_charge, data.payment_method, data.initial_paid,
      price, discountAmount, total, remainingAmount
    ]);
    
    // Create order items
    for (const item of data.items) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, quantity, product_rate, rent_rate, number_of_days)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [orderId, item.product_id, item.quantity, item.product_rate, item.rent_rate, item.number_of_days]);
    }
    
    await client.query('COMMIT');
    return orderResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Analytics queries
export async function getRevenueByPeriod(startDate: string, endDate: string): Promise<number> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE created_at BETWEEN $1 AND $2 AND status != $3',
      [startDate, endDate, 'Cancelled']
    );
    return parseFloat(result.rows[0].revenue);
  } finally {
    client.release();
  }
}

export async function getOrderCountByPeriod(startDate: string, endDate: string): Promise<number> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT COUNT(*) as count FROM orders WHERE created_at BETWEEN $1 AND $2',
      [startDate, endDate]
    );
    return parseInt(result.rows[0].count);
  } finally {
    client.release();
  }
}