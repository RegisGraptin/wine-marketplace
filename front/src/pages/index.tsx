import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Card from "../components/Card"

const Home: NextPage = () => {
  return (
    <div className="flex flex-col justify-center">
      <header className='flex justify-end px-5 py-2 border-b border-slate-200'>
      <ConnectButton />
      </header>
      <div className='flex justify-center mt-5 text-3xl font-bold'>Wine-Marketplace🍷
      </div>
    <Card />
    </div>
  );
};

export default Home;
