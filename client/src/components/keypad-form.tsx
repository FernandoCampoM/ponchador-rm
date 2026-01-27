"use client";

import { useEffect, useState, useRef, useCallback, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { LogIn, LogOut, Loader2, Hash, Asterisk, ArrowRight } from 'lucide-react';
import { handleClockAction, type ClockState } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ConfirmationDialog } from './confirmation-dialog';
import { toast, useToast } from "@/hooks/use-toast";
import { getAllEmployees } from '@/services/user.service';
import { User } from '@/lib/types';
import employeeStore from '@/lib/mock-data';
import { useCamera } from '@/hooks/camera';
import { PTORequestDialog } from './pto-request-dialog';


const initialState: ClockState = {
  status: 'idle',
  message: '',
};

function SubmitButton({ actionType }: { actionType: 'in' | 'out' }) {
  
  const { pending } = useFormStatus();
  
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (pending) {
      const activeElement = document.activeElement as HTMLButtonElement;
      if (activeElement?.value === actionType) {
        setIsClicked(true);
      }
    } else {
      setIsClicked(false);
    }
  }, [pending, actionType]);


  return (
    <Button 
      type="submit" 
      name="actionType" 
      value={actionType}
      className="w-full text-lg py-6"
      variant={actionType === 'in' ? 'default' : 'secondary'}
      disabled={pending}
      
    >
      {pending && isClicked ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : actionType === 'in' ? (
        <LogIn className="mr-2 h-5 w-5" />
      ) : (
        <LogOut className="mr-2 h-5 w-5" />
      )}
      Clock {actionType === 'in' ? 'In' : 'Out'}
    </Button>
  );
}
function determinateActionType(numPonches?: number,currentEmployee?: User): 'in' | 'out' {
  console.log("Determining action type with numPonches:", numPonches);
  console.log("Current Employee:", currentEmployee);
  if (numPonches === undefined) return 'in';

  return numPonches % 2 === 0 ? 'in' : 'out';
}

export function KeypadForm() {
  const [state, formAction] = useActionState(handleClockAction, initialState);
  const { toast } = useToast();

  const [step, setStep] = useState<'userId' | 'pin'>('userId');
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [activeInput, setActiveInput] = useState<'userId' | 'pin'>('userId');

  const userIdRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
const [loadingEmployees, setLoadingEmployees] = useState(true);
const[currentEmployee, setCurrentEmployee] = useState<User>();
const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
  const loadEmployees = async () => {
    try {
      const data = await getAllEmployees();
      // 1. Guardas en tu store externo (si lo necesitas en otros lados)
      employeeStore.addEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoadingEmployees(false);
    }
  };

  loadEmployees();
}, [toast]); 
  const resetState = useCallback(() => {
    setStep('userId');
    setUserId('');
    setPin('');
    setActiveInput('userId');
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (state.status === 'error' && state.message) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
       // Reset to PIN step on error to allow re-entry
      setStep('pin');
      setPin('');
    }
    if (state.status === 'success') {
      resetState();
    }
  }, [state, toast, resetState]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      resetState();
      toast({
        title: "Session Timed Out",
        description: "You've been returned to the home screen due to inactivity.",
      });
    }, 15000);
  }, [resetState, toast]);const {
    videoRef,
    canvasRef,
    startCamera,
    captureFromCamera,
    stopCamera
  } = useCamera();

  const [photo, setPhoto] = useState<string | null>(null);

  const takePhoto = async () => {
  const base64 = captureFromCamera();
  setPhoto(base64);
};
useEffect(() => {
  (window as any).takePhotoFromCamera = takePhoto;
  return () => {
    delete (window as any).takePhotoFromCamera;
  };
}, []);
const waitForVideoReady = () =>
  new Promise<void>((resolve) => {
    const video = videoRef.current
    if (!video) return resolve()

    const checkReady = () => {
      if (
        video.readyState >= 3 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        resolve()
      } else {
        requestAnimationFrame(checkReady)
      }
    }

    checkReady()
  })



  useEffect(() => {
    let cancelled = false;
  if (step === 'pin') {
    // ⏱️ Inactividad
    resetInactivityTimer();

    // 📸 Cámara
  const prepareAndCapture = async () => {
      await startCamera()
      await waitForVideoReady()
      await new Promise(r => requestAnimationFrame(r))

      if (cancelled) return

      const base64 = captureFromCamera()
      toast({ title: "Photo Captured" })
      setPhoto(base64)

      stopCamera()
    };
    if(!photo){
      prepareAndCapture()
    }
  
  } else {
    cancelled = true;
    // ⏱️ Limpiar timer si no estamos en PIN
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // 📸 Apagar cámara
    stopCamera();
  }

  // 🧹 Cleanup general
  return () => {
    cancelled = true;
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    stopCamera();
  };
}, [step, resetInactivityTimer, startCamera, stopCamera]);


const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  if (!photo) {
    /* e.preventDefault(); // ⛔ detenemos el submit

    try {
      const base64 = captureFromCamera(); // 📸 toma foto
      setPhoto(base64);

      stopCamera(); // 🛑 APAGAMOS la cámara aquí
    } catch (err) {
      console.error("Error capturing photo", err);
      return;
    } */

    // Dejamos que el form continúe
    //e.currentTarget.requestSubmit();
  }
};



  const handleKeypadClick = (key: string) => {
    if (step === 'pin') {
      resetInactivityTimer();

    }

    if (activeInput === 'userId') {
      setUserId(prev => (prev + key).slice(0, 10));
    } else {
      setPin(prev => (prev + key).slice(0, 10));
    }
  };

  const handleBackspace = () => {
     if (step === 'pin') resetInactivityTimer();
    if (activeInput === 'userId') {
      setUserId(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };
  
  const handleClear = () => {
    if (step === 'pin') resetInactivityTimer();
    if (activeInput === 'userId') setUserId('');
    else setPin('');
  }

  const handleNext = async () => {
    const employees=await getAllEmployees();
    const exists = employees.some(
    (e: { ID: any; }) => String(e.ID) === userId
  );
    if (exists) {
      setCurrentEmployee(employees.find((e: { ID: any; }) => String(e.ID) === userId));
        setStep('pin');
        setActiveInput('pin');
    } else {
        toast({
            title: "Error",
            description: "User ID not found.",
            variant: "destructive",
        });
        setUserId('');
    }
  };
 
  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
  if (loadingEmployees) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
 

  return (
    <>
      <ConfirmationDialog state={state} onClose={() => window.location.reload()} />

      <Card className="w-full max-w-sm shadow-2xl bg-card">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Time Clock</CardTitle>
          <CardDescription className="text-center">
            {step === 'userId' ? 'Enter your User ID to begin.' : `Enter PIN for User ID: ${userId}`}
            {step === 'pin' && (
              <button onClick={resetState} className="text-primary text-sm ml-2 underline">(Change User)</button>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} >
            <div className="space-y-4">
              <div className={cn("relative", step === 'pin' && 'hidden')}>
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={userIdRef}
                  name="userId"
                  placeholder="User ID"
                  value={userId}
                  onFocus={() => setActiveInput('userId')}
                  className={cn("pl-10 text-lg h-12", activeInput === 'userId' && 'ring-2 ring-primary')}
                  readOnly
                />
              </div>
              <div className={cn("relative", step === 'userId' && 'hidden')}>
                 <input type="hidden" name="userId" value={userId} />
                <Asterisk className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={pinRef}
                  name="pin"
                  type="password"
                  placeholder="PIN"
                  value={pin}
                  onFocus={() => setActiveInput('pin')}
                  className={cn("pl-10 text-lg h-12", activeInput === 'pin' && 'ring-2 ring-primary')}
                  readOnly
                />
                <video
  ref={videoRef}
  autoPlay
  muted
  playsInline
  className="absolute opacity-0 pointer-events-none"
 />
                <canvas ref={canvasRef} className="hidden" />

                <input type="hidden" name="image" value={photo ?? ""} />
              </div>
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

            {step === 'userId' ? (
                <div >
                  <Button type="button" className="w-full text-lg py-6" onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <PTORequestDialog />
              </div>
            ) : (
                <div className="flex gap-4">
                <SubmitButton actionType={determinateActionType(currentEmployee?.numPonches, currentEmployee)} />
                </div>
            )}
          </form>
        </CardContent>
      </Card>
    </>
  );
}
