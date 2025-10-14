'use client';

import React from 'react';

interface ProblemaSectionProps {
  problema: {
    title: string;
    subtitle?: string;
    agitation?: string;
    problems: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
}

export default function ProblemaSection({ problema }: ProblemaSectionProps) {
  return (
    <section className="py-20 bg-surface-container">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
            {problema.title}
          </h2>
          {problema.subtitle && (
            <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
              {problema.subtitle}
            </p>
          )}
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {problema.problems.map((problem, idx) => (
            <div key={idx} className="card-elevated p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl mb-4">{problem.icon}</div>
              <h3 className="text-xl font-bold text-on-surface mb-3">{problem.title}</h3>
              <p className="text-on-surface-variant">{problem.description}</p>
            </div>
          ))}
        </div>

        {/* Agitation */}
        {problema.agitation && (
          <div className="mt-12 text-center">
            <p className="text-lg text-on-surface-variant max-w-3xl mx-auto italic border-l-4 border-primary pl-6">
              {problema.agitation}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

