import React from 'react';

const Section = ({ children, title }: { children: React.ReactNode, title: string }) => {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
};

export default Section;
