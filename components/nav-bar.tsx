"use client"

import Logo from "@/components/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export default function NavBar() {
  const { user, isAuthenticated } = useAuth();
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4 max-w-5xl mx-auto">
        {/* Logo */}
        <div className="flex-1">
          <Link href="/" className="text-primary hover:text-primary/90 w-fit flex">
            <Logo />
          </Link>
        </div>
        
        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild size="sm" className="text-sm">
            <Link href="/ask">Ask Question</Link>
          </Button>
          {
            isAuthenticated ? <Avatar>
            <AvatarFallback>{user?.fullName.charAt(0)}</AvatarFallback>
          </Avatar> : <Button asChild size="sm" variant="link" className="text-sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          }
          
        </div>
      </div>
    </header>
  )
}
