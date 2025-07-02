import type { NextApiRequest, NextApiResponse } from 'next'

type Stats = {
  totalUsers: number
  revenue: number
  activeSessions: number
  conversionRate: number
  userGrowth: number[]
  revenueData: number[]
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Stats>
) {
  // Simulated dashboard statistics
  const stats = {
    totalUsers: 12345,
    revenue: 54321,
    activeSessions: 1234,
    conversionRate: 3.2,
    userGrowth: [1200, 1350, 1500, 1800, 2100, 2400, 2800],
    revenueData: [5000, 6000, 7500, 8000, 9500, 11000, 12500]
  }

  res.status(200).json(stats)
}
