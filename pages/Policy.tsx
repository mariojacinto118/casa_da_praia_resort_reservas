import React from 'react';

const Policy: React.FC = () => {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-light">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-serif text-4xl font-bold text-primary mb-8">Política de Cancelamento e Reembolso</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-dark mb-2">1. Cancelamento de Reserva</h2>
            <p>
              As reservas podem ser canceladas gratuitamente até 7 dias antes da data de check-in. 
              Cancelamentos feitos com menos de 7 dias de antecedência estarão sujeitos a uma taxa de 50% do valor total da reserva.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-2">2. No-Show (Não Comparência)</h2>
            <p>
              Em caso de não comparência sem aviso prévio, será cobrado 100% do valor total da reserva e o quarto será liberado após 24 horas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-2">3. Check-in e Check-out</h2>
            <p>
              <strong>Check-in:</strong> A partir das 14h00.<br/>
              <strong>Check-out:</strong> Até às 12h00.<br/>
              Late check-out está sujeito a disponibilidade e taxas adicionais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-2">4. Reembolsos</h2>
            <p>
              Os reembolsos, quando aplicáveis, serão processados num prazo de até 15 dias úteis através do mesmo método de pagamento utilizado na reserva.
            </p>
          </section>

           <section>
            <h2 className="text-xl font-bold text-dark mb-2">5. Alteração de Preços</h2>
            <p>
              A Casa da Praia reserva-se o direito de alterar os preços dos serviços e acomodações sem aviso prévio. Reservas já confirmadas não sofrerão alteração de valor.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Policy;