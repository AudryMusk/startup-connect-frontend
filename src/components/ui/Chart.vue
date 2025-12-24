<template>
  <div class="chart-container" :style="{ height: height }">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'].includes(value),
  },
  data: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  height: {
    type: String,
    default: '300px',
  },
})

const chartCanvas = ref(null)
let chartInstance = null
let Chart = null

// Default color palette
const defaultColors = [
  'rgba(220, 38, 38, 0.8)', // red-600
  'rgba(37, 99, 235, 0.8)', // blue-600
  'rgba(16, 185, 129, 0.8)', // emerald-500
  'rgba(245, 158, 11, 0.8)', // amber-500
  'rgba(139, 92, 246, 0.8)', // violet-500
  'rgba(236, 72, 153, 0.8)', // pink-500
  'rgba(6, 182, 212, 0.8)', // cyan-500
  'rgba(132, 204, 22, 0.8)', // lime-500
  'rgba(249, 115, 22, 0.8)', // orange-500
  'rgba(99, 102, 241, 0.8)', // indigo-500
]

const defaultBorderColors = [
  'rgba(220, 38, 38, 1)',
  'rgba(37, 99, 235, 1)',
  'rgba(16, 185, 129, 1)',
  'rgba(245, 158, 11, 1)',
  'rgba(139, 92, 246, 1)',
  'rgba(236, 72, 153, 1)',
  'rgba(6, 182, 212, 1)',
  'rgba(132, 204, 22, 1)',
  'rgba(249, 115, 22, 1)',
  'rgba(99, 102, 241, 1)',
]

const loadChart = async () => {
  // Dynamic import of Chart.js (CDN fallback)
  if (!window.Chart) {
    await loadChartFromCDN()
  }
  Chart = window.Chart
}

const loadChartFromCDN = () => {
  return new Promise((resolve, reject) => {
    if (window.Chart) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const prepareData = (data) => {
  // Add default colors if not provided
  const preparedData = { ...data }

  if (preparedData.datasets) {
    preparedData.datasets = preparedData.datasets.map((dataset, index) => {
      const prepared = { ...dataset }

      // For pie/doughnut charts, apply colors to each segment
      if (['pie', 'doughnut', 'polarArea'].includes(props.type)) {
        if (!prepared.backgroundColor) {
          prepared.backgroundColor = defaultColors.slice(0, data.labels?.length || 10)
        }
        if (!prepared.borderColor) {
          prepared.borderColor = defaultBorderColors.slice(0, data.labels?.length || 10)
        }
      } else {
        // For other charts, apply single color per dataset
        if (!prepared.backgroundColor) {
          prepared.backgroundColor = defaultColors[index % defaultColors.length]
        }
        if (!prepared.borderColor) {
          prepared.borderColor = defaultBorderColors[index % defaultBorderColors.length]
        }
      }

      return prepared
    })
  }

  return preparedData
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 13,
      },
      padding: 12,
      cornerRadius: 8,
    },
  },
}

const createChart = () => {
  if (!chartCanvas.value || !Chart) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  const preparedData = prepareData(props.data)

  chartInstance = new Chart(ctx, {
    type: props.type,
    data: preparedData,
    options: {
      ...defaultOptions,
      ...props.options,
    },
  })
}

watch(
  () => props.data,
  () => {
    createChart()
  },
  { deep: true }
)

watch(
  () => props.type,
  () => {
    createChart()
  }
)

onMounted(async () => {
  await loadChart()
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
}
</style>
