import React from 'react';

const DataTable = ({ data, title, limit = 10 }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLightColor = (level) => {
    if (level >= 80) return '#f1c40f';
    if (level >= 60) return '#f39c12';
    if (level >= 40) return '#3498db';
    if (level >= 20) return '#7f8c8d';
    return '#2c3e50';
  };

  if (!data || data.length === 0) {
    return (
      <div style={styles.container}>
        {title && <h3 style={styles.title}>{title}</h3>}
        <div style={styles.noData}>
          <p>No sensor data available</p>
        </div>
      </div>
    );
  }

  const displayData = data.slice(0, limit);

  return (
    <div style={styles.container}>
      {title && <h3 style={styles.title}>{title}</h3>}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.headerCell}>Time</th>
              <th style={styles.headerCell}>Temperature</th>
              <th style={styles.headerCell}>Humidity</th>
              <th style={styles.headerCell}>Light</th>
              <th style={styles.headerCell}>Motion</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => (
              <tr key={index} style={styles.row}>
                <td style={styles.cell}>{formatTime(item.timestamp)}</td>
                <td style={styles.cell}>
                  <div style={styles.valueWithUnit}>
                    <span style={styles.value}>{item.temperature.toFixed(1)}</span>
                    <span style={styles.unit}>°C</span>
                  </div>
                </td>
                <td style={styles.cell}>
                  <div style={styles.valueWithUnit}>
                    <span style={styles.value}>{item.humidity.toFixed(1)}</span>
                    <span style={styles.unit}>%</span>
                  </div>
                </td>
                <td style={styles.cell}>
                  <div style={styles.lightCell}>
                    <div style={styles.lightBar}>
                      <div 
                        style={{
                          ...styles.lightFill,
                          width: `${item.light}%`,
                          backgroundColor: getLightColor(item.light)
                        }}
                      />
                    </div>
                    <span style={{ 
                      ...styles.lightValue, 
                      color: getLightColor(item.light) 
                    }}>
                      {item.light}%
                    </span>
                  </div>
                </td>
                <td style={styles.cell}>
                  <span style={{
                    ...styles.motionIndicator,
                    backgroundColor: item.motion === 1 ? '#e74c3c' : '#27ae60'
                  }}>
                    {item.motion === 1 ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={styles.footer}>
        <span style={styles.footerText}>
          Showing {displayData.length} of {data.length} total readings
        </span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 20px 0'
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '16px'
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  headerCell: {
    backgroundColor: '#f8fafc',
    padding: '16px 12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#475569',
    fontSize: '14px',
    borderBottom: '2px solid #e2e8f0',
    whiteSpace: 'nowrap'
  },
  row: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc'
    }
  },
  cell: {
    padding: '14px 12px',
    fontSize: '14px',
    color: '#334155',
    whiteSpace: 'nowrap'
  },
  valueWithUnit: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px'
  },
  value: {
    fontWeight: '600',
    fontSize: '14px'
  },
  unit: {
    fontSize: '12px',
    color: '#64748b'
  },
  lightCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: '120px'
  },
  lightBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  lightFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  lightValue: {
    fontWeight: '600',
    fontSize: '14px',
    minWidth: '40px',
    textAlign: 'right'
  },
  motionIndicator: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  footer: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e2e8f0'
  },
  footerText: {
    fontSize: '13px',
    color: '#64748b'
  }
};

export default DataTable;