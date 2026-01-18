'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, Check, X, Download, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document, DocumentStatus } from '@/types/supabase';

// Using types from @/types/supabase

export function DocumentApproval() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | DocumentStatus>('pending');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchDocuments();
  }, [selectedStatus]);

  /* 
    REAL DATABASE IMPLEMENTATION 
  */
  const fetchDocuments = async () => {
    try {
      setLoading(true);

      // select(*) is good, but we need submitter details.
      // Assuming 'profiles' table exists and links to auth.users via id.
      // If 'submitted_by' is a UUID, we fetch the profile.
      let query = supabase
        .from('library_items')
        .select(`
          *,
          profile:profiles!submitted_by(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error fetching documents:', error);
        throw error;
      }

      // Transform data to match UI expectations
      const mappedDocs = (data || []).map((doc: any) => ({
        ...doc,
        // Ensure arrays
        categories: Array.isArray(doc.categories) ? doc.categories : doc.categories ? [doc.categories] : ['Uncategorized'],
        status: doc.status || 'pending',
        submitted_at: doc.created_at, // Use created_at as submission time
        // Map joined profile data to 'user' object expected by UI
        user: {
          id: doc.submitted_by,
          email: doc.profile?.email,
          raw_user_meta_data: { full_name: doc.profile?.full_name }
        }
      }));

      setDocuments(mappedDocs);
    } catch (error) {
      console.error('Error in fetchDocuments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (documentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('library_items')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', documentId);

      if (error) throw error;

      // Optimistic update
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, status: 'approved', rejection_reason: undefined }
            : doc
        )
      );

      if (selectedDocument?.id === documentId) {
        setSelectedDocument(prev => prev ? { ...prev, status: 'approved', rejection_reason: undefined } : null);
      }
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Failed to approve document. Check console for details.');
    }
  };

  const handleReject = async (documentId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('library_items')
        .update({
          status: 'rejected',
          approved_by: user.id, // We track reviewer in approved_by for simplicity or add reviewed_by col
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, status: 'rejected', rejection_reason: rejectionReason }
            : doc
        )
      );

      if (selectedDocument?.id === documentId) {
        setSelectedDocument(prev => prev ? { ...prev, status: 'rejected', rejection_reason: rejectionReason } : null);
      }

      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting document:', error);
      alert('Failed to reject document. Check console for details.');
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>;
    }
  };

  const formatFileSize = (bytes: number = 0) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string = '') => {
    const type = fileType.split('/')[0];
    switch (type) {
      case 'application':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'image':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'video':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'audio':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search documents..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDocuments()}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="all">All Documents</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <Button variant="outline" onClick={fetchDocuments}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-${selectedDocument ? '2' : '3'}`}>
          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading documents...
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No documents found. {selectedStatus === 'pending' ? 'All caught up!' : ''}
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className={`cursor-pointer hover:bg-gray-50 ${selectedDocument?.id === doc.id ? 'bg-blue-50' : ''
                        }`}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                            {getFileIcon(doc.file_type ?? undefined)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{doc.title}</div>
                            <div className="text-xs text-gray-500">
                              {(doc.file_type ?? '').split('/').pop()?.toUpperCase() || 'FILE'} • {formatFileSize(doc.file_size || 0)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {doc.user?.raw_user_meta_data?.full_name || doc.user?.email || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doc.user?.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {doc.submitted_at ? new Date(doc.submitted_at).toLocaleDateString() : '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doc.submitted_at
                            ? formatDistanceToNow(new Date(doc.submitted_at), { addSuffix: true })
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge((doc.status ?? 'pending') as DocumentStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (doc.file_url) window.open(doc.file_url, '_blank');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!doc.file_url) return;
                              const link = document.createElement('a');
                              link.href = doc.file_url;
                              link.download = doc.title || 'download';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {selectedDocument && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border overflow-hidden sticky top-6">
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Document Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Review and manage this document
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedDocument(null)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Title</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedDocument.title}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {selectedDocument.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Submitted By</h4>
                  <div className="mt-1 flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 mr-2">
                      {selectedDocument.user?.raw_user_meta_data?.full_name?.charAt(0) ||
                        selectedDocument.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedDocument.user?.raw_user_meta_data?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">{selectedDocument.user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">File Type</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {(selectedDocument.file_type ?? '').split('/').pop()?.toUpperCase() || 'FILE'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">File Size</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatFileSize(selectedDocument.file_size || 0)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Categories</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedDocument.categories?.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">No categories</span>}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <div className="mt-2">
                    {getStatusBadge((selectedDocument.status ?? 'pending') as DocumentStatus)}
                    {selectedDocument.status === 'rejected' && selectedDocument.rejection_reason && (
                      <div className="mt-2 p-3 bg-red-50 rounded-md text-sm text-red-700">
                        <p className="font-medium">Rejection Reason:</p>
                        <p className="mt-1">{selectedDocument.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedDocument.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Review Actions</h4>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          onClick={() => handleApprove(selectedDocument.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve Document
                        </Button>

                        <div className="space-y-2">
                          <Input
                            placeholder="Reason for rejection (required)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full"
                          />
                          <Button
                            variant="outline"
                            className="w-full justify-start bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                            onClick={() => handleReject(selectedDocument.id)}
                            disabled={!rejectionReason.trim()}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject Document
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-xs text-gray-500">
                    <div>Submitted</div>
                    <div>
                      {selectedDocument.submitted_at
                        ? formatDistanceToNow(new Date(selectedDocument.submitted_at), { addSuffix: true })
                        : '-'}
                    </div>
                  </div>
                  {selectedDocument.reviewed_at && (
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <div>Last Reviewed</div>
                      <div>
                        {selectedDocument.reviewed_at
                          ? formatDistanceToNow(new Date(selectedDocument.reviewed_at), { addSuffix: true })
                          : '-'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!selectedDocument.file_url) return;
                    const link = document.createElement('a');
                    link.href = selectedDocument.file_url;
                    link.download = selectedDocument.title || 'download';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    if (selectedDocument.file_url) window.open(selectedDocument.file_url, '_blank');
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Screen
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
