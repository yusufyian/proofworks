import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'scf_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function initializeDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    // Create tables if not exist
    await createTables();
    logger.info('Database tables initialized');
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('core_enterprise', 'supplier', 'bank', 'admin')),
        company_name VARCHAR(255),
        company_code VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Certificates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        certificate_id VARCHAR(100) UNIQUE NOT NULL,
        original_certificate_id VARCHAR(100),
        creditor_id UUID NOT NULL REFERENCES users(id),
        debtor_id UUID NOT NULL REFERENCES users(id),
        initial_amount DECIMAL(20, 2) NOT NULL,
        remaining_amount DECIMAL(20, 2) NOT NULL,
        issue_date TIMESTAMP NOT NULL,
        expiry_date TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'holding' 
          CHECK (status IN ('holding', 'transferred', 'pledged', 'redeemed', 'expired')),
        contract_hash VARCHAR(255),
        invoice_hash VARCHAR(255),
        signature VARCHAR(500),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Certificate transfers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificate_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        certificate_id UUID NOT NULL REFERENCES certificates(id),
        from_user_id UUID NOT NULL REFERENCES users(id),
        to_user_id UUID NOT NULL REFERENCES users(id),
        transfer_amount DECIMAL(20, 2) NOT NULL,
        transfer_type VARCHAR(50) NOT NULL CHECK (transfer_type IN ('full', 'split')),
        new_certificate_id UUID REFERENCES certificates(id),
        transfer_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Financing applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS financing_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        certificate_id UUID NOT NULL REFERENCES certificates(id),
        applicant_id UUID NOT NULL REFERENCES users(id),
        financier_id UUID REFERENCES users(id),
        financing_amount DECIMAL(20, 2) NOT NULL,
        financing_rate DECIMAL(5, 2),
        financing_term INTEGER,
        status VARCHAR(50) NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed', 'repaid', 'defaulted')),
        risk_score DECIMAL(5, 2),
        risk_rating VARCHAR(10),
        approval_time TIMESTAMP,
        disbursement_time TIMESTAMP,
        repayment_time TIMESTAMP,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pledges table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pledges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        certificate_id UUID NOT NULL REFERENCES certificates(id),
        pledgor_id UUID NOT NULL REFERENCES users(id),
        pledgee_id UUID NOT NULL REFERENCES users(id),
        financing_application_id UUID REFERENCES financing_applications(id),
        pledge_amount DECIMAL(20, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active'
          CHECK (status IN ('active', 'released', 'defaulted')),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        released_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Audit logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id UUID,
        ip_address VARCHAR(45),
        user_agent TEXT,
        request_data JSONB,
        response_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_certificates_creditor ON certificates(creditor_id);
      CREATE INDEX IF NOT EXISTS idx_certificates_debtor ON certificates(debtor_id);
      CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
      CREATE INDEX IF NOT EXISTS idx_certificates_expiry ON certificates(expiry_date);
      CREATE INDEX IF NOT EXISTS idx_transfers_certificate ON certificate_transfers(certificate_id);
      CREATE INDEX IF NOT EXISTS idx_financing_certificate ON financing_applications(certificate_id);
      CREATE INDEX IF NOT EXISTS idx_financing_status ON financing_applications(status);
      CREATE INDEX IF NOT EXISTS idx_pledges_certificate ON pledges(certificate_id);
      CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export { pool };
export type { PoolClient };

