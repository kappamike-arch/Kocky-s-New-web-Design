import React from 'react';

interface TableProps {
  className?: string;
  children: React.ReactNode;
}

export function Table({ className = '', children }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', children }: TableProps) {
  return (
    <thead className={`border-b bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ className = '', children }: TableProps) {
  return (
    <tbody className={`divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ className = '', children }: TableProps) {
  return (
    <tr className={`hover:bg-gray-50 ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ className = '', children }: TableProps) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ className = '', children, colSpan }: TableProps & { colSpan?: number }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}

