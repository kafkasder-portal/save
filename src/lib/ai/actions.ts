export async function getAllActions() {
  return [
    {
      id: 'nav:dashboard',
      label: 'Dashboard\'a Git',
      description: 'Ana sayfa',
      keywords: ['ana', 'dashboard', 'home'],
      run: ({ navigateTo }: any) => navigateTo('/')
    },
    // Add other actions as needed
  ]
}
