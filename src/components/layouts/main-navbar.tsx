import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getCookie } from 'cookies-next/server';
import { Menu } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../ui/navbar";

import { WALLET_COOKIE_NAME } from "@/constants";
import { AddWalletModal } from "../modals/add-wallet";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";

const name = "Obyte Friends"

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarProps {
  className?: string;
}

const menu: NavbarLink[] = [
  { text: "Home", href: "/" },
  { text: "F.A.Q.", href: "/faq" },
];

export default async function MainNavbar({ className }: NavbarProps) {
  const walletAddress = await getCookie(WALLET_COOKIE_NAME, { cookies });

  return (
    <header className={cn("relative top-0 z-50 mb-10 px-8 pb-4 font-semibold", className)}>
      <div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full"></div>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold"
            >
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />
              {name}
            </Link>

            {menu.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-muted-foreground hover:text-foreground hidden text-sm md:block"
              >
                {link.text}
              </Link>
            ))}

          </NavbarLeft>
          <NavbarRight>
            {/* <Link
              href="https://obyte.org/#download"
              target="_blank"
              className="hidden text-sm md:block"
            >
              Download wallet
            </Link> */}

            {walletAddress ? <Link
              href={`/user/${walletAddress}`}
              className="hidden text-sm md:block"
            >
              Profile
            </Link> : null}

            <AddWalletModal
              walletAddress={walletAddress}
              triggerClassName="!mr-0 hidden md:block"
            />

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden ml-4"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right">
                <VisuallyHidden asChild>
                  <SheetTitle />
                </VisuallyHidden>
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    <Image src="/logo.svg" alt="Logo" width={32} height={32} /> <span>{name}</span>
                  </Link>

                  {menu.map((link, index) => (
                    <SheetClose key={index} asChild>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {link.text}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}
