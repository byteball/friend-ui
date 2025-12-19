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
import { NavbarLinkItem, NavigationLink } from "./navbar-link-item";

import { WALLET_COOKIE_NAME } from "@/constants";
import { AddWalletModal } from "../modals/add-wallet";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";

const name = "Obyte Friends"

interface NavbarProps {
  className?: string;
}

const menu: NavigationLink[] = [
  { text: "Leaderboard", href: "/leaderboard" },
  { text: "Governance", href: "/governance" },
  { text: "F.A.Q.", href: "/faq" },
];

export default async function MainNavbar({ className }: NavbarProps) {
  const walletAddress = await getCookie(WALLET_COOKIE_NAME, { cookies });

  return (
    <header className={cn("relative top-0 z-50 mb-10 px-8 pb-4 font-semibold", className)}>
      <div className="absolute left-0 w-full h-24 fade-bottom bg-background/15"></div>
      <div className="relative mx-auto max-w-container">
        <NavbarComponent>
          <NavbarLeft>
            <Link
              href="/"
              prefetch={false}
              className="flex items-center gap-2 text-xl font-bold"
            >
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />
              {name}
            </Link>

            {menu.map((link) => (
              <NavbarLinkItem
                key={link.href}
                link={link}
                className="hidden text-sm text-muted-foreground hover:text-white md:block"
                prefetch={false}
              />
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

            {walletAddress ? (
              <NavbarLinkItem
                link={{ text: "Profile", href: `/${walletAddress}` }}
                className="hidden text-sm text-muted-foreground hover:text-white/50 md:block"
                prefetch={false}
              />
            ) : null}

            <AddWalletModal
              walletAddress={walletAddress}
              triggerClassName="!mr-0 hidden md:block"
            />

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-4 shrink-0 md:hidden"
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

                  {menu.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <NavbarLinkItem
                        link={link}
                        className="text-muted-foreground hover:text-foreground"
                        prefetch={false}
                      />
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
