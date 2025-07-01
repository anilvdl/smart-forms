import AdminLayout from '../../components/admin/AdminLayout'
import { Card } from '../../components/admin/ui/Card'
import { Table, Column } from '../../components/admin/ui/Table'
import { useUsers, UsersResponse, User } from '../../hooks/useUsers'
import { useInvites } from '../../hooks/useInvites'
import { useFeatureFlags } from '../../hooks/useFeatureFlags'
import styles from '../../styles/adminDashboard.module.css'
import { useSession, getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'

export default function AdminDashboardPage() { 
  // Summary hooks
  const { data: userData } = useUsers({ page: 1, pageSize: 1 })
  const { data: session } = useSession()
  const orgId = (session?.user as any)?.activeOrgId as string | undefined
  const { data: inviteData } = useInvites(orgId! || '')
  const { data: flagsData } = useFeatureFlags(orgId! || '')

  // Table hook: first page of users
  const { data: tableData, isLoading } = useUsers({ page: 1, pageSize: 10 })

  const raw = Array.isArray(userData) ? userData : userData?.users ?? []
  const userCount = raw.length;
  const pendingInvites = Array.isArray(inviteData) ? inviteData.length : 0
  const activeFlags = (flagsData?.flags ?? []).filter(f => f.enabled).length

  // Table columns
  const columns: Column<User>[] = [
    { key: 'name',    header: 'Name',        renderCell: u => u.name },
    { key: 'email',   header: 'Email',       renderCell: u => u.email },
    { key: 'role',    header: 'Role',        renderCell: u => u.role },
    { key: 'status',  header: 'Status',      renderCell: u => u.isActive ? 'Active' : 'Inactive' },
  ]

  return (
    <AdminLayout>
      <h1 className={styles.pageTitle}>Admin Dashboard</h1>

      <div className={styles.cardGrid}>
        <Card className={styles.card}>
          <h2 className={styles.cardTitle}>Total Users</h2>
          <p className={styles.cardValue}>{userCount}</p>
        </Card>
        <Card className={styles.card}>
          <h2 className={styles.cardTitle}>Pending Invites</h2>
          <p className={styles.cardValue}>{pendingInvites}</p>
        </Card>
        <Card className={styles.card}>
          <h2 className={styles.cardTitle}>Active Feature Flags</h2>
          <p className={styles.cardValue}>{activeFlags}</p>
        </Card>
      </div>

      <section className={styles.tableSection}>
        <h2 className={styles.sectionTitle}>Recent Users</h2>
        <Table<User>
          data={tableData?.users ?? []}
          columns={columns}
          isLoading={isLoading}
        />
      </section>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx)
  if (!session) {
    return {
      redirect: {
        destination: `/login?returnTo=${encodeURIComponent(ctx.resolvedUrl)}`,
        permanent: false,
      },
    }
  }
  return {
    props: {
      // NextAuth will automatically pass this into your SessionProvider
      session,
    },
  }
}