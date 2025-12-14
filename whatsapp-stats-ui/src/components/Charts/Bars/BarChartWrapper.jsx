import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const BarChartWrapper = ({ data, dataKey, title }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3 style={{ textAlign: 'center', color: 'white' }}>{title}</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey={dataKey} fill="#34c759" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartWrapper;