import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Maximize2 } from 'lucide-react';

interface ChartCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  onExport?: () => void;
  onShare?: () => void;
  onExpand?: () => void;
  showActions?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  onExport,
  onShare,
  onExpand,
  showActions = true,
  footer,
  className = '',
}) => {
  return (
    <Card className={className}>
      {(title || description || showActions) && (
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            
            {showActions && (
              <div className="flex items-center gap-2">
                {onExpand && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onExpand}
                    className="h-8 w-8 p-0"
                    title="Expand chart"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                )}
                {onShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShare}
                    className="h-8 w-8 p-0"
                    title="Share chart"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
                {onExport && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onExport}
                    className="h-8 w-8 p-0"
                    title="Export chart"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {children}
      </CardContent>
      
      {footer && (
        <div className="px-6 pb-6 pt-0">
          {footer}
        </div>
      )}
    </Card>
  );
};

export default ChartCard;
