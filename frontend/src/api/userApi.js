export const getUsers = async () => {
  const response = await fetch('http://localhost:5000/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};
