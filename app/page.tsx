import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center my-auto gap-10 bg-zinc-50 font-sans dark:bg-black">
      <div
        className=" flex gap-10 my-80"
      >
        <Link
          href="/wallet"
          className="bg-gray-100 hover:bg-gray-300 rounded-3xl text-black p-5"
        >
          Admin Dashboard
        </Link>
        <Link
          href="/userWallet"
          className="bg-gray-100 hover:bg-gray-300 rounded-3xl text-black p-5"
        >
          User Dashboard
        </Link>
      </div>
    </div>
  );
}
