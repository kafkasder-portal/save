import React, { useState } from 'react';
import { Link2, Users, FileText, Calendar, Search, Filter, Plus, Eye } from 'lucide-react';

interface RelatedRecord {
  id: string;
  type: 'beneficiary' | 'donation' | 'message' | 'document' | 'event';
  title: string;
  description: string;
  date: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  relatedTo: string[];
  metadata: Record<string, any>;
}

interface Relationship {
  id: string;
  fromId: string;
  toId: string;
  type: 'parent-child' | 'sibling' | 'related' | 'dependency';
  strength: number;
  description: string;
}

const RelatedRecordsDemo: React.FC = () => {
  const [records] = useState<RelatedRecord[]>([
    {
      id: '1',
      type: 'beneficiary',
      title: 'Ahmet Yılmaz',
      description: 'Eğitim bursu alan öğrenci',
      date: '2024-01-15',
      status: 'active',
      relatedTo: ['2', '3', '4'],
      metadata: { age: 12, grade: 6, city: 'İstanbul' }
    },
    {
      id: '2',
      type: 'donation',
      title: 'Eğitim Bağışı - Ocak 2024',
      description: 'Ahmet Yılmaz için aylık eğitim desteği',
      date: '2024-01-01',
      status: 'completed',
      relatedTo: ['1'],
      metadata: { amount: 500, currency: 'TRY', donor: 'Anonim Bağışçı' }
    },
    {
      id: '3',
      type: 'message',
      title: 'Okul Raporu',
      description: 'Ahmet\'in dönem sonu başarı raporu',
      date: '2024-01-10',
      status: 'completed',
      relatedTo: ['1'],
      metadata: { sender: 'Okul Müdürü', priority: 'normal' }
    },
    {
      id: '4',
      type: 'document',
      title: 'Kimlik Fotokopisi',
      description: 'Ahmet Yılmaz kimlik belgesi',
      date: '2023-12-15',
      status: 'active',
      relatedTo: ['1'],
      metadata: { fileType: 'PDF', size: '2.1 MB' }
    },
    {
      id: '5',
      type: 'event',
      title: 'Ev Ziyareti',
      description: 'Sosyal çalışan ev ziyareti',
      date: '2024-01-20',
      status: 'pending',
      relatedTo: ['1'],
      metadata: { socialWorker: 'Ayşe Demir', duration: '2 saat' }
    },
    {
      id: '6',
      type: 'beneficiary',
      title: 'Zeynep Kaya',
      description: 'Lise öğrencisi, başarılı',
      date: '2024-01-12',
      status: 'active',
      relatedTo: ['7', '8'],
      metadata: { age: 15, grade: 9, city: 'Ankara' }
    },
    {
      id: '7',
      type: 'donation',
      title: 'Eğitim Bağışı - Zeynep',
      description: 'Zeynep Kaya için aylık eğitim desteği',
      date: '2024-01-01',
      status: 'completed',
      relatedTo: ['6'],
      metadata: { amount: 750, currency: 'TRY', donor: 'Hayırsever Aile' }
    },
    {
      id: '8',
      type: 'document',
      title: 'Başarı Belgesi',
      description: 'Zeynep\'in okul birinciliği belgesi',
      date: '2024-01-05',
      status: 'active',
      relatedTo: ['6'],
      metadata: { fileType: 'PDF', achievement: 'Okul Birincisi' }
    }
  ]);

  const [_relationships] = useState<Relationship[]>([
    {
      id: 'r1',
      fromId: '1',
      toId: '2',
      type: 'dependency',
      strength: 0.9,
      description: 'Ahmet\'in eğitim bağışı'
    },
    {
      id: 'r2',
      fromId: '1',
      toId: '3',
      type: 'related',
      strength: 0.7,
      description: 'Okul raporu ilişkisi'
    },
    {
      id: 'r3',
      fromId: '1',
      toId: '4',
      type: 'dependency',
      strength: 0.8,
      description: 'Kimlik belgesi'
    },
    {
      id: 'r4',
      fromId: '6',
      toId: '7',
      type: 'dependency',
      strength: 0.9,
      description: 'Zeynep\'in eğitim bağışı'
    }
  ]);

  const [selectedRecord, setSelectedRecord] = useState<RelatedRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showRelationships, setShowRelationships] = useState(true);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || record.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getRelatedRecords = (recordId: string): RelatedRecord[] => {
    const record = records.find(r => r.id === recordId);
    if (!record) return [];
    
    return records.filter(r => 
      record.relatedTo.includes(r.id) || r.relatedTo.includes(recordId)
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'beneficiary':
        return <Users className="w-4 h-4" />;
      case 'donation':
        return <Plus className="w-4 h-4" />;
      case 'message':
        return <FileText className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'beneficiary':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'donation':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'message':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'document':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'event':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Related Records Demo</h1>
          <p className="text-gray-600">Demonstration of related records and relationship mapping</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="beneficiary">Beneficiaries</option>
                <option value="donation">Donations</option>
                <option value="message">Messages</option>
                <option value="document">Documents</option>
                <option value="event">Events</option>
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showRelationships}
                onChange={(e) => setShowRelationships(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Relationships</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Records List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Records ({filteredRecords.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredRecords.map((record) => {
                  const relatedRecords = getRelatedRecords(record.id);
                  return (
                    <div
                      key={record.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedRecord?.id === record.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border ${getTypeColor(record.type)}`}>
                          {getTypeIcon(record.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {record.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                            {showRelationships && relatedRecords.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Link2 className="w-3 h-3" />
                                <span>{relatedRecords.length} related</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Record Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Record Details</h2>
            </div>
            <div className="p-6">
              {selectedRecord ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${getTypeColor(selectedRecord.type)}`}>
                      {getTypeIcon(selectedRecord.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedRecord.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRecord.status)}`}>
                        {selectedRecord.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-sm text-gray-900">{selectedRecord.description}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <p className="text-sm text-gray-900">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(selectedRecord.type)}`}>
                      {selectedRecord.type}
                    </span>
                  </div>
                  
                  {Object.keys(selectedRecord.metadata).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                        {Object.entries(selectedRecord.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="text-gray-900 font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {showRelationships && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Related Records ({getRelatedRecords(selectedRecord.id).length})
                      </label>
                      <div className="space-y-2">
                        {getRelatedRecords(selectedRecord.id).map((relatedRecord) => (
                          <div
                            key={relatedRecord.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                            onClick={() => setSelectedRecord(relatedRecord)}
                          >
                            <div className={`p-1 rounded border ${getTypeColor(relatedRecord.type)}`}>
                              {getTypeIcon(relatedRecord.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {relatedRecord.title}
                              </p>
                              <p className="text-xs text-gray-500">{relatedRecord.type}</p>
                            </div>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a record to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {['beneficiary', 'donation', 'message', 'document', 'event'].map((type) => {
            const count = records.filter(r => r.type === type).length;
            return (
              <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${getTypeColor(type)}`}>
                    {getTypeIcon(type)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 capitalize">{type}s</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RelatedRecordsDemo;
