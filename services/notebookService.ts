import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface Notebook {
    id: string;
    user_id: string;
    title: string;
    content: string;
    file_name: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateNotebookInput {
    title: string;
    content: string;
    fileName?: string;
}

export const notebookService = {
    // Save a new notebook
    async create(input: CreateNotebookInput): Promise<Notebook | null> {
        if (!isSupabaseConfigured || !supabase) {
            console.warn('Supabase not configured, saving to localStorage');
            return this.saveToLocalStorage(input);
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('notebooks')
            .insert({
                user_id: user.id,
                title: input.title,
                content: input.content,
                file_name: input.fileName || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating notebook:', error);
            throw error;
        }

        return data;
    },

    // Get all notebooks for current user
    async getAll(): Promise<Notebook[]> {
        if (!isSupabaseConfigured || !supabase) {
            return this.getFromLocalStorage();
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return [];
        }

        const { data, error } = await supabase
            .from('notebooks')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching notebooks:', error);
            return [];
        }

        return data || [];
    },

    // Get a single notebook by ID
    async getById(id: string): Promise<Notebook | null> {
        if (!isSupabaseConfigured || !supabase) {
            const notebooks = this.getFromLocalStorage();
            return notebooks.find(n => n.id === id) || null;
        }

        const { data, error } = await supabase
            .from('notebooks')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching notebook:', error);
            return null;
        }

        return data;
    },

    // Update a notebook
    async update(id: string, input: Partial<CreateNotebookInput>): Promise<Notebook | null> {
        if (!isSupabaseConfigured || !supabase) {
            return this.updateInLocalStorage(id, input);
        }

        const { data, error } = await supabase
            .from('notebooks')
            .update({
                ...input,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating notebook:', error);
            throw error;
        }

        return data;
    },

    // Delete a notebook
    async delete(id: string): Promise<boolean> {
        if (!isSupabaseConfigured || !supabase) {
            return this.deleteFromLocalStorage(id);
        }

        const { error } = await supabase
            .from('notebooks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting notebook:', error);
            return false;
        }

        return true;
    },

    // Local storage fallback methods
    saveToLocalStorage(input: CreateNotebookInput): Notebook {
        const notebooks = this.getFromLocalStorage();
        const newNotebook: Notebook = {
            id: `local_${Date.now()}`,
            user_id: 'local',
            title: input.title,
            content: input.content,
            file_name: input.fileName || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        notebooks.unshift(newNotebook);
        localStorage.setItem('dreampath_notebooks', JSON.stringify(notebooks));
        return newNotebook;
    },

    getFromLocalStorage(): Notebook[] {
        const stored = localStorage.getItem('dreampath_notebooks');
        return stored ? JSON.parse(stored) : [];
    },

    updateInLocalStorage(id: string, input: Partial<CreateNotebookInput>): Notebook | null {
        const notebooks = this.getFromLocalStorage();
        const index = notebooks.findIndex(n => n.id === id);
        if (index === -1) return null;

        notebooks[index] = {
            ...notebooks[index],
            ...input,
            updated_at: new Date().toISOString(),
        };
        localStorage.setItem('dreampath_notebooks', JSON.stringify(notebooks));
        return notebooks[index];
    },

    deleteFromLocalStorage(id: string): boolean {
        const notebooks = this.getFromLocalStorage();
        const filtered = notebooks.filter(n => n.id !== id);
        localStorage.setItem('dreampath_notebooks', JSON.stringify(filtered));
        return true;
    },
};
