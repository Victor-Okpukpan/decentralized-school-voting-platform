import { useMyContext } from "@/context/MyContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const { isAdmin } = useMyContext();

  return (
    <header>
      <nav className="bg-neutral-900">
        <div className="max-w-[1200px] mx-auto px-3">
          <div className="flex py-5 items-center justify-between">
            <div className="">
              <Image
                src="/uniuyo-logo.png"
                alt="Uniuyo Logo"
                height={49}
                width={50}
              />
            </div>

            <div className="space-x-5">
              <Link
                href="/dashboard"
                className="text-neutral-300 hover:text-white transition-all ease-out duration-200"
              >
                Dashboard
              </Link>
              <Link
                href="/voting-portal"
                className="text-neutral-300 hover:text-white transition-all ease-out duration-200"
              >
                Portal
              </Link>
              <Link
                href="/results"
                className="text-neutral-300 hover:text-white transition-all ease-out duration-200"
              >
                Results
              </Link>

              {isAdmin ? (
                <Link
                  href="/admin"
                  className="text-neutral-300 hover:text-white transition-all ease-out duration-200"
                >
                  Admin
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="text-neutral-300 hover:text-white transition-all ease-out duration-200"
                >
                  Profile
                </Link>
              )}
            </div>

            <div className="">
              <ConnectButton
                showBalance={false}
                chainStatus={"none"}
                accountStatus={"address"}
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
