"use client"

import { useState } from "react"
import { validateUser } from "@/services/user.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const [userId, setUserId] = useState("")
  const [pin, setPin] = useState("")
  const [authorized, setAuthorized] = useState(false)
  const { toast } = useToast()

  const handleValidate = async () => {
    const response = await validateUser(Number(userId), pin)

    if (!response.success) {
      toast({ variant: "destructive", title: response.message })
      return
    }
    console.log("User access level:", response)
    if (response.user?.Acces !== 1) {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "No tienes privilegios para ver esta información",
      })
      return
    }

    // ✅ Autorizado
    setAuthorized(true)
    setOpen(false)
  }

  if (!authorized) {
    return (
      <Dialog open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acceso a Reportes</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>User ID</Label>
              <Input value={userId} onChange={e => setUserId(e.target.value)} />
            </div>

            <div>
              <Label>PIN</Label>
              <Input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleValidate}>
              Validar acceso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return <>{children}</>
}
