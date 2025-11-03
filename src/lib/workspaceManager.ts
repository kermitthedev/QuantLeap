export interface Workspace {
  id: string;
  name: string;
  timestamp: Date;
  parameters: any;
  strategies?: any[];
  portfolio?: any[];
  notes?: string;
}

export class WorkspaceManager {
  private static STORAGE_KEY = 'options-workspaces';

  static saveWorkspace(workspace: Omit<Workspace, 'id' | 'timestamp'>): void {
    const workspaces = this.getAllWorkspaces();
    const newWorkspace: Workspace = {
      ...workspace,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    workspaces.push(newWorkspace);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workspaces));
  }

  static getAllWorkspaces(): Workspace[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data).map((w: any) => ({
      ...w,
      timestamp: new Date(w.timestamp),
    }));
  }

  static loadWorkspace(id: string): Workspace | null {
    const workspaces = this.getAllWorkspaces();
    return workspaces.find(w => w.id === id) || null;
  }

  static deleteWorkspace(id: string): void {
    const workspaces = this.getAllWorkspaces().filter(w => w.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workspaces));
  }

  static exportWorkspace(workspace: Workspace): void {
    const dataStr = JSON.stringify(workspace, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workspace-${workspace.name}-${Date.now()}.json`;
    link.click();
  }

  static importWorkspace(file: File): Promise<Workspace> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workspace = JSON.parse(e.target?.result as string);
          resolve(workspace);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
}
