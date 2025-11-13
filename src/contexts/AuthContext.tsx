import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Member } from '@/types/member';

// Override the Profile interface to include NIK
interface Profile {
  user_id: string;
  branch_id: string | null;
  role: string;
  nik?: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  isAdmin: boolean;
  isPusatAdmin: boolean;
  isCabangAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch profile data (with nik field added via migration)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Fetch user role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching role:', roleError);
      }

      // Get current user to access metadata
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Type assertion to include nik field
      const typedProfileData = profileData as any;
      
      // Sync NIK from metadata to profile if missing
      if (typedProfileData && !typedProfileData.nik && currentUser?.user_metadata?.nik) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({ nik: currentUser.user_metadata.nik } as any)
          .eq('user_id', userId)
          .select()
          .single();
        
        if (updatedProfile) {
          setProfile({
            ...updatedProfile,
            role: roleData?.role || (updatedProfile as any).role,
            nik: currentUser.user_metadata.nik
          } as Profile);
        }
      } else {
        // Combine profile and role data
        if (typedProfileData) {
          setProfile({
            ...typedProfileData,
            role: roleData?.role || typedProfileData.role,
            nik: typedProfileData.nik || null
          } as Profile);
        } else {
          setProfile(null);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const hasRole = (roles: string[]): boolean => {
    return profile ? roles.includes(profile.role) : false;
  };

  const isAdmin = hasRole(['admin', 'admin_pusat', 'admin_cabang', 'ADMIN_PUSAT', 'ADMIN_CABANG']);
  const isPusatAdmin = hasRole(['admin_pusat', 'ADMIN_PUSAT']);
  const isCabangAdmin = hasRole(['admin_cabang', 'ADMIN_CABANG']);

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    hasRole,
    isAdmin,
    isPusatAdmin,
    isCabangAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};