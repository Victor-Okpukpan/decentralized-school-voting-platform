import Navbar from "@/components/Navbar";
import { useMyContext } from "@/context/MyContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import Link from "next/link";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/animated-modal";
import { getWebIrys } from "@/lib/getIrys";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Buffer } from "buffer";
import Image from "next/image";
import abi from "../../contract/voting-contract.json";
import { toast } from "react-toastify";

export default function Profile() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [voterData, setVoterData] = useState<any>([]);

  console.log("data:", voterData);

  const {
    saveProfile,
    email,
    setEmail,
    name,
    setName,
    department,
    setDepartment,
    regNumber,
    setRegNumber,
    yearOfStudy,
    setYearOfStudy,
    imgHash,
    setImgHash,
    updateProfile,
    userData,
  } = useMyContext();

  const { writeContractAsync } = useWriteContract();
  const { votingContract } = useMyContext();

  const [img, setImg] = useState<File | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const { data: voter } = useReadContract({
    abi: abi,
    address: votingContract,
    functionName: "getVoter",
    args: [address],
  });

  useEffect(() => {
    setVoterData(voter);
  }, [voter]);

  const fileToBuffer = (file: File): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(Buffer.from(reader.result as ArrayBuffer));
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const profile = {
      user_address: address,
      email,
      name,
      department,
      regNumber,
      yearOfStudy,
      imgHash: irysID,
    };

    try {
      if (userData == undefined) {
        saveProfile(profile);
      } else {
        updateProfile(profile);
      }
      toast.success("Your profile has been updated!");
    } catch (error) {
      toast.error("Something went wrong!");
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImg(e.target.files[0]);
    }
  };

  const handleRegisterVoter = async () => {
    try {
      const txResponse = await writeContractAsync({
        abi: abi,
        address: votingContract,
        functionName: "registerVoter",
        args: [name, department, regNumber, yearOfStudy],
      });
      toast.success("You have been registered!");
    } catch (error) {
      toast.error("Something went wrong!")
      console.log(error);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-3 py-10">
        {userData == undefined && (
          <div className="bg-red-500 text-center p-2 rounded mb-5">
            <p>
              Please fill your profile so you can be eligible to vote later.
            </p>
          </div>
        )}
        <div className="flex items-center space-x-8">
          <div className="w-[250px] h-[250px] overflow-hidden rounded-full bg-gray-800 flex items-center justify-center">
            <Image
              src={`https://arweave.net/${imgHash}`}
              alt={name}
              width={250}
              height={250}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-4xl font-semibold capitalize">
              {name ? name : "Not Set"}
            </h1>
            <div className="mt-4">
              {!voterData[0] ? (
                <div className="">
                  <button
                    disabled={
                      !name || !department || !regNumber || !yearOfStudy
                    }
                    onClick={handleRegisterVoter}
                    className="bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-600/50 text-white mt-4 p-3 rounded-lg w-full md:w-auto"
                  >
                    Register as voter!
                  </button>
                </div>
              ) : (
                <div className=" text-green-600">
                  <p>Registered voter</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-3xl font-semibold mb-4">Personal Information</h2>
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span className="text-gray-400">{email ? email : "Not Set"}</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-semibold mb-4">Academic Information</h2>
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Department:</span>
              <span className="text-gray-400">
                {department ? department : "Not Set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Reg. No:</span>
              <span className="text-gray-400 uppercase">
                {regNumber ? regNumber : "Not Set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Year of Study:</span>
              <span className="text-gray-400">
                {yearOfStudy ? yearOfStudy : "Not Set"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <Modal>
            <ModalTrigger className="bg-white !text-black px-6 py-3 rounded-lg flex items-center space-x-2">
              <MdEdit />
              <span>Edit Profile</span>
            </ModalTrigger>
            <ModalBody>
              <ModalContent>
                <form onSubmit={handleSubmit} className="space-y-2 text-sm">
                  <div>
                    <label htmlFor="image" className="block font-medium">
                      Profile Photo:
                    </label>
                    <input
                      type="file"
                      id="image"
                      onChange={handleImageChange}
                      className="w-full p-2 mt-1 rounded bg-gray-900 border border-gray-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      placeholder="E.g 'test@gmail.com'"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 mt-1 rounded bg-gray-900 border border-gray-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g 'John Doe'"
                      className="w-full p-2 mt-1 rounded bg-gray-900 border border-gray-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block font-medium">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="E.g 'Computer Science'"
                      className="w-full p-2 mt-1 rounded bg-gray-900 border border-gray-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="regNo" className="block font-medium">
                      Reg. Number
                    </label>
                    <input
                      type="text"
                      id="regNo"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="E.g '19/SC/CO/1111111'"
                      className="w-full uppercase p-2 mt-1 rounded bg-gray-900 border border-gray-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="yearOfStudy" className="block font-medium">
                      Year of Study
                    </label>
                    <input
                      type="number"
                      min={1}
                      id="yearOfStudy"
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      placeholder="E.g 'Year 2'"
                      className="w-full p-2 mt-1 rounded bg-gray-900 border border-gray-700"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </ModalContent>
            </ModalBody>
          </Modal>
        </div>
      </div>
    </main>
  );
}
