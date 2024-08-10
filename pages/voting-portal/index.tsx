import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import abi from "../../contract/voting-contract.json";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { useMyContext } from "@/context/MyContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type Candidate = {
  name: string;
};

type Position = {
  name: string;
  candidates: Candidate[];
};

export default function VotingPortal() {
  const { isConnected } = useAccount();
  const router = useRouter();

  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<any>({});
  const [message, setMessage] = useState<string>("");
  const [votingInProgress, setVotingInProgress] = useState<boolean>(false);

  const { writeContractAsync } = useWriteContract();
  const { votingContract } = useMyContext();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const position1 = "President";
  const position2 = "Vice President";
  const position3 = "Secretary";
  const position4 = "Treasurer";
  const position5 = "Public Relations Officer";

  const { data: presidentialCandidates } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getCandidates",
    args: [position1],
  });

  const { data: vicePresidentialCandidates } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getCandidates",
    args: [position2],
  });

  const { data: secretaryCandidates } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getCandidates",
    args: [position3],
  });

  const { data: treasurerCandidates } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getCandidates",
    args: [position4],
  });

  const { data: proCandidates } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getCandidates",
    args: [position5],
  });

  // Populate positions with candidates from the contract
  useEffect(() => {
    const fetchedPositions: Position[] = [
      {
        name: position1,
        candidates: presidentialCandidates as Candidate[], // Ensure this matches the type
      },
      {
        name: position2,
        candidates: vicePresidentialCandidates as Candidate[], // Ensure this matches the type
      },
      {
        name: position3,
        candidates: secretaryCandidates as Candidate[], // Ensure this matches the type
      },
      {
        name: position4,
        candidates: treasurerCandidates as Candidate[], // Ensure this matches the type
      },
      {
        name: position5,
        candidates: proCandidates as Candidate[], // Ensure this matches the type
      },
    ];

    setPositions(fetchedPositions);
  }, [presidentialCandidates, vicePresidentialCandidates, secretaryCandidates, treasurerCandidates, proCandidates]);

  const handleCandidateSelection = (position: string, candidate: string) => {
    setSelectedCandidates({
      ...selectedCandidates,
      [position]: candidate,
    });
  };

  const handleVote = async (position: string) => {
    if (!selectedCandidates[position]) {
      setMessage(`Please select a candidate for the ${position} position.`);
      return;
    }

    const candidateIndex = positions
      .find((p) => p.name === position)
      ?.candidates.findIndex((c) => c.name === selectedCandidates[position]);

    if (candidateIndex === undefined || candidateIndex < 0) {
      setMessage("Invalid candidate selection.");
      return;
    }

    setVotingInProgress(true);

    try {
      const txResponse = await writeContractAsync({
        abi: abi,
        address: votingContract,
        functionName: "vote",
        args: [position, candidateIndex],
      });

      console.log(txResponse);

      toast.success(`Your vote for ${position} has been submitted successfully!`)

      setSelectedCandidates({
        ...selectedCandidates,
        [position]: null,
      });
    } catch (error) {
      toast.error(`Something went wrong while voting for ${position}!`)
      console.error(error);
    } finally {
      setVotingInProgress(false);
    }
  };

  const { data: votingStarted } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "s_votingStarted",
  });

  return (
    <main>
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-3">
        <div className="my-10">
          <h1 className="text-3xl font-semibold mb-6">Voting</h1>

          <div className="bg-white text-black p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Cast Your Vote</h2>
            <form>
              {positions.map((position, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {position.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {position.candidates && position.candidates.map((candidate, idx) => (
                      <label key={idx} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={position.name}
                          value={candidate.name}
                          checked={
                            selectedCandidates[position.name] === candidate.name
                          }
                          onChange={() =>
                            handleCandidateSelection(position.name, candidate.name)
                          }
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span>{candidate.name}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVote(position.name)}
                    className="bg-blue-600 text-white disabled:cursor-not-allowed disabled:bg-blue-600/50 mt-4 p-3 rounded-lg w-full md:w-auto"
                    disabled={!selectedCandidates[position.name] || votingInProgress || votingStarted === false}
                  >
                    Submit Vote for {position.name}
                  </button>
                </div>
              ))}
            </form>
            {message && (
              <p className="mt-4 text-center text-green-600">{message}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
