
import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Get all users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await axios.get('/api/users')

      setUsers(response.data)
    } catch (err) {
      setError('Unable to fetch users. Check backend and database.')
    } finally {
      setLoading(false)
    }
  }

  // Run when component loads
  useEffect(() => {
    fetchUsers()
  }, [])

  // Add a new user
  const addUser = async (e) => {
    e.preventDefault()

    try {
      setError('')
      setMessage('')

      await axios.post('/api/users', {
        name,
        email
      })

      setName('')
      setEmail('')
      setMessage('User added successfully!')

      await fetchUsers()
    } catch (err) {
      setError(
        err.response?.data?.error || 'Unable to add user'
      )
    }
  }

  // Delete a user
  const deleteUser = async (id) => {
    try {
      setError('')
      setMessage('')

      await axios.delete(`/api/users/${id}`)

      setMessage('User deleted successfully!')

      await fetchUsers()
    } catch (err) {
      setError('Unable to delete user')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>User Management System</h1>
        <p>Full-Stack DevOps and Cloud Project</p>
      </header>

      <main className="container">
        <section className="form-card">
          <h2>Add New User</h2>

          <form onSubmit={addUser}>
            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit">
              Add User
            </button>
          </form>
        </section>

        <section className="users-card">
          <h2>Registered Users</h2>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}

          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
