import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Track visitor and get count
    const trackVisitor = async () => {
      try {
        // Get current visitor count
        const { data: currentStats, error: fetchError } = await supabase
          .from('visitor_stats')
          .select('total_visits, id')
          .limit(1)
          .single();

        if (fetchError) {
          console.error('Error fetching visitor stats:', fetchError);
          return;
        }

        if (currentStats) {
          // Increment visitor count
          const newCount = (currentStats.total_visits || 0) + 1;
          
          const { error: updateError } = await supabase
            .from('visitor_stats')
            .update({ 
              total_visits: newCount,
              last_updated: new Date().toISOString()
            })
            .eq('id', currentStats.id);

          if (updateError) {
            console.error('Error updating visitor count:', updateError);
          }

          setVisitorCount(newCount);
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    trackVisitor();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('visitor-stats-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'visitor_stats'
        },
        (payload: any) => {
          console.log('Visitor count updated:', payload);
          if (payload.new?.total_visits) {
            setVisitorCount(payload.new.total_visits);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID');
  };

  return (
    <div className="card-glass p-8 max-w-md mx-auto text-center space-y-4">
      <div className="flex items-center justify-center space-x-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Eye className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold heading-medical">{t('visitor.title')}</h3>
      </div>
      
      <div className="py-4">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-12 bg-muted rounded-lg w-32 mx-auto"></div>
          </div>
        ) : (
          <p className="text-5xl font-bold heading-medical text-primary transition-smooth">
            {formatNumber(visitorCount)}
          </p>
        )}
      </div>
      
      <p className="text-sm text-medical-body">
        {t('visitor.total')}
      </p>
    </div>
  );
}
