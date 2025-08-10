import React from 'react';
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from 'recharts';

const COLORS = ['#ff4d4d', '#4caf50', '#2196f3'];

const Analytics = ({ vehicles, history }) => {
  const fast = vehicles.filter(v => v.speed > 50).length;
  const slow = vehicles.filter(v => v.speed > 0 && v.speed <= 50).length;
  const idle = vehicles.filter(v => v.speed === 0).length;

  const pieData = [
    { name: 'Fast', value: fast },
    { name: 'Slow', value: slow },
    { name: 'Idle', value: idle }
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Fleet Analytics</h2>

      {/* Pie Chart */}
      <PieChart width={300} height={300}>
        <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
          {pieData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      {/* Speed over time */}
      <LineChart width={500} height={300} data={history}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="avgSpeed" stroke="#8884d8" />
      </LineChart>

    </div>
  );
};

export default Analytics;
