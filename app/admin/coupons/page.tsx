'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Calendar,
  Users,
  DollarSign,
  Percent,
  Tag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase-client'

interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  times_used: number
  expires_at: string | null
  active: boolean
  created_at: string
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    max_uses: null as number | null,
    expires_at: '',
    active: true
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadCoupons()
  }, [])

  async function checkAuth() {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  async function loadCoupons() {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setCoupons(data)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading coupons:', error)
      setLoading(false)
    }
  }

  async function createCoupon() {
    if (!formData.code || formData.discount_value <= 0) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('coupons')
        .insert({
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          max_uses: formData.max_uses,
          expires_at: formData.expires_at || null,
          active: formData.active
        })

      if (!error) {
        setShowCreateForm(false)
        resetForm()
        await loadCoupons()
      } else {
        alert('Error creating coupon: ' + error.message)
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      alert('Failed to create coupon')
    }
  }

  async function updateCoupon() {
    if (!editingCoupon) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('coupons')
        .update({
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          max_uses: formData.max_uses,
          expires_at: formData.expires_at || null,
          active: formData.active
        })
        .eq('id', editingCoupon.id)

      if (!error) {
        setEditingCoupon(null)
        resetForm()
        await loadCoupons()
      } else {
        alert('Error updating coupon: ' + error.message)
      }
    } catch (error) {
      console.error('Error updating coupon:', error)
      alert('Failed to update coupon')
    }
  }

  async function deleteCoupon(couponId: string) {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return
    }

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId)

      if (!error) {
        await loadCoupons()
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('Failed to delete coupon')
    }
  }

  async function toggleCouponStatus(coupon: Coupon) {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('coupons')
        .update({ active: !coupon.active })
        .eq('id', coupon.id)

      if (!error) {
        await loadCoupons()
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error)
    }
  }

  function resetForm() {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      max_uses: null,
      expires_at: '',
      active: true
    })
  }

  function startEdit(coupon: Coupon) {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_uses: coupon.max_uses,
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      active: coupon.active
    })
    setShowCreateForm(true)
  }

  function cancelEdit() {
    setEditingCoupon(null)
    setShowCreateForm(false)
    resetForm()
  }

  const activeCoupons = coupons.filter(c => c.active).length
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.times_used, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Gift className="h-12 w-12 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white text-lg">Loading coupons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎁 Coupon Management</h1>
              <p className="text-gray-300">Create and manage discount codes</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                ← Back to Dashboard
              </button>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Coupon
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-900/50 rounded-lg">
                  <Tag className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Coupons</p>
                  <p className="text-2xl font-bold text-white">{coupons.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-900/50 rounded-lg">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Coupons</p>
                  <p className="text-2xl font-bold text-white">{activeCoupons}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-900/50 rounded-lg">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Redemptions</p>
                  <p className="text-2xl font-bold text-white">{totalRedemptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      {formData.discount_type === 'percentage' ? '%' : '$'}
                    </span>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                      placeholder="20"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md pl-8 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      min="0"
                      max={formData.discount_type === 'percentage' ? 100 : undefined}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Max Uses (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.max_uses || ''}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Unlimited"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-white">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={editingCoupon ? updateCoupon : createCoupon}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                <Button
                  onClick={cancelEdit}
                  variant="outline"
                  className="border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coupons List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">All Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            {coupons.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">No coupons yet</p>
                <p className="text-sm text-gray-500">Create your first coupon to start offering discounts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => {
                  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date()
                  const isMaxedOut = coupon.max_uses && coupon.times_used >= coupon.max_uses

                  return (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between p-4 bg-gray-750 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          coupon.active && !isExpired && !isMaxedOut
                            ? 'bg-green-900/30'
                            : 'bg-gray-700'
                        }`}>
                          <Gift className={`h-6 w-6 ${
                            coupon.active && !isExpired && !isMaxedOut
                              ? 'text-green-400'
                              : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-xl font-bold text-white font-mono">{coupon.code}</p>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              coupon.active && !isExpired && !isMaxedOut
                                ? 'bg-green-900/30 text-green-400 border border-green-700'
                                : 'bg-gray-700 text-gray-400 border border-gray-600'
                            }`}>
                              {isExpired ? 'Expired' : isMaxedOut ? 'Max Uses Reached' : coupon.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              {coupon.discount_type === 'percentage' ? (
                                <>
                                  <Percent className="h-4 w-4" />
                                  {coupon.discount_value}% off
                                </>
                              ) : (
                                <>
                                  <DollarSign className="h-4 w-4" />
                                  ${coupon.discount_value} off
                                </>
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {coupon.times_used} / {coupon.max_uses || '∞'} uses
                            </span>
                            {coupon.expires_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Expires {new Date(coupon.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCouponStatus(coupon)}
                          className={`p-2 rounded transition-colors ${
                            coupon.active
                              ? 'hover:bg-red-900/30 text-red-400'
                              : 'hover:bg-green-900/30 text-green-400'
                          }`}
                          title={coupon.active ? 'Deactivate' : 'Activate'}
                        >
                          {coupon.active ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => startEdit(coupon)}
                          className="p-2 hover:bg-blue-900/30 text-blue-400 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          className="p-2 hover:bg-red-900/30 text-red-400 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
