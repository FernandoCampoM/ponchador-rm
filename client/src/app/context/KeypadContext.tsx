// context/KeypadContext.tsx
"use client"

import { createContext, useContext, useState, Dispatch, SetStateAction } from "react"

interface UserIdState {
  userId: string
  // Cambiamos (v: string) => void por el tipo oficial de React
  setUserId: Dispatch<SetStateAction<string>>
}

const KeypadContext = createContext<UserIdState | null>(null)

export function KeypadProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState("")

  return (
    <KeypadContext.Provider value={{ userId, setUserId }}>
      {children}
    </KeypadContext.Provider>
  )
}

export function useKeypad() {
  const ctx = useContext(KeypadContext)
  if (!ctx) {
    throw new Error("useKeypad debe usarse dentro de un KeypadProvider")
  }
  return ctx
}