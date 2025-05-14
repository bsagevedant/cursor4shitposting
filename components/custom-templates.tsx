"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/use-user';

interface CustomTemplate {
  id?: string;
  name: string;
  content: string;
  variables: string[];
}

export function CustomTemplates() {
  const { user } = useUser();
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState<CustomTemplate>({
    name: '',
    content: '',
    variables: []
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleAddVariable = () => {
    setNewTemplate(prev => ({
      ...prev,
      variables: [...prev.variables, '']
    }));
  };

  const handleVariableChange = (index: number, value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      variables: prev.variables.map((v, i) => i === index ? value : v)
    }));
  };

  const handleRemoveVariable = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const handleSaveTemplate = async () => {
    if (!user) {
      toast.error('Please sign in to save templates');
      return;
    }

    if (!newTemplate.name || !newTemplate.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          custom_templates: [...templates, newTemplate]
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(data.custom_templates);
      setNewTemplate({ name: '', content: '', variables: [] });
      setIsEditing(false);
      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleDeleteTemplate = async (index: number) => {
    if (!user) return;

    try {
      const updatedTemplates = templates.filter((_, i) => i !== index);
      const { error } = await supabase
        .from('user_profiles')
        .update({
          custom_templates: updatedTemplates
        })
        .eq('id', user.id);

      if (error) throw error;

      setTemplates(updatedTemplates);
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Templates</CardTitle>
        <CardDescription>
          Create and manage your own post templates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            {templates.map((template, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {template.variables.length} variables
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTemplate(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Template
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Template Content</Label>
              <Textarea
                id="content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter template content. Use {variable} for variables."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Variables</Label>
              {newTemplate.variables.map((variable, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={variable}
                    onChange={(e) => handleVariableChange(index, e.target.value)}
                    placeholder={`Variable ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveVariable(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddVariable}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setNewTemplate({ name: '', content: '', variables: [] });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 