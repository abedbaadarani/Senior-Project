import React, { useEffect, useState } from 'react';
import { getUsers } from '../api/userApi';
import '../styles/App.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch users.');
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="container">
      <h2>User Directory</h2>
      {error && <p className="error">{error}</p>}
      <ul className="user-list">
        {users.map(user => (
          <li key={user.id}>
            <strong>{user.name}</strong> - <em>{user.role}</em> ({user.email})
          </li>
        ))}
      </ul>
      <a href="/">Back Home</a>
    </div>
  );
};

export default Users;
