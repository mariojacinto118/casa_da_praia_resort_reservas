import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full bg-white shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-primary p-8 text-center">
           <h2 className="font-serif text-3xl text-white mb-2">Bem-vindo de volta</h2>
           <p className="text-white/70 text-sm">Acesse sua conta para gerir suas reservas.</p>
        </div>

        <div className="p-8">
           {error && (
             <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-6 border border-red-100">
               {error === 'Invalid login credentials' ? 'Email ou palavra-passe incorretos.' : error}
             </div>
           )}

           <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Palavra-passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? 'Entrando...' : <span>Entrar</span>}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
           </form>

           <div className="mt-8 text-center text-sm text-gray-500">
             Ainda não tem conta?{' '}
             <Link to="/register" className="text-secondary font-bold hover:underline">
               Criar Conta
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;