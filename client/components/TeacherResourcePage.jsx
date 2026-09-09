import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import api from '@/services/api';

/**
 * Props:
 * - title: Page title displayed in header and breadcrumb
 * - endpoint: API endpoint to fetch data (e.g. '/students')
 * - columns: [{ key: 'name', label: 'Name' }, ...] used for table headers and row values
 * - renderRow?: optional custom row renderer (receives item) for complex rows
 */
export default function TeacherResourcePage({ title, endpoint, columns, renderRow }) {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Access guard – only Teacher role allowed
  useEffect(() => {
    if (!user || user.role !== 'Teacher') {
      router.replace('/coming-soon');
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(endpoint);
        setData(res.data || []);
      } catch (err) {
        console.error('Failed to fetch', endpoint, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [endpoint]);

  const defaultRenderRow = (item) => (
    <TableRow key={item.id || item._id}>
      {columns.map(col => (
        <TableCell key={col.key}>{item[col.key] ?? '-'}</TableCell>
      ))}
    </TableRow>
  );

  return (
    <section className="p-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/teacher">Teacher Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>{title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <Spinner className="mx-auto" />}
          {error && <div className="text-red-600">Error loading data.</div>}
          {!loading && !error && (
            data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map(col => (
                      <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(item => (renderRow ? renderRow(item) : defaultRenderRow(item)))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState message={`No ${title.toLowerCase()} found.`} />
            )
          )}
        </CardContent>
      </Card>
    </section>
  );
}
