
import { useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { User } from '../types';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [configError, setConfigError] = useState<string | null>(null);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setConfigError('Supabase is not configured. Please add your credentials to the .env file.');
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                setUser(mapSupabaseUser(session.user));
            }
            setLoading(false);
        }).catch((error) => {
            console.error('Error getting session:', error);
            setConfigError('Failed to connect to Supabase. Please check your credentials.');
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                if (session?.user) {
                    setUser(mapSupabaseUser(session.user));
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
        return {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
            email: supabaseUser.email || '',
            avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
        };
    };

    const signInWithGoogle = async () => {
        if (!isSupabaseConfigured) {
            throw new Error('Supabase is not configured');
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            throw new Error('Supabase is not configured');
        }
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string, fullName: string) => {
        if (!isSupabaseConfigured) {
            throw new Error('Supabase is not configured');
        }
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        if (error) {
            throw error;
        }
    };

    const signOut = async () => {
        if (isSupabaseConfigured) {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
            }
        }
        setUser(null);
        setSession(null);
    };

    return {
        user,
        session,
        loading,
        configError,
        isSupabaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut
    };
};
