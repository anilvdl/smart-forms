import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { Table, Column } from '../../components/admin/ui/Table'
import { useUsers } from '../../hooks/useUsers'
import styles from '../../styles/adminDashboard.module.css'

export default function UsersPage() {
  // --- table state ---
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [sortKey, setSortKey] = useState<string>()
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // --- fetch via SWR hook ---
  const { data, isLoading, error } = useUsers({
    page,
    pageSize,
    sortKey,
    sortDir,
  })

  // data might be UsersResponse or a raw User[] array
  const raw = Array.isArray(data) ? data : data?.users ?? []
  // map userId→id so your Table sees the right field
  const rows = raw.map((u: any) => ({
    id: u.userId,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    lastLogin: u.lastLogin,
  }))
  const total = Array.isArray(data) ? raw.length : data?.total ?? 0

  // --- column defs ---
  const columns: Column<typeof rows[0]>[] = [
    {
      key: 'name',
      header: 'Name',
      renderCell: (u) => u.name,
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      renderCell: (u) => u.email,
      sortable: true,
    },
    {
      key: 'role',
      header: 'Role',
      renderCell: (u) => u.role,
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (u) => (u.isActive ? 'Active' : 'Inactive'),
    },
  ]

  if (error) {
    return (
      <AdminLayout>
        <div className={styles.error}>
          Failed to load users: {error.message}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className={styles.pageTitle}>Users &amp; Roles</h1>
      <Table<typeof rows[0]>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No users found"
        onSort={(key, dir) => {
          const nextDir =
            sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'
          setSortKey(key)
          setSortDir(nextDir)
          setPage(1)
        }}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
        }}
      />
    </AdminLayout>
  )
}