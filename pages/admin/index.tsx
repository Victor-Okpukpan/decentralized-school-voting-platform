import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import abi from "../../contract/voting-contract.json";
import { useAccount, useWriteContract } from "wagmi";
import { useMyContext } from "@/context/MyContext";
import { Buffer } from "buffer";
import { getWebIrys } from "@/lib/getIrys";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Admin() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [candidateName, setCandidateName] = useState("");
  const [department, setDepartment] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [position, setPosition] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [img, setImg] = useState<File | null>(null);

  const { writeContractAsync } = useWriteContract();
  const { votingContract } = useMyContext();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handleAddCandidate = async () => {
    setIsLoading(true);
    let irysID;

    if (img) {
      const irys = await getWebIrys();

      try {
        const imgBuffer = await fileToBuffer(img);
        const receipt = await irys.upload(imgBuffer);
        irysID = receipt.id;
      } catch (error) {
        console.error("Failed to upload image:", error);
        alert("Failed to upload image. Please try again.");
        return;
      }
    }

    try {
      const txResponse = await writeContractAsync({
        abi: abi,
        address: votingContract,
        functionName: "addCandidate",
        args: [
          candidateName,
          department,
          regNumber,
          yearOfStudy,
          position,
          irysID,
        ],
      });
      console.log(txResponse);
      setIsLoading(false);
      toast.success("Candidate has been added!");

      setCandidateName("");
      setDepartment("");
      setRegNumber("");
      setYearOfStudy("");
      setPosition("");
      setImg(null);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!")
      setIsLoading(false);
    }
  };

  const handleStartVoting = async () => {
    setIsLoading(true);
    try {
      const txResponse = await writeContractAsync({
        abi: abi,
        address: votingContract,
        functionName: "startVoting",
      });
      console.log(txResponse);
      setIsLoading(false);
      toast.success("The voting portal has been opened!");
    } catch (error) {
      toast.error("Something went wrong!")
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleEndVoting = async () => {
    setIsLoading(true);
    try {
      const txResponse = await writeContractAsync({
        abi: abi,
        address: votingContract,
        functionName: "endVoting",
      });
      toast.success("The voting portal has been closed!")
      console.log(txResponse);
      setIsLoading(false);
    } catch (error) {
      toast.error("Something went wrong!")
      console.error(error);
      setIsLoading(false);
    }
  };

  const fileToBuffer = (file: File): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(Buffer.from(reader.result as ArrayBuffer));
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImg(e.target.files[0]);
    }
  };

  return (
    <main>
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-3">
        <div className="my-10">
          <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

          <div className="bg-white text-black p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Add New Candidate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Candidate Name"
                className="border border-gray-300 p-3 rounded-lg w-full"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Department"
                className="border border-gray-300 p-3 rounded-lg w-full"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
              <input
                type="text"
                placeholder="Registration Number"
                className="border uppercase border-gray-300 p-3 rounded-lg w-full"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
              />
              <input
                type="number"
                placeholder="Year of Study"
                className="border border-gray-300 p-3 rounded-lg w-full"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
              />
              <input
                type="text"
                placeholder="Position"
                className="border border-gray-300 p-3 rounded-lg w-full"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
              <input
                type="file"
                className="border border-gray-300 p-3 rounded-lg w-full"
                onChange={handleImageChange}
              />
            </div>
            <button
              onClick={handleAddCandidate}
              className="bg-blue-600 text-white mt-4 p-3 rounded-lg w-full md:w-auto"
            >
              Add Candidate
            </button>
          </div>

          <div className="bg-white text-black p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Manage Voting Process
            </h2>
            <div className="flex gap-4">
              <button
                onClick={handleStartVoting}
                className="bg-green-600 text-white p-3 rounded-lg w-full md:w-auto"
              >
                Start Voting
              </button>
              <button
                onClick={handleEndVoting}
                className="bg-red-600 text-white p-3 rounded-lg w-full md:w-auto"
              >
                End Voting
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
