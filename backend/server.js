
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

// Database connection test
pool.on('error', (err) => {
  console.error('Unexpected database error:', err)
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to User Management API'
  })
})

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')

    res.status(200).json({
      status: 'healthy',
      application: 'running',
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected'
    })
  }
})

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users ORDER BY id ASC'
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Unable to retrieve users'
    })
  }
})

// Add a user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      !name.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        error: 'Valid name and email are required'
      })
    }

    const result = await pool.query(
      `INSERT INTO users (name, email)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), email.trim()]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Email already exists'
      })
    }

    res.status(500).json({
      error: 'Unable to create user'
    })
  }
})

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'Invalid user ID'
      })
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    res.status(200).json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Unable to delete user'
    })
  }
})

// Start server
const PORT = process.env.PORT || 5000

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`)
})

// Graceful shutdown
const shutdown = () => {
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
