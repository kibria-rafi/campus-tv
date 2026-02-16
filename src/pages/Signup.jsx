import { Link } from 'react-router-dom';

export default function Signup({ lang }) {
  const isBn = lang === 'bn';
  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-lg shadow-xl border-t-4 border-brandRed">
      <h2 className="text-3xl font-black text-center text-brandBlack mb-6 uppercase">
        {isBn ? 'নিবন্ধন করুন' : 'Sign Up'}
      </h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">{isBn ? 'নাম' : 'Full Name'}</label>
          <input type="text" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-brandRed" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">{isBn ? 'ইমেইল' : 'Email'}</label>
          <input type="email" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-brandRed" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">{isBn ? 'পাসওয়ার্ড' : 'Password'}</label>
          <input type="password" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-brandRed" />
        </div>
        <button className="w-full bg-brandBlack text-white font-bold py-2 rounded hover:bg-gray-800 transition uppercase">
          {isBn ? 'সাইন আপ' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        {isBn ? 'আগে থেকেই অ্যাকাউন্ট আছে?' : "Already have an account?"} 
        <Link to="/login" className="text-brandRed font-bold ml-1 hover:underline">{isBn ? 'লগইন করুন' : 'Login'}</Link>
      </p>
    </div>
  );
}