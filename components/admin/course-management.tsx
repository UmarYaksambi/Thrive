'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Course = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty_level: string | null;
  duration_text: string | null;
  thumbnail_url: string | null;
  is_ai_generated: boolean | null;
  creator_id: string | null;
  created_at: string;
  modules_count?: number;
  enrollments_count?: number;
  updated_at?: string;
};

type SortConfig = {
  key: keyof Course;
  direction: 'asc' | 'desc';
};

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'Beginner',
    duration_text: '',
    thumbnail_url: '',
    is_ai_generated: false
  });

  const supabase = createClient();

  // Sample categories - replace with actual categories from your database
  const categories = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Literature',
    'History',
    'Art',
    'Music',
    'Business',
    'Marketing',
    'Psychology',
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules:modules(count),
          enrollments:enrollments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const coursesWithStats = (data || []).map(course => ({
        ...course,
        // Safely extract count, supabase normally returns [{count: N}]
        modules_count: course.modules?.[0]?.count || 0,
        enrollments_count: course.enrollments?.[0]?.count || 0,
      }));

      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Course) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? Number(value)
          : value,
    }));
  };

  const handleCreateCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{ ...formData }])
        .select()
        .single();

      if (error) throw error;

      setCourses(prev => [data, ...prev]);
      resetForm();
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingId) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingId)
        .select()
        .single();

      if (error) throw error;

      setCourses(prev =>
        prev.map(course => (course.id === editingId ? data : course))
      );

      resetForm();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCourses(prev => prev.filter(course => course.id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleEditCourse = (course: Course) => {
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty_level: course.difficulty_level || 'Beginner',
      duration_text: course.duration_text || '',
      thumbnail_url: course.thumbnail_url || '',
      is_ai_generated: course.is_ai_generated || false
    });
    setEditingId(course.id);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty_level: 'Beginner',
      duration_text: '',
      thumbnail_url: '',
      is_ai_generated: false
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      handleUpdateCourse();
    } else {
      handleCreateCourse();
    }
  };

  const SortIcon = ({ column }: { column: keyof Course }) => {
    if (sortConfig.key !== column) return <ChevronDown className="h-4 w-4 opacity-30" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
          />
        </div>

        <Button onClick={() => {
          resetForm();
          setIsCreating(!isCreating);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? 'Cancel' : 'New Course'}
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Course' : 'Create New Course'}</CardTitle>
              <CardDescription>
                {editingId
                  ? 'Update the course details below.'
                  : 'Fill in the details to create a new course.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="title">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Introduction to Web Development"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="description">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="Enter a detailed description of the course..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="category">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category || ''}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="difficulty_level">
                      Difficulty Level
                    </label>
                    <select
                      id="difficulty_level"
                      name="difficulty_level"
                      value={formData.difficulty_level || 'Beginner'}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="duration_text">
                      Duration (e.g., "8 weeks", "3 months")
                    </label>
                    <Input
                      id="duration_text"
                      name="duration_text"
                      value={formData.duration_text || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 8 weeks"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="is_ai_generated"
                      name="is_ai_generated"
                      checked={formData.is_ai_generated || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="is_ai_generated" className="text-sm font-medium">
                      AI generated
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <label className="block text-sm font-medium mb-1" htmlFor="enrollments_count">
                    Enrollments Count
                  </label>
                  <Input
                    id="enrollments_count"
                    name="enrollments_count"
                    value={formData.enrollments_count || 0}
                    onChange={handleInputChange}
                    type="number"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <label className="block text-sm font-medium mb-1" htmlFor="modules_count">
                    Modules Count
                  </label>
                  <Input
                    id="modules_count"
                    name="modules_count"
                    value={formData.modules_count || 0}
                    onChange={handleInputChange}
                    type="number"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="button" variant="outline" className="mr-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Thumbnail
                </Button>
                <span className="text-xs text-muted-foreground ml-2">Recommended size: 1200x630px</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#8b5cf6] hover:bg-[#7c3aed]">
                {editingId ? 'Update Course' : 'Create Course'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  Title
                  <SortIcon column="title" />
                </div>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Lessons</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  Created
                  <SortIcon column="created_at" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading courses...
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No courses found. {!searchTerm && 'Click "New Course" to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-md bg-gray-100 mr-3 flex-shrink-0 flex items-center justify-center text-gray-500">
                        {course.title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {(course.description || '').substring(0, 50)}
                          {(course.description ?? '').length > 50 ? '...' : ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.is_ai_generated ? 'secondary' : 'outline'} className="ml-2">
                      {course.is_ai_generated ? 'AI Generated' : 'Manual'}
                    </Badge>
                    {course.difficulty_level && (
                      <Badge variant="outline" className="ml-2">
                        {course.difficulty_level}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{course.enrollments_count || 0}</TableCell>
                  <TableCell>{course.modules_count || 0}</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {course.enrollments_count || 0} students • {course.modules_count || 0} modules
                    </div>
                    <div className="text-xs text-gray-400">
                      Created: {new Date(course.created_at).toLocaleDateString()}
                      {course.updated_at && ` • Updated: ${new Date(course.updated_at).toLocaleDateString()}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={course.is_ai_generated ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
                      {course.is_ai_generated ? 'AI' : 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {course.description || 'No description provided'}
                    </div>
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
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
  );
}
