import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Carrito } from '@/interfaces/cart.interface'
import { cartService } from '@/services/cart.service'
import { useAuth } from './AuthContext'

interface CartContextType {
  cart: Carrito | null
  itemCount: number
  totalAmount: number
  isLoading: boolean
  addToCart: (idProducto: number, precio: number, cantidad?: number) => Promise<Carrito>
  removeFromCart: (idProducto: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth()
  const [cart, setCart] = useState<Carrito | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await cartService.getCarrito(session?.idUsuario)
      setCart(data)
    } catch (error) {
      console.warn('No se pudo cargar el carrito aún:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session?.idUsuario])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = async (idProducto: number, precio: number, cantidad: number = 1) => {
    setIsLoading(true)
    try {
      const updated = await cartService.agregarItem(idProducto, cantidad, precio, session?.idUsuario)
      setCart(updated)
      return updated
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (idProducto: number) => {
    if (!cart?.idCarrito) return
    setIsLoading(true)
    try {
      const updated = await cartService.eliminarItem(cart.idCarrito, idProducto)
      setCart(updated)
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    if (!cart?.idCarrito) return
    setIsLoading(true)
    try {
      await cartService.vaciarCarrito(cart.idCarrito)
      await refreshCart()
    } finally {
      setIsLoading(false)
    }
  }

  const itemCount = cart?.items?.reduce((acc, item) => acc + (item.cantidad || 0), 0) ?? 0
  const totalAmount = cart?.items?.reduce((acc, item) => acc + (item.precioUnitarioClp * item.cantidad), 0) ?? 0

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        totalAmount,
        isLoading,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider')
  }
  return context
}
