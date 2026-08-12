import React from 'react';
import { FileText, Folder, Star, Archive } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Documents',
  subtitle: 'Store, organize, and manage all important documents',
  endpoint: '/documents',
  searchPlaceholder: 'Search documents by name or keyword...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [
    { label: 'Total Documents', icon: FileText, color: 'blue', compute: (d, t) => t },
    { label: 'Folders', icon: Folder, color: 'green', compute: (d) => d.filter((x) => x.isFolder).length },
    { label: 'Favorites', icon: Star, color: 'amber', compute: (d) => d.filter((x) => x.isFavorite).length },
    { label: 'Archived', icon: Archive, color: 'slate', compute: (d) => d.filter((x) => x.isArchived).length },
  ],
  filters: [{ key: 'category', label: 'All Category', options: ['Governance', 'Finance', 'Maintenance', 'Safety', 'Amenities', 'Legal', 'General'] }],
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'sizeKB', label: 'Size (KB)' },
  ],
  formFields: [
    { name: 'name', label: 'Document Name', required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['Governance', 'Finance', 'Maintenance', 'Safety', 'Amenities', 'Legal', 'General'], required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['Folder', 'PDF', 'Excel', 'Word', 'Image', 'PPT'] },
    { name: 'sizeKB', label: 'Size (KB)', type: 'number' },
  ],
};

const Documents = () => <ModuleListPage config={config} />;
export default Documents;
