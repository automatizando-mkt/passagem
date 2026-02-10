"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppSidebar } from "./app-sidebar";
import type { UserRole } from "@/types";

interface AppHeaderProps {
  role: UserRole;
  nome: string;
  email: string;
}

export function AppHeader({ role, nome, email }: AppHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b bg-background px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
          <AppSidebar
            role={role}
            nome={nome}
            email={email}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
      <span className="text-sm font-semibold">Passagem</span>
    </header>
  );
}
