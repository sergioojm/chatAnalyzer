import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fmt } from '../../utils/helpers';

const TopWordsBar = ({ data }) => {
  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis type="number" />
          <YAxis type="category" dataKey="word" />
          <Tooltip formatter={(value) => [`${fmt(value)}`, 'Count']} />
          <Bar dataKey="count" fill="#34D399" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopWordsBar;