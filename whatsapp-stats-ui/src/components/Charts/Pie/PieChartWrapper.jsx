import React from 'react';
import { PieChart, Pie, Tooltip, Legend } from 'recharts';

const PieChartWrapper = ({ data }) => {
  return (
    <PieChart width={400} height={400}>
      <Tooltip />
      <Legend />
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        outerRadius={90}
        fill="#8884d8"
        label
      />
    </PieChart>
  );
};

export default PieChartWrapper;