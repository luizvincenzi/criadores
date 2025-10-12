'use client';

import React, { useState } from 'react';

interface FormularioDiagnosticoProps {
  servicoPreSelecionado?: 'mentoria' | 'social-media' | 'criadores' | 'combo';
  titulo?: string;
  subtitulo?: string;
}

export default function FormularioDiagnostico({ 
  servicoPreSelecionado,
  titulo = "Agende Seu Diagnóstico Gratuito",
  subtitulo = "Fale com um especialista e descubra qual solução é ideal para o seu negócio"
}: FormularioDiagnosticoProps) {
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    telefone: '',
    email: '',
    servico_interesse: servicoPreSelecionado || '',
    faturamento_mensal: '',
    mensagem: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'lp-pmes',
          created_at: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Erro ao enviar formulário');

      setSuccess(true);
      
      // Track conversion
      if (typeof window !== 'undefined') {
        // Google Analytics
        if ((window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
            send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
            value: 1.0,
            currency: 'BRL'
          });
        }
        
        // Meta Pixel
        if ((window as any).fbq) {
          (window as any).fbq('track', 'Lead', {
            content_name: formData.servico_interesse,
            value: 1.0,
            currency: 'BRL'
          });
        }
      }

      // Redirect to thank you page after 2 seconds
      setTimeout(() => {
        window.location.href = '/obrigado';
      }, 2000);

    } catch (err) {
      setError('Erro ao enviar formulário. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="card-elevated p-8 text-center">
        <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-on-surface mb-2">Formulário Enviado!</h3>
        <p className="text-on-surface-variant mb-4">
          Obrigado! Nossa equipe entrará em contato em até 24 horas para agendar seu diagnóstico gratuito.
        </p>
        <p className="text-sm text-on-surface-variant">
          Redirecionando...
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-on-surface mb-3">
          {titulo}
        </h3>
        <p className="text-on-surface-variant">
          {subtitulo}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-on-surface mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            required
            value={formData.nome}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Seu nome"
          />
        </div>

        {/* Empresa */}
        <div>
          <label htmlFor="empresa" className="block text-sm font-medium text-on-surface mb-2">
            Nome da Empresa *
          </label>
          <input
            type="text"
            id="empresa"
            name="empresa"
            required
            value={formData.empresa}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Nome do seu negócio"
          />
        </div>

        {/* Telefone e Email */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-on-surface mb-2">
              WhatsApp *
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              required
              value={formData.telefone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="(43) 99999-9999"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
              E-mail *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        {/* Serviço de Interesse */}
        <div>
          <label htmlFor="servico_interesse" className="block text-sm font-medium text-on-surface mb-2">
            Qual solução te interessa? *
          </label>
          <select
            id="servico_interesse"
            name="servico_interesse"
            required
            value={formData.servico_interesse}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Selecione uma opção</option>
            <option value="combo">🚀 Combo Completo (Mentoria + Social Media + Criadores)</option>
            <option value="mentoria">🧠 Mentoria Estratégica</option>
            <option value="social-media">👩‍💼 Estrategista de Marketing + Social Media</option>
            <option value="criadores">🤝 Criadores Locais</option>
            <option value="nao-sei">🤔 Não sei ainda, quero ajuda para decidir</option>
          </select>
        </div>

        {/* Faturamento Mensal */}
        <div>
          <label htmlFor="faturamento_mensal" className="block text-sm font-medium text-on-surface mb-2">
            Faturamento Mensal Aproximado
          </label>
          <select
            id="faturamento_mensal"
            name="faturamento_mensal"
            value={formData.faturamento_mensal}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Prefiro não informar</option>
            <option value="ate-10k">Até R$ 10.000</option>
            <option value="10k-30k">R$ 10.000 - R$ 30.000</option>
            <option value="30k-50k">R$ 30.000 - R$ 50.000</option>
            <option value="50k-100k">R$ 50.000 - R$ 100.000</option>
            <option value="100k-mais">Acima de R$ 100.000</option>
          </select>
        </div>

        {/* Mensagem */}
        <div>
          <label htmlFor="mensagem" className="block text-sm font-medium text-on-surface mb-2">
            Conte um pouco sobre seu desafio (opcional)
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            rows={4}
            value={formData.mensagem}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Ex: Preciso aumentar o movimento no meu restaurante..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-error-container rounded-xl text-error text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Agendar Diagnóstico Gratuito'}
        </button>

        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-on-surface-variant pt-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Sem compromisso</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Resposta em 24h</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>100% gratuito</span>
          </div>
        </div>
      </form>
    </div>
  );
}

