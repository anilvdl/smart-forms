import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table, Column } from '../Table';

interface User {
  id: number;
  name: string;
  age: number;
}

const columns: Column<User>[] = [
  { key: 'name', header: 'Name', renderCell: u => u.name, sortable: true },
  { key: 'age', header: 'Age', renderCell: u => u.age },
];

const data: User[] = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
];

describe('Table component', () => {
  test('renders headers and rows', () => {
    render(<Table data={data} columns={columns} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  test('shows empty message when no data', () => {
    render(<Table data={[]} columns={columns} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  test('calls onSort when clicking sortable header', () => {
    const onSort = jest.fn();
    render(<Table data={data} columns={columns} onSort={onSort} />);
    fireEvent.click(screen.getByText('Name'));
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  test('pagination controls fire events', () => {
    const onPageChange = jest.fn();
    render(
      <Table
        data={data}
        columns={columns}
        pagination={{ page: 2, pageSize: 1, total: 2, onPageChange }}
      />
    );
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Previous'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  test('loading state shows spinner', () => {
    render(<Table data={data} columns={columns} isLoading />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});