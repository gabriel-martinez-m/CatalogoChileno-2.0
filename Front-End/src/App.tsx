import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { appRouter } from '@/router/app.router'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={appRouter} />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
