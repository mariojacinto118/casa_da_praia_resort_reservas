import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
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

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!otpSent) {
        // Enviar OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone.startsWith('+') ? phone : `+244${phone.replace(/\s/g, '')}`,
        });

        if (error) throw error;
        setOtpSent(true);
      } else {
        // Verificar OTP
        const { error } = await supabase.auth.verifyOtp({
          phone: phone.startsWith('+') ? phone : `+244${phone.replace(/\s/g, '')}`,
          token: otp,
          type: 'sms',
        });

        if (error) throw error;
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Verifique o número e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full bg-white shadow-xl overflow-hidden border border-gray-100 rounded-lg">
        <div className="bg-primary p-8 text-center">
           <h2 className="font-serif text-3xl text-white mb-2">Bem-vindo de volta</h2>
           <p className="text-white/70 text-sm">Acesse sua conta para gerir suas reservas.</p>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setAuthMethod('email'); setError(null); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${authMethod === 'email' ? 'text-primary border-b-2 border-primary bg-stone-50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Email
          </button>
          <button
            onClick={() => { setAuthMethod('phone'); setError(null); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${authMethod === 'phone' ? 'text-primary border-b-2 border-primary bg-stone-50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Telefone
          </button>
        </div>

        <div className="p-8">
           {error && (
             <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-6 border border-red-100">
               {error === 'Invalid login credentials' ? 'Credenciais incorretas.' : error}
             </div>
           )}

           {authMethod === 'email' ? (
             <form onSubmit={handleEmailLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded uppercase tracking-[0.2em] text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {loading ? 'Entrando...' : <span>Entrar com Email</span>}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
             </form>
           ) : (
             <form onSubmit={handlePhoneLogin} className="space-y-6">
                {!otpSent ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Número de Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                        placeholder="923 000 000"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Enviaremos um código SMS para verificação.</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Código de Verificação</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all tracking-widest text-lg"
                        placeholder="123456"
                        required
                        maxLength={6}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setOtpSent(false)} 
                      className="text-xs text-secondary hover:underline mt-2"
                    >
                      Alterar número de telefone
                    </button>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded uppercase tracking-[0.2em] text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {loading ? 'Processando...' : <span>{otpSent ? 'Verificar Código' : 'Enviar Código SMS'}</span>}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
             </form>
           )}

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