'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  TrendingUp, 
  Award, 
  Download,
  Search,
  Mail,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function AdminAlgoTradingWaitlist() {
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const fetchWaitlist = async () => {
    try {
      // TODO: Create admin API endpoint
      // const response = await fetch('/api/admin/algo-trading-waitlist')
      // const data = await response.json()
      
      // Mock data for now
      setStats({
        totalSignups: 2847,
        todaySignups: 47,
        totalReferrals: 1423,
        avgReferralsPerMember: 2.1,
        topReferrer: 'John Doe (47 referrals)',
        conversionRate: '18.5%'
      })
      
      setWaitlist([])
    } catch (error) {
      console.error('Error fetching waitlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    // TODO: Implement CSV export
    const csv = 'Name,Email,Position,Referrals,Points,Level,Status\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `algo-trading-waitlist-${new Date().toISOString()}.csv`
    a.click()
  }

  const sendBetaInvite = async (memberId: string) => {
    // TODO: Implement beta invite
    console.log('Sending beta invite to:', memberId)
  }

  const filteredWaitlist = waitlist.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Algo Trading Waitlist Management</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage signups, send beta invites, and track growth
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Signups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalSignups || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{stats?.todaySignups || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.totalReferrals || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.avgReferralsPerMember || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Top Referrer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              {stats?.topReferrer || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.conversionRate || '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="waiting">Waiting</option>
                <option value="invited">Invited</option>
                <option value="active">Active</option>
                <option value="declined">Declined</option>
              </select>

              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Members</CardTitle>
          <CardDescription>
            {filteredWaitlist.length} members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredWaitlist.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No members found</p>
              <p className="text-sm mt-2">Members will appear here as they join the waitlist</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Position</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Referrals</th>
                    <th className="text-left p-3">Points</th>
                    <th className="text-left p-3">Level</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Joined</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWaitlist.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3">
                        <Badge variant="secondary">#{member.current_position}</Badge>
                      </td>
                      <td className="p-3 font-medium">{member.name}</td>
                      <td className="p-3 text-sm text-gray-600">{member.email}</td>
                      <td className="p-3">{member.referrals_made || 0}</td>
                      <td className="p-3">{member.points || 0}</td>
                      <td className="p-3">
                        <Badge>{member.level || 1}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={
                            member.status === 'active' ? 'default' :
                            member.status === 'invited' ? 'secondary' :
                            'outline'
                          }
                        >
                          {member.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(member.signup_date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {member.status === 'waiting' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendBetaInvite(member.member_id)}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Invite
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Beta Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Send beta invitations to top members
            </p>
            <Button className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send to Top 50
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Send update to all waitlist members
            </p>
            <Button className="w-full" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View detailed growth analytics
            </p>
            <Button className="w-full" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
