"use client"

import { useState } from "react"
import { validateUser } from "@/services/user.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
export function DashboardGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [userId, setUserId] = useState("")
  const [pin, setPin] = useState("")
  const [authorized, setAuthorized] = useState(false)
  const { toast } = useToast()
  const [activeInput, setActiveInput] = useState<'userId' | 'pin'>('userId');

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
const handleKeypadClick = (key: string) => {
    
    if (activeInput === 'userId') {
      setUserId(prev => (prev + key).slice(0, 10));
    } else {
      setPin(prev => (prev + key).slice(0, 10));
    }
  };
const handleBackspace = () => {
     
    if (activeInput === 'userId') {
      setUserId(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };
  
  const handleClear = () => {
    
    if (activeInput === 'userId') setUserId('');
    else setPin('');
  }
const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
  
  if (!authorized) {
    return (
      <Dialog open={open} onOpenChange={(open) => {
        if (!open) {
          router.back()
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acceso a Reportes</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>User ID</Label>
              <Input value={userId} 
              onFocus={() => setActiveInput('userId')}
              onChange={e => setUserId(e.target.value)} />
            </div>

            <div>
              <Label>PIN</Label>
              <Input
                type="password"
                value={pin}
                onFocus={() => setActiveInput('pin')}
                onChange={e => setPin(e.target.value)}
              />
            </div>
<div className="grid grid-cols-3 gap-2 my-6">
              {keypadKeys.map((key) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  className="text-2xl h-16"
                  onClick={() => {
                    if (key === 'C') handleClear();
                    else if (key === '⌫') handleBackspace();
                    else handleKeypadClick(key);
                  }}
                >
                  {key}
                </Button>
              ))}
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
