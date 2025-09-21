"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FloatingDock } from "@/components/ui/floating-dock";
import { IconHome, IconBrain, IconApi, IconBuilding } from "@tabler/icons-react";

export function Navbar() {
  const navItems = [
    {
      title: "Home",
      icon: <IconHome className="h-full w-full text-white" />,
      href: "#",
    },
    
    {
      title: "Documentation",
      icon: <IconApi className="h-full w-full text-white" />,
      href: "#",
    },
    {
      title: "Company",
      icon: <IconBuilding className="h-full w-full text-white" />,
      href: "#",
    },
  ];

  return (
    <>
      {/* Background blur filler to cover the gap from the top */}
      <div className="fixed inset-x-0 top-10  z-40 bg-background/10 backdrop-blur-sm" />
      <nav className={cn(
        "fixed inset-x-0 top-10 z-50 mx-auto flex w-full items-center justify-between p-4",
        "bg-background/10 backdrop-blur-sm"
      )}>
        {/* Left side: Project Logo */}
        <Link href="#" className="flex items-center space-x-2">
          <Image src="/placeholder-logo.svg" alt="Logo" width={32} height={32} />
          <span className="font-bold text-white">Eunoia</span>
        </Link>

        {/* Center: Navigation Links (Floating Dock) */}
        <div className="hidden md:block">
          <FloatingDock items={navItems} />
        </div>

        {/* Right side: Login/Signup buttons */}
        <div className="flex space-x-2">
          <Button variant="ghost" className="text-white hover:bg-white/20">
            Login
          </Button>
          <Button className="bg-white text-black hover:bg-white/90">
            Sign up
          </Button>
        </div>
      </nav>
    </>
  );
}