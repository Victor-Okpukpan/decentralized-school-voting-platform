import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount, useReadContract } from "wagmi";
import { useMyContext } from "@/context/MyContext";
import abi from "../../contract/voting-contract.json";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const position1 = "President";
  const position2 = "Vice President";
  const position3 = "Secretary";

  const [electionStarted, setElectionStarted] = useState<any>(false);
  const [electionEnded, setElectionEnded] = useState<any>(false);
  const [presidentialCandidates, setPresidentialCandidates] = useState<any>([]);
  const [vicePresidentialCandidates, setVicePresidentialCandidates] = useState<any>([]);
  const [secretaryCandidates, setSecretaryCandidates] = useState<any>([]);

  const { votingContract } = useMyContext();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const { data: votingStarted } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "s_votingStarted",
  });

  const { data: votingEnded } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "s_votingEnded",
  });

  const { data: presidential } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getCandidates",
    args: [position1],
  });

  const { data: vicePresidential } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getCandidates",
    args: [position2],
  });

  const { data: secretary } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getCandidates",
    args: [position3],
  });

  useEffect(() => {
    setElectionStarted(votingStarted);
    setElectionEnded(votingEnded);

    if (presidential) {
      setPresidentialCandidates(presidential);
    }

    if (vicePresidential) {
      setVicePresidentialCandidates(vicePresidential);
    }

    if (secretary) {
      setSecretaryCandidates(secretary);
    }
  }, [presidential, secretary, vicePresidential, votingEnded, votingStarted]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-3">
        <div className="my-10">
          <h1 className="text-4xl font-semibold mb-8">
            School Election Dashboard
          </h1>

          <div className="bg-white text-black p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Election Status:{" "}
              {electionStarted === false &&
                electionEnded === false &&
                "Not Started"}
              {electionStarted === true && electionEnded === false && "Ongoing"}
              {electionStarted === false && electionEnded === true && "Ended"}
            </h2>
            <p className="text-gray-600">
              {electionStarted === false &&
                electionEnded === false &&
                "The election has not yet started. Please check back later."}
              {electionStarted === true &&
                electionEnded === false &&
                "The election is currently ongoing. Cast your vote now!"}
              {electionStarted === false &&
                electionEnded === true &&
                "The election has ended. Check the results below."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PositionCard title="President" candidates={presidentialCandidates} />
            <PositionCard title="Vice President" candidates={vicePresidentialCandidates} />
            <PositionCard title="Secretary" candidates={secretaryCandidates} />
          </div>
        </div>
      </div>
    </main>
  );
}

function PositionCard({ title, candidates }: { title: string; candidates: any[] }) {
  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">{title} Candidates</h3>
      {candidates && candidates.length === 0 ? (
        <p>No candidates available for this position.</p>
      ) : (
        <ul className="space-y-4">
          {candidates.map((candidate: any, idx: any) => (
            <li key={idx} className="flex items-center space-x-4">
              <Image
                src={`https://arweave.net/${candidate.imgHash}`}
                alt={candidate.name}
                width={50}
                height={50}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="text-lg font-medium">{candidate.name}</h4>
                <p className="text-sm text-gray-700">Department: {candidate.department}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
