'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserAvailableItems } from '@/lib/firebase/firestore';
import type { Item } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProposeSwapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedItemId: string) => Promise<void>;
  proposerId: string;
  isProposing: boolean;
}

export function ProposeSwapDialog({ isOpen, onClose, onSubmit, proposerId, isProposing }: ProposeSwapDialogProps) {
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [loadingItems, setLoadingItems] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && proposerId) {
      async function fetchItems() {
        setLoadingItems(true);
        const items = await getUserAvailableItems(proposerId);
        setUserItems(items);
        setLoadingItems(false);
      }
      fetchItems();
    }
  }, [isOpen, proposerId]);

  const handleSubmit = () => {
    if (!selectedItem) {
        toast({ title: 'Please select an item to swap.', variant: 'destructive'})
        return;
    }
    onSubmit(selectedItem);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Propose a Swap</DialogTitle>
          <DialogDescription>
            Select one of your available items to offer in exchange.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loadingItems ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userItems.length > 0 ? (
            <Select onValueChange={setSelectedItem} value={selectedItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select your item..." />
              </SelectTrigger>
              <SelectContent>
                {userItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title} ({item.points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-center text-muted-foreground">You have no available items to swap.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isProposing || loadingItems || userItems.length === 0}>
            {isProposing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Propose Swap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
