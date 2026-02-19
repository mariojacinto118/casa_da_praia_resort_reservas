import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Check, AlertCircle } from 'lucide-react';
import { RESORT_INFO } from '../constants';
import { useData } from '../context/DataContext';

const Contact: React.FC = () => {
  const { sendMessage } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage(null);

    try {
      await sendMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Resetar status após 5 segundos
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error: any) {
      console.error("Erro no formulário:", error);
      setStatus('error');
      // Tenta pegar a mensagem de erro mais descritiva possível
      const msg = error.message || error.error_description || "Erro desconhecido. Verifique a console.";
      setErrorMessage(msg);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-primary mb-8 text-center">Contacte-nos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {/* Info */}
           <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                 <h3 className="font-serif text-2xl font-bold text-primary mb-4">Informações</h3>
                 <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                       <div className="bg-primary/10 p-3 rounded-full text-primary">
                          <Phone className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Telefone</p>
                          <p className="text-gray-600">{RESORT_INFO.phone}</p>
                       </div>
                    </div>
                    <div className="flex items-start space-x-4">
                       <div className="bg-primary/10 p-3 rounded-full text-primary">
                          <Mail className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Email</p>
                          <p className="text-gray-600">{RESORT_INFO.email}</p>
                       </div>
                    </div>
                    <div className="flex items-start space-x-4">
                       <div className="bg-primary/10 p-3 rounded-full text-primary">
                          <MapPin className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Localização</p>
                          <p className="text-gray-600">Praia dos Ramiros Km 32, Luanda, Angola</p>
                       </div>
                    </div>
                    <div className="flex items-start space-x-4">
                       <div className="bg-primary/10 p-3 rounded-full text-primary">
                          <Clock className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Horários</p>
                          <p className="text-gray-600">Recepção: 24h</p>
                          <p className="text-gray-600">Piscina: {RESORT_INFO.poolHours}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                 <h3 className="font-serif text-xl font-bold text-primary mb-4">Envie uma mensagem</h3>
                 <form className="space-y-4" onSubmit={handleSubmit}>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Seu Nome" 
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={status === 'loading'}
                      className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary disabled:bg-gray-100" 
                    />
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Seu Email" 
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={status === 'loading'}
                      className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary disabled:bg-gray-100" 
                    />
                    <textarea 
                      name="message"
                      placeholder="Mensagem" 
                      rows={4} 
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={status === 'loading'}
                      className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-primary disabled:bg-gray-100"
                    ></textarea>
                    
                    <button 
                      type="submit" 
                      disabled={status === 'loading' || status === 'success'}
                      className={`
                        w-full px-6 py-3 rounded-sm font-bold uppercase transition-all flex items-center justify-center space-x-2
                        ${status === 'success' ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-secondary hover:text-primary'}
                        ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}
                      `}
                    >
                      {status === 'loading' && <span>Enviando...</span>}
                      {status === 'success' && (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Mensagem Enviada!</span>
                        </>
                      )}
                      {status === 'idle' && <span>Enviar</span>}
                      {status === 'error' && <span>Tentar Novamente</span>}
                    </button>
                    
                    {status === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded p-4 mt-4 animate-fade-in">
                        <div className="flex items-center text-red-700 font-bold mb-1">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Erro ao enviar
                        </div>
                        <p className="text-sm text-red-600 mb-2">{errorMessage}</p>
                        <p className="text-xs text-gray-500">
                          Se o erro for relacionado a "RLS" ou "policy", execute o script SQL de permissões no Supabase.
                        </p>
                      </div>
                    )}
                 </form>
              </div>
           </div>

           {/* Map */}
           <div className="h-96 md:h-auto bg-gray-200 rounded-lg overflow-hidden shadow-md relative">
              <iframe 
                src="https://maps.google.com/maps?q=-9.02450,13.0661240&hl=pt&z=15&output=embed" 
                width="100%" 
                height="100%" 
                style={{border:0}} 
                allowFullScreen={true} 
                loading="lazy"
                title="Google Maps"
              ></iframe>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;