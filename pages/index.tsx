import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useMyContext } from "@/context/MyContext";

export default function Home() {
  const { isConnected } = useAccount();
  const { isAdmin } = useMyContext();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      if(isAdmin){
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    }
  }, [isAdmin, isConnected, router]);

  return (
    <main className={`bg-neutral-950 body min-h-screen text-white`}>
      <div className="max-w-[1200px] mx-auto px-3">
        <div className="flex relative z-10 items-center flex-col min-h-screen justify-center">
          <h1 className="md:text-5xl text-2xl font-bold text-center">
            Decentralized Voting for Uniuyo Students
          </h1>
          <p className="text-center my-5 text-sm md:text-base">
            Empowering Uniuyo students through transparent, secure, and
            inclusive voting using blockchain technology.
          </p>
          <ConnectButton />
        </div>

        <BackgroundBeams />

        <div className="mb-16">
          <h1 className="md:text-5xl text-2xl font-bold text-center">Why Our Platform?</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
            <div className="bg-black py-8 px-5 rounded-md shadow">
              <h2 className="text-2xl font-semibold">Transparency</h2>
              <p className="text-sm md:text-base">
                Every vote is recorded on the blockchain, ensuring a transparent
                and tamper-proof process.
              </p>
            </div>
            <div className="bg-black py-8 px-5 rounded-md shadow">
              <h2 className="text-2xl font-semibold">Security</h2>
              <p className="text-sm md:text-base">
                Utilizing blockchain technology to safeguard the integrity of
                each vote and maintain data privacy.
              </p>
            </div>
            <div className="bg-black py-8 px-5 rounded-md shadow">
              <h2 className="text-2xl font-semibold">Inclusivity</h2>
              <p className="text-sm md:text-base">
                Accessible and user-friendly platform designed to ensure all
                students can participate in the voting process.
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer className="w-full py-3 bg-black">
        <p className="text-center">&copy; 2024. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
