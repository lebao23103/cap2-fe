import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

const variantConfig = {
  danger: {
    icon: XCircle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    buttonClass: 'bg-red-500 hover:bg-red-600 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    buttonClass: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-500/10',
    buttonClass: 'bg-green-500 hover:bg-green-600 text-white',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Icon */}
          <div className="flex items-center gap-4 mb-2">
            <div className={cn('p-3 rounded-xl', config.iconBg)} aria-hidden="true">
              <Icon className={cn('h-6 w-6', config.iconColor)} strokeWidth={2} aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || loading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          
          <Button
            onClick={handleConfirm}
            disabled={isLoading || loading}
            className={cn('w-full sm:w-auto', config.buttonClass)}
          >
            {isLoading || loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                Loading...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>>({
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const confirm = (options: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => {
    setConfig(options);
    setIsOpen(true);
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      {...config}
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  );

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
    isOpen,
    close: () => setIsOpen(false),
  };
}
