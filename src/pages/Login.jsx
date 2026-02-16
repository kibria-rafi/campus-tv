import { Link } from 'react-router-dom';

export default function Login({ lang }) {
  const isBn = lang === 'bn';
  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-lg shadow-xl border-t-4 border-brandRed">
      <h2 className="text-3xl font-black text-center text-brandBlack mb-6 uppercase">
        {isBn ? 'লগইন করুন' : 'Login'}
      </h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">{isBn ? 'ইমেইল' : 'Email'}</label>
          <input type="email" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-brandRed" placeholder="example@mail.com" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">{isBn ? 'পাসওয়ার্ড' : 'Password'}</label>
          <input type="password" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-brandRed" placeholder="*******" />
        </div>
        <button className="w-full bg-brandRed text-white font-bold py-2 rounded hover:bg-red-700 transition uppercase">
          {isBn ? 'প্রবেশ করুন' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        {isBn ? 'অ্যাকাউন্ট নেই?' : "Don't have an account?"} 
        <Link to="/signup" className="text-brandRed font-bold ml-1 hover:underline">{isBn ? 'নতুন তৈরি করুন' : 'Sign Up'}</Link>
      </p>
    </div>
  );
}