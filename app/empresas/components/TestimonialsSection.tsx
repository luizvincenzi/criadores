'use client';

import React from 'react';
import Image from 'next/image';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  image: string;
  quote: string;
  results: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Maria Silva",
    role: "Proprietária",
    company: "Boutique Estilo Único",
    image: "/placeholder-avatar-1.jpg",
    quote: "Depois de 2 campanhas com criadores locais, triplicamos nossas vendas online. O melhor é que agora temos clientes que vêm até a loja física porque viram no Instagram de influenciadoras da região!",
    results: "3x vendas em 60 dias"
  },
  {
    name: "Carlos Mendes",
    role: "Gerente de Marketing",
    company: "Academia FitZone",
    image: "/placeholder-avatar-2.jpg",
    quote: "Antes gastávamos R$ 15 mil por mês com agência e não víamos resultado. Com a crIAdores, investimos R$ 4 mil e conseguimos 127 novos alunos em um mês. A plataforma é intuitiva e o suporte é excepcional.",
    results: "127 novos alunos/mês"
  },
  {
    name: "Ana Paula Costa",
    role: "CEO",
    company: "Restaurante Sabor da Terra",
    image: "/placeholder-avatar-3.jpg",
    quote: "Nunca imaginei que trabalhar com criadores de conteúdo seria tão fácil. A IA da plataforma me ajudou a criar o briefing perfeito e em 3 dias já tínhamos 15 criadores interessados. Nosso movimento aumentou 40% nos finais de semana!",
    results: "+40% movimento"
  },
  {
    name: "Roberto Almeida",
    role: "Fundador",
    company: "Clínica Odonto Smile",
    image: "/placeholder-avatar-4.jpg",
    quote: "O que mais me impressionou foi a qualidade dos criadores. Todos verificados, com público real e engajamento autêntico. Fechamos 23 novos pacientes direto das campanhas e ainda ganhamos autoridade na região.",
    results: "23 novos pacientes"
  },
  {
    name: "Juliana Ferreira",
    role: "Diretora Comercial",
    company: "Loja de Móveis Design Casa",
    image: "/placeholder-avatar-5.jpg",
    quote: "Testamos várias plataformas antes, mas a crIAdores é a única que realmente entende PME. Conseguimos gerenciar 3 campanhas simultâneas sem precisar contratar ninguém. ROI de 580% no primeiro trimestre!",
    results: "ROI 580%"
  },
  {
    name: "Pedro Santos",
    role: "Proprietário",
    company: "Pet Shop Amigo Fiel",
    image: "/placeholder-avatar-6.jpg",
    quote: "Como pequeno empresário, sempre achei que marketing com influenciadores era só para grandes marcas. A crIAdores provou que estava errado. Investimento acessível e resultados que superam qualquer anúncio pago que já fizemos.",
    results: "Melhor ROI em 5 anos"
  }
];

export default function TestimonialsSection() {
  return (
    <section id="depoimentos" className="py-20 bg-gradient-to-br from-primary-container/30 to-secondary-container/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
            Empresas Reais, Resultados Reais
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Veja como PMEs como a sua estão crescendo com marketing de criadores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card-elevated p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-lg mr-3">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">{testimonial.name}</h3>
                  <p className="text-sm text-on-surface-variant">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-on-surface-variant mb-4 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Results Badge */}
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-secondary-container text-secondary text-sm font-semibold">
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {testimonial.results}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-on-surface-variant">PMEs Ativas</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">2.5k+</div>
            <div className="text-sm text-on-surface-variant">Criadores Verificados</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">15k+</div>
            <div className="text-sm text-on-surface-variant">Campanhas Realizadas</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">4.8/5</div>
            <div className="text-sm text-on-surface-variant">Avaliação Média</div>
          </div>
        </div>
      </div>
    </section>
  );
}

