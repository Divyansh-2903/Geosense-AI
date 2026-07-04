let trendsChartInstance = null;

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Initializes or updates the NDVI/NDWI trends chart.
 * @param {string} canvasId - The canvas element ID.
 * @param {Array} ndviData - Array of objects containing {month, ndvi}.
 * @param {Array} ndwiData - Array of objects containing {month, ndwi}.
 */
function updateTrendsChart(canvasId, ndviData, ndwiData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Sort data by month to ensure line goes in chronological order
  const sortedNDVI = [...ndviData].sort((a, b) => a.month - b.month);
  const sortedNDWI = [...ndwiData].sort((a, b) => a.month - b.month);
  
  const labels = sortedNDVI.map(item => MONTH_NAMES[item.month - 1] || `Month ${item.month}`);
  const ndviValues = sortedNDVI.map(item => item.ndvi !== null && item.ndvi > -990 ? parseFloat(item.ndvi.toFixed(3)) : null);
  const ndwiValues = sortedNDWI.map(item => item.ndwi !== null && item.ndwi > -990 ? parseFloat(item.ndwi.toFixed(3)) : null);

  // If a chart instance already exists, destroy it to draw fresh
  if (trendsChartInstance) {
    trendsChartInstance.destroy();
  }

  // Create gradient fills
  const ndviGradient = ctx.createLinearGradient(0, 0, 0, 300);
  ndviGradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
  ndviGradient.addColorStop(1, 'rgba(16, 185, 129, 0.00)');

  const ndwiGradient = ctx.createLinearGradient(0, 0, 0, 300);
  ndwiGradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
  ndwiGradient.addColorStop(1, 'rgba(59, 130, 246, 0.00)');

  trendsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'NDVI (Vegetation Vigour)',
          data: ndviValues,
          borderColor: '#10b981',
          borderWidth: 3,
          backgroundColor: ndviGradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointHoverRadius: 7,
          pointRadius: 4,
          spanGaps: true
        },
        {
          label: 'NDWI (Water Content)',
          data: ndwiValues,
          borderColor: '#3b82f6',
          borderWidth: 3,
          backgroundColor: ndwiGradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointHoverRadius: 7,
          pointRadius: 4,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: {
              family: 'Outfit',
              size: 12,
              weight: '500'
            },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f8fafc',
          bodyColor: '#f8fafc',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleFont: {
            family: 'Outfit',
            size: 13,
            weight: 'bold'
          },
          bodyFont: {
            family: 'Outfit',
            size: 12
          },
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.04)',
            borderColor: 'rgba(255, 255, 255, 0.08)'
          },
          ticks: {
            color: '#94a3b8',
            font: {
              family: 'Outfit',
              size: 11
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.04)',
            borderColor: 'rgba(255, 255, 255, 0.08)'
          },
          ticks: {
            color: '#94a3b8',
            font: {
              family: 'Outfit',
              size: 11
            }
          },
          min: -1.0,
          max: 1.0
        }
      }
    }
  });
}

// Attach helper to window object for access from app.js
window.updateTrendsChart = updateTrendsChart;
