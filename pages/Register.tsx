import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Auto login usually happens, or check email confirmation
      if (data.session) {
          navigate('/profile');
      } else {
          // If email confirmation is on
          setError('Registo efetuado! Por favor verifique o seu email.');
          setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full bg-white shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-secondary p-8 text-center">
           <h2 className="font-serif text-3xl text-primary mb-2">Criar Conta</h2>
           <p className="text-primary/70 text-sm">Junte-se ao Casa da Praia Exclusive Club.</p>
        </div>

        <div className="p-8">
           {error && (
             <div className={`p-3 rounded text-sm mb-6 border ${error.includes('verifique') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
               {error}
             </div>
           )}

           <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                    placeholder="Seu Nome"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-secondary text-primary py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? 'Criando...' : <span>Registar</span>}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
           </form>

           <div className="mt-8 text-center text-sm text-gray-500">
             Já tem conta?{' '}
             <Link to="/login" className="text-primary font-bold hover:underline">
               Fazer Login
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Register;