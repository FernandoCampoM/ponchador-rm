import { Clock } from "@/components/clock";
import { KeypadForm } from "@/components/keypad-form";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { BarChart } from "lucide-react";


export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 lg:p-8 bg-background">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="flex items-center gap-4 text-foreground mb-6">
            <Logo className="h-16 w-16 text-primary" />
            <h1 className="font-bold tracking-tight text-3xl md:text-5xl">
  Ponchador RM
</h1>

          </div>
          <Clock />
        </div>
        <div className="flex items-center justify-center">
          <KeypadForm  />
        </div>
      </div>
      <footer className="absolute bottom-4 right-4">
        
      </footer>
    </main>
  );
}
