import { Link } from 'react-router-dom';

export default function Signup({ lang }) {
  const isBn = lang === 'bn';
  return (
    <div className="max-w-md mx-auto my-10 bg-card text-card-foreground p-8 rounded-lg shadow-xl border-t-4 border-brandRed">
      <h2 className="text-3xl font-black text-center text-foreground mb-6 uppercase">
        {isBn ? 'নিবন্ধন করুন' : 'Sign Up'}
      </h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1 text-foreground">{isBn ? 'নাম' : 'Full Name'}</label>
          <input type="text" className="w-full border border-border bg-background text-foreground placeholder:text-muted-foreground p-2 rounded focus:outline-none focus:border-brandRed" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-foreground">{isBn ? 'ইমেইল' : 'Email'}</label>
          <input type="email" className="w-full border border-border bg-background text-foreground placeholder:text-muted-foreground p-2 rounded focus:outline-none focus:border-brandRed" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-foreground">{isBn ? 'পাসওয়ার্ড' : 'Password'}</label>
          <input type="password" className="w-full border border-border bg-background text-foreground placeholder:text-muted-foreground p-2 rounded focus:outline-none focus:border-brandRed" />
        </div>
        <button className="w-full bg-primary text-primary-foreground font-bold py-2 rounded hover:opacity-90 transition uppercase">
          {isBn ? 'সাইন আপ' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-foreground">
        {isBn ? 'আগে থেকেই অ্যাকাউন্ট আছে?' : "Already have an account?"}
        <Link to="/login" className="text-brandRed font-bold ml-1 hover:underline">{isBn ? 'লগইন করুন' : 'Login'}</Link>
      </p>
    </div>
  );
}