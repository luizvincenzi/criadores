'use client';

import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Funciona para minha empresa mesmo que eu nunca tenha feito campanhas com criadores?",
    answer: "Sim! A plataforma foi criada justamente para PMEs que estão começando. Nossa IA te guia em cada etapa, desde a criação da campanha até a seleção dos criadores ideais. Você não precisa de experiência prévia - nós simplificamos todo o processo."
  },
  {
    question: "Como vocês garantem que os criadores são confiáveis?",
    answer: "Todos os criadores passam por um processo de verificação rigoroso. Analisamos histórico, engajamento real (não apenas números), autenticidade do público e reputação. Além disso, você tem acesso a avaliações de outras empresas que já trabalharam com cada criador."
  },
  {
    question: "Quanto custa usar a plataforma?",
    answer: "Você pode criar sua conta gratuitamente e explorar a plataforma sem compromisso. Cobramos apenas quando você decide ativar uma campanha. Nossos planos são flexíveis e adaptados ao tamanho da sua empresa - muito mais acessível que contratar uma agência."
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim, sem burocracia! Não temos contratos de fidelidade. Você pode pausar ou cancelar suas campanhas a qualquer momento. Acreditamos em resultados, não em amarras contratuais."
  },
  {
    question: "Como funciona o pagamento aos criadores?",
    answer: "Nós gerenciamos todo o processo de pagamento de forma segura. Você deposita o valor da campanha na plataforma, e só liberamos o pagamento aos criadores após a entrega e aprovação do conteúdo. Isso garante segurança para ambos os lados."
  },
  {
    question: "Quanto tempo leva para ver resultados?",
    answer: "Muitas empresas começam a ver engajamento nas primeiras 48h após o lançamento do conteúdo. Resultados de vendas variam conforme seu produto e estratégia, mas a maioria dos nossos clientes reporta aumento mensurável em até 2 semanas."
  },
  {
    question: "Vocês ajudam a criar o briefing da campanha?",
    answer: "Sim! Nossa IA conversacional te ajuda a estruturar um briefing profissional através de perguntas simples. Além disso, oferecemos templates testados e aprovados para diferentes tipos de campanhas."
  },
  {
    question: "E se eu não gostar do conteúdo criado?",
    answer: "Você tem direito a revisões antes de aprovar o conteúdo. Definimos isso no início da campanha. Se mesmo assim não ficar satisfeito, você pode solicitar ajustes ou, em casos extremos, cancelar sem custos adicionais."
  },
  {
    question: "A plataforma funciona para qualquer tipo de negócio?",
    answer: "Sim! Atendemos desde restaurantes, academias e salões de beleza até lojas de roupas, serviços profissionais e e-commerces. Se você quer alcançar clientes locais ou regionais, a plataforma funciona para você."
  },
  {
    question: "Preciso fornecer produtos grátis para os criadores?",
    answer: "Depende da sua estratégia. Algumas empresas preferem enviar produtos (permuta), outras preferem apenas pagamento em dinheiro, e muitas fazem uma combinação. Nossa plataforma suporta todos os modelos - você escolhe o que faz mais sentido para seu negócio."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Tudo o que você precisa saber para começar com confiança
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="card-elevated overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-surface-container-high transition-colors"
              >
                <span className="font-semibold text-on-surface pr-8">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-on-surface-variant leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-on-surface-variant mb-4">
            Ainda tem dúvidas?
          </p>
          <a
            href="https://wa.me/554391936400"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outlined inline-flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Falar com Especialista</span>
          </a>
        </div>
      </div>
    </section>
  );
}

