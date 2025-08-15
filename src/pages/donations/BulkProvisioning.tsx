import { useState, useMemo } from 'react'
import { DataTable } from '@components/DataTable'
// // import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
// ProvisionRequestForm import removed as it was unused
import { ProvisionAnalytics } from '@components/ProvisionAnalytics'
import { ProvisionFilters } from '@components/ProvisionFilters'
import { ProvisionModals } from '@components/ProvisionModals'
import { getRequestColumns, getItemColumns, getPaymentColumns } from '@components/ProvisionTableColumns'
// Mock data kaldırıldı - gerçek API'den veri gelecek
import type { ProvisionRequest, ProvisionItem, Payment } from '@/types/provision'
import { log } from '@/utils/logger'


export default function BulkProvisioning() {
  const [requests] = useState<ProvisionRequest[]>([])
  const [items] = useState<ProvisionItem[]>([])
  const [payments] = useState<Payment[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'requests' | 'items' | 'payments' | 'analytics'>('requests')
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false)
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ProvisionRequest | null>(null)

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesQuery = JSON.stringify(request).toLowerCase().includes(query.toLowerCase())
      const matchesStatus = !statusFilter || request.status === statusFilter
      const matchesPriority = !priorityFilter || request.priority === priorityFilter
      const matchesDepartment = !departmentFilter || request.department.toLowerCase().includes(departmentFilter.toLowerCase())
      const matchesApproval = !approvalFilter || request.approvalStatus === approvalFilter
      const matchesPayment = !paymentFilter || request.paymentStatus === paymentFilter
      const matchesDate = !dateFilter || request.requestDate.includes(dateFilter)
      
      return matchesQuery && matchesStatus && matchesPriority && matchesDepartment && 
             matchesApproval && matchesPayment && matchesDate
    })
  }, [requests, query, statusFilter, priorityFilter, departmentFilter, approvalFilter, paymentFilter, dateFilter])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesQuery = JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
      return matchesQuery
    })
  }, [items, query])

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesQuery = JSON.stringify(payment).toLowerCase().includes(query.toLowerCase())
      return matchesQuery
    })
  }, [payments, query])

  // Handler functions
  const handleViewItems = (request: ProvisionRequest) => {
    setSelectedRequest(request)
    setIsItemsModalOpen(true)
  }

  const handleViewPayments = (request: ProvisionRequest) => {
    setSelectedRequest(request)
    setIsPaymentsModalOpen(true)
  }

  const handleApproval = (request: ProvisionRequest) => {
    setSelectedRequest(request)
    setIsApprovalModalOpen(true)
  }

  const handleApprovalSubmit = (approvalData: { status: string; notes: string }) => {
    // Approval submission logic here
    log.info('Approval data:', approvalData)
    setIsApprovalModalOpen(false)
    setSelectedRequest(null)
  }

  // Column definitions from ProvisionTableColumns
  const requestColumns = getRequestColumns({
    onViewItems: handleViewItems,
    onViewPayments: handleViewPayments,
    onApproval: handleApproval,
    requests
  })
  const itemColumns = getItemColumns(requests)
  const paymentColumns = getPaymentColumns(requests)

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Toplu Provizyon Alma</h2>
            <div className="flex border rounded">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'requests' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Talepler
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'items' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Kalemler
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'payments' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Ödemeler
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'analytics' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Analitik
              </button>
            </div>
          </div>
          {activeTab === 'requests' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Yeni Talep
            </button>
          )}
        </div>

        {activeTab === 'requests' && (
          <>
            <ProvisionFilters
              query={query}
              setQuery={setQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              approvalFilter={approvalFilter}
              setApprovalFilter={setApprovalFilter}
              paymentFilter={paymentFilter}
              setPaymentFilter={setPaymentFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              // exportCallback kaldırıldı: Component props'unda yoktu; dışarıdan butonla indiriliyor
            />

            <DataTable columns={requestColumns} data={filteredRequests} />
          </>
        )}

        {activeTab === 'items' && (
          <>
            <div className="mb-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border rounded px-3 py-2 w-full max-w-md"
                placeholder="Kalem adı, tedarikçi ile ara..."
              />
            </div>
            <DataTable columns={itemColumns} data={filteredItems} />
          </>
        )}

        {activeTab === 'payments' && (
          <>
            <div className="mb-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border rounded px-3 py-2 w-full max-w-md"
                placeholder="Referans no, ödeyen kişi ile ara..."
              />
            </div>
            <DataTable columns={paymentColumns} data={filteredPayments} />
          </>
        )}

        {activeTab === 'analytics' && (
          <ProvisionAnalytics requests={filteredRequests} />
        )}
      </div>

      <ProvisionModals
        selectedRequest={selectedRequest}
        items={items}
        payments={payments}
        requests={requests}
        isItemsModalOpen={isItemsModalOpen}
        setIsItemsModalOpen={setIsItemsModalOpen}
        isPaymentsModalOpen={isPaymentsModalOpen}
        setIsPaymentsModalOpen={setIsPaymentsModalOpen}
        isApprovalModalOpen={isApprovalModalOpen}
        setIsApprovalModalOpen={setIsApprovalModalOpen}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        onApprovalSubmit={handleApprovalSubmit}
      />
    </div>
  )
}
