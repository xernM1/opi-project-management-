
import React from 'react';
import Card from './card';

const OverviewCard = () => {
  return (
    <Card>
      <h3 className="text-lg leading-6 font-medium text-gray-900">Company Overview</h3>
      <div className="mt-2 text-sm text-gray-600">
        {/* Content goes here, for example: */}
        <p>Revenue: $1.2M</p>
        <p>Employees: 47</p>
        <p>Year Founded: 2014</p>
        {/* ... other company overview stats */}
      </div>
    </Card>
  );
};

export default OverviewCard;
