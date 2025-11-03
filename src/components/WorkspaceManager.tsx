import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { WorkspaceManager, type Workspace } from '@/lib/workspaceManager';
import { Save, FolderOpen, Trash2, Download, Upload, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  currentParameters: any;
  onLoadWorkspace: (workspace: Workspace) => void;
}

export default function WorkspaceManagerComponent({ currentParameters, onLoadWorkspace }: Props) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState('');
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = () => {
    setWorkspaces(WorkspaceManager.getAllWorkspaces());
  };

  const handleSave = () => {
    if (!workspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    WorkspaceManager.saveWorkspace({
      name: workspaceName,
      parameters: currentParameters,
      notes,
    });

    toast.success(`Workspace "${workspaceName}" saved!`);
    setWorkspaceName('');
    setNotes('');
    loadWorkspaces();
  };

  const handleLoad = (workspace: Workspace) => {
    onLoadWorkspace(workspace);
    toast.success(`Workspace "${workspace.name}" loaded!`);
    setIsOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete workspace "${name}"?`)) {
      WorkspaceManager.deleteWorkspace(id);
      toast.success('Workspace deleted');
      loadWorkspaces();
    }
  };

  const handleExport = (workspace: Workspace) => {
    WorkspaceManager.exportWorkspace(workspace);
    toast.success('Workspace exported!');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const workspace = await WorkspaceManager.importWorkspace(file);
      WorkspaceManager.saveWorkspace(workspace);
      toast.success('Workspace imported!');
      loadWorkspaces();
    } catch (error) {
      toast.error('Failed to import workspace');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          Workspaces
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workspace Manager</DialogTitle>
        </DialogHeader>

        {/* Save Current Workspace */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Current Workspace
          </h3>
          <div className="space-y-3">
            <div>
              <Label>Workspace Name</Label>
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="My Trading Setup"
              />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Strategy notes..."
              />
            </div>
            <Button onClick={handleSave} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Save Workspace
            </Button>
          </div>
        </Card>

        {/* Import/Export */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" asChild>
            <label>
              <Upload className="h-4 w-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </Button>
        </div>

        {/* Saved Workspaces */}
        <div>
          <h3 className="font-semibold mb-3">Saved Workspaces ({workspaces.length})</h3>
          {workspaces.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No saved workspaces yet. Save your first one above!
            </p>
          ) : (
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <Card key={workspace.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{workspace.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(workspace.timestamp).toLocaleString()}
                      </p>
                      {workspace.notes && (
                        <p className="text-sm mt-1">{workspace.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoad(workspace)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(workspace)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(workspace.id, workspace.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
