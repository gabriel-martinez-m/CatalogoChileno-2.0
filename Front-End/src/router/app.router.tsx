import { createBrowserRouter } from 'react-router-dom'
import { ClienteLayout } from '@/client/layout/ClienteLayout'
import { CatalogPage } from '@/client/pages/CatalogPage'
import { LoginPage } from '@/client/pages/LoginPage'
import { CartPage } from '@/client/pages/CartPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <ClienteLayout />,
    children: [
      {
        index: true,
        element: <CatalogPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'carrito',
        element: <CartPage />,
      },
    ],
  },
])
