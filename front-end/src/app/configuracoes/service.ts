export async function getProfile() {
  const response = await fetch('http://localhost:3333/session/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })

  if (!response.ok) {
    throw new Error('Erro ao buscar perfil do usuário')
  }

  return response.json()
}
