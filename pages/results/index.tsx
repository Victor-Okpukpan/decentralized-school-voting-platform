import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAccount, useReadContract } from "wagmi";
import { useMyContext } from "@/context/MyContext";
import abi from "../../contract/voting-contract.json";
import { useRouter } from "next/navigation";

export default function Results() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const position1 = "President";
  const position2 = "Vice President";
  const position3 = "Secretary";
  const position4 = "Treasurer";
  const position5 = "Public Relations Officer";

  const [positions, setPositions] = useState<any>([]);

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

  const { data: treasurer } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getCandidates",
    args: [position4],
  });

  const { data: publicRelationsOfficer } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getCandidates",
    args: [position5],
  });


  useEffect(() => {
    const processCandidates = () => {
      const newPositions = [
        {
          name: position1,
          candidates: presidential || [],
        },
        {
          name: position2,
          candidates: vicePresidential || [],
        },
        {
          name: position3,
          candidates: secretary || [],
        },
        {
          name: position4,
          candidates: treasurer || [],
        },
        {
          name: position5,
          candidates: publicRelationsOfficer || [],
        },
      ];

      // Determine the winner for each position
      newPositions.forEach((position) => {
        //@ts-ignore
        if (position.candidates.length > 0) {
          //@ts-ignore
          const winner = position.candidates.reduce((prev: any, current: any) =>
            Number(prev.voteCount) > Number(current.voteCount) ? prev : current
          );
          //@ts-ignore
          position.winner = winner.name;
        }
      });

      setPositions(newPositions);
    };

    if (votingEnded) {
      processCandidates();
    }
  }, [presidential, vicePresidential, secretary, votingEnded, treasurer, publicRelationsOfficer]);

  return (
    <main>
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-3">
        <div className="my-10">
          <h1 className="text-3xl font-semibold mb-6">Election Results</h1>

          {!votingStarted && !votingEnded && (
            <div className="bg-yellow-200 text-yellow-800 p-4 rounded-lg mb-8">
              <h2 className="text-xl">Results are not available yet.</h2>
              <p>The election has not started. Please check back later.</p>
            </div>
          )}

          {votingStarted && !votingEnded && (
            <div className="bg-blue-200 text-blue-800 p-4 rounded-lg mb-8">
              <h2 className="text-xl">Election is ongoing.</h2>
              <p>The results will be available once the election has ended.</p>
            </div>
          )}

          {!votingStarted && votingEnded && (
            <div className="bg-green-200 text-green-800 p-4 rounded-lg mb-8">
              <h2 className="text-xl">The election has ended.</h2>
              <p>The results have been displayed below.</p>
            </div>
          )}

          {votingEnded && positions.length > 0 && positions.map((position: any, index: any) => (
            <div
              key={index}
              className="bg-white text-black p-6 rounded-lg shadow-lg mb-8"
            >
              <h2 className="text-2xl font-semibold mb-4">{position.name}</h2>
              <ul className="space-y-2">
                {position.candidates.map((candidate: any, idx: any) => (
                  <li
                    key={idx}
                    className={`p-4 rounded-lg flex justify-between items-center ${
                      idx === 0 ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <span>{candidate.name}</span>
                    <span className="font-bold">{Number(candidate.voteCount)} votes</span>
                  </li>
                ))}
              </ul>
              {position.winner && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
                  <strong>Winner:</strong> {position.winner}
                </div>
              )}
            </div>
          ))}

          {votingEnded && positions.length === 0 && (
            <div className="bg-gray-200 text-gray-800 p-4 rounded-lg mb-8">
              <h2 className="text-xl">No results available.</h2>
              <p>No candidates were found for the positions.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
