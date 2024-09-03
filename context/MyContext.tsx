import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { useAccount, useReadContract } from "wagmi";
//@ts-ignore
import WeaveDB from "weavedb-sdk";
import abi from "../contract/voting-contract.json";

interface Profile {
  email: string;
  name: string;
  department: string;
  regNumber: string;
  yearOfStudy: string;
}

interface MyContextType {
  db: WeaveDB | null;
  saveProfile: (profile: Profile) => Promise<unknown>;
  email: string;
  name: string;
  department: string;
  regNumber: string;
  yearOfStudy: string;
  imgHash: string;
  setEmail: Dispatch<SetStateAction<string>>;
  setName: Dispatch<SetStateAction<string>>;
  setDepartment: Dispatch<SetStateAction<string>>;
  setRegNumber: Dispatch<SetStateAction<string>>;
  setYearOfStudy: Dispatch<SetStateAction<string>>;
  setImgHash: Dispatch<SetStateAction<string>>;
  updateProfile: (profile: Profile) => Promise<unknown>;
  userData:
    | {
        id: string;
        setter: string;
        data: {};
      }
    | undefined;
  isAdmin: boolean;
  votingContract: `0x${string}`;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID;

export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const votingContract = "0xab57b81cd0d32194ca9654bc6f18bdd583786d5d";
  const { address, isConnected } = useAccount();
  const [db, setDb] = useState<WeaveDB | null>(null);
  const [userData, setUserData] = useState<
    | {
        id: string;
        setter: string;
        data: {};
      }
    | undefined
  >(undefined);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [imgHash, setImgHash] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const setupWeaveDB = async () => {
      try {
        const _db = new WeaveDB({
          contractTxId,
        });

        await _db.init();
        setDb(_db);
      } catch (error) {
        console.error("Error setting up WeaveDB:", error);
      }
    };

    if (address) {
      setupWeaveDB();
    }
  }, [address]);

  useEffect(() => {
    if (address === "0x9c383a628Ce60F5CE4EFAd90AD3835F39eBbA6ce" || "0x6237f4a05a64BCafeD3A6BE511D1aDc9ec686602") {
      setIsAdmin(true);
    }
  }, [address]);

  useEffect(() => {
    const getUserDetails = async () => {
      const user = await db.cget!("profile", ["user_address", "==", address]);
      if (user && user.length > 0) {
        const userData = user[0].data;
        setUserData(user[0]);
        setEmail(userData.email);
        setName(userData.name);
        setDepartment(userData.department);
        setRegNumber(userData.regNumber);
        setYearOfStudy(userData.yearOfStudy);
        setImgHash(userData.imgHash);
      } else {
        console.error("No user data found");
      }
    };

    if (isConnected && db) {
      getUserDetails();
    }
  }, [address, db, isConnected]);

  const getUserDetails = async () => {
    const user = await db.cget!("profile", ["user_address", "==", address]);
    setUserData(user[0]);
    setEmail(user[0].data.email);
    setName(user[0].data.name);
    setDepartment(user[0].data.department);
    setRegNumber(user[0].data.regNumber);
    setYearOfStudy(user[0].data.yearOfStudy);
    setImgHash(user[0].data.imgHash);
  };

  const saveProfile = async (profile: Profile) => {
    if (!db) {
      throw new Error("WeaveDB is not initialized");
    }

    try {
      const setProfile = await db.add(profile, "profile");

      if (setProfile.success) {
        console.log("Profile Saved!");
        getUserDetails();
      }
    } catch (error) {
      return error;
    }
  };

  const updateProfile = async (profile: Profile) => {
    if (!db) {
      throw new Error("WeaveDB is not initialized");
    }

    try {
      await db.update(profile, "profile", userData!.id);
      await getUserDetails();
    } catch (error) {
      return error;
    }
  };
  
  return (
    <MyContext.Provider
      value={{
        db,
        saveProfile,
        email,
        name,
        regNumber,
        department,
        yearOfStudy,
        imgHash,
        userData,
        setEmail,
        setName,
        setRegNumber,
        setDepartment,
        setYearOfStudy,
        setImgHash,
        updateProfile,
        isAdmin,
        votingContract
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
