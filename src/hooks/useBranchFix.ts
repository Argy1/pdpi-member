import { useEffect, useState } from 'react';
import { fixDuplicateBranch } from '@/utils/fixDuplicateBranch';

export function useBranchFix() {
  const [isFixed, setIsFixed] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  useEffect(() => {
    const fixBranches = async () => {
      // Check if already fixed in this session
      const hasFixed = sessionStorage.getItem('branches_fixed');
      if (hasFixed) {
        setIsFixed(true);
        return;
      }

      setIsFixing(true);
      try {
        const result = await fixDuplicateBranch();
        if (result.success) {
          sessionStorage.setItem('branches_fixed', 'true');
          setIsFixed(true);
          if (result.count > 0) {
            console.log(`Fixed ${result.count} branch duplicates`);
          }
        }
      } catch (error) {
        console.error('Error fixing branches:', error);
      } finally {
        setIsFixing(false);
      }
    };

    fixBranches();
  }, []);

  return { isFixed, isFixing };
}
