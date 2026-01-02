
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import NotebookPage from '../components/NotebookPage';
import { Heart } from 'lucide-react';

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-pink-50">
      <NotebookPage title="My Digital Slam Book" color="bg-white">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="mb-6 p-4 bg-pink-100 rounded-full">
            <Heart className="w-12 h-12 text-pink-500 fill-pink-500" />
          </div>
          
          <h2 className="text-2xl handwritten-bold text-gray-700 mb-8">
            {isRegister ? "Create Your Account" : "Welcome Back!"}
          </h2>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border-b-2 border-pink-200 focus:border-pink-500 outline-none handwritten text-xl transition-colors bg-transparent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border-b-2 border-pink-200 focus:border-pink-500 outline-none handwritten text-xl transition-colors bg-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-500 text-sm italic">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md disabled:opacity-50"
            >
              {loading ? "Processing..." : (isRegister ? "Start My Slam Book" : "Open My Slam Book")}
            </button>
          </form>

          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="mt-6 text-pink-600 hover:underline text-sm font-medium"
          >
            {isRegister ? "Already have a slam book? Log in" : "New here? Create your digital slam book"}
          </button>
        </div>
      </NotebookPage>
    </div>
  );
};

export default Login;
