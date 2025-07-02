import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Chart } from '@/components/dashboard/chart'
import { Plus } from 'lucide-react'

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Header sidebarCollapsed={sidebarCollapsed} />
      
      <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total Users"
              value="12,345"
              trend={+12.5}
              icon="users"
            />
            <StatsCard
              title="Revenue"
              value="$54,321"
              trend={-2.3}
              icon="dollar"
            />
            <StatsCard
              title="Active Sessions"
              value="1,234"
              trend={+5.7}
              icon="activity"
            />
            <StatsCard
              title="Conversion Rate"
              value="3.2%"
              trend={+0.8}
              icon="percent"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
              <Chart type="area" height={300} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">User Growth</h3>
              <Chart type="bar" height={300} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <DataTable />
          </div>
        </div>
      </main>

      <button
        className="fixed right-6 bottom-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
