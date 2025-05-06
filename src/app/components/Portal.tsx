'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  targetId?: string;
}

export default function Portal({ children, targetId = 'portal-root' }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Create portal root if it doesn't exist
    if (!document.getElementById(targetId)) {
      const portalRoot = document.createElement('div');
      portalRoot.id = targetId;
      document.body.appendChild(portalRoot);
    }

    return () => {
      // Cleanup: remove portal root if it's empty
      const portalRoot = document.getElementById(targetId);
      if (portalRoot && !portalRoot.hasChildNodes()) {
        portalRoot.remove();
      }
    };
  }, [targetId]);

  return mounted ? createPortal(children, document.getElementById(targetId) || document.body) : null;
}
