// components/CompanyOverviewSection.tsx
import React from 'react';
import Section from '@/app/component/section';
import OverviewCard from '@/app/component/overviewCard';
``
interface CompanySectionProps {
  companyId: string| null;
}

const OverviewSection: React.FC<CompanySectionProps> = ({ companyId }) => {

  return (
    <Section title="Company Overview">
      <OverviewCard />
      {/* You can include more cards or content related to the company overview here */}
    </Section>
  );
};

export default OverviewSection;
