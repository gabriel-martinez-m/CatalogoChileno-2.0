import { createBrowserRouter } from 'react-router-dom'
import { ClienteLayout } from '@/client/layout/ClienteLayout'
import { CatalogPage } from '@/client/pages/CatalogPage'
import { ProductDetailPage } from '@/client/pages/ProductDetailPage'
import { LoginPage } from '@/client/pages/LoginPage'
import { RegisterPage } from '@/client/pages/RegisterPage'
import { BecomeArtistPage } from '@/client/pages/BecomeArtistPage'
import { CartPage } from '@/client/pages/CartPage'
import { CheckoutPage } from '@/client/pages/CheckoutPage'
import { OrderSuccessPage } from '@/client/pages/OrderSuccessPage'
import { AdminLayout } from '@/admin/layout/AdminLayout'
import { DashboardPage } from '@/admin/pages/DashboardPage'
import { ModerationPage } from '@/admin/pages/ModerationPage'
import { ArtistVerificationPage } from '@/admin/pages/ArtistVerificationPage'
import { SalesFinancePage } from '@/admin/pages/SalesFinancePage'
import { ArtistLayout } from '@/artist/layout/ArtistLayout'
import { ArtistDashboardPage } from '@/artist/pages/ArtistDashboardPage'
import { ArtistWorksPage } from '@/artist/pages/ArtistWorksPage'
import { ArtistUploadPage } from '@/artist/pages/ArtistUploadPage'
import { RequireRole } from '@/router/RequireRole'

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
        path: 'producto/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'registro',
        element: <RegisterPage />,
      },
      {
        path: 'ser-artista',
        element: <BecomeArtistPage />,
      },
      {
        path: 'carrito',
        element: <CartPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'compra-exitosa',
        element: <OrderSuccessPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <RequireRole rol="ROLE_ADMINISTRADOR" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'moderacion', element: <ModerationPage /> },
          { path: 'verificacion', element: <ArtistVerificationPage /> },
          { path: 'ventas', element: <SalesFinancePage /> },
        ],
      },
    ],
  },
  {
    path: '/artista',
    element: <RequireRole rol={['ROLE_ARTISTA', 'ROLE_ADMINISTRADOR']} />,
    children: [
      {
        element: <ArtistLayout />,
        children: [
          { index: true, element: <ArtistDashboardPage /> },
          { path: 'obras', element: <ArtistWorksPage /> },
          { path: 'publicar', element: <ArtistUploadPage /> },
        ],
      },
    ],
  },
])
