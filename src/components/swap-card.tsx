'use client'

import type { Swap } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ArrowRightLeft, Check, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { updateSwapStatus } from '@/lib/firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

interface SwapCardProps {
    swap: Swap;
    currentUserId: string;
}

export function SwapCard({ swap, currentUserId }: SwapCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const isReceiver = swap.receiverId === currentUserId;
    const myItem = isReceiver ? swap.receiverItem : swap.proposerItem;
    const theirItem = isReceiver ? swap.proposerItem : swap.receiverItem;

    const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
        setIsLoading(true);
        try {
            await updateSwapStatus(swap.id, status);
            toast({
                title: `Swap ${status}`,
                description: `The swap has been successfully ${status}.`
            });
            // You might want to refresh the list of swaps here
        } catch(e) {
            toast({
                title: 'Error',
                description: (e as Error).message,
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (!myItem || !theirItem) {
        return <Card><CardContent><p className="py-4 text-muted-foreground">Swap details are unavailable.</p></CardContent></Card>
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Swap Proposal</span>
                    <Badge variant={swap.status === 'pending' ? 'secondary' : swap.status === 'accepted' ? 'default' : 'destructive'}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center space-y-2">
                    <p className="font-semibold text-sm">Your Item</p>
                    <div className="w-24 h-32 mx-auto relative rounded-md overflow-hidden border">
                         <Image src={myItem.images[0]} alt={myItem.title} fill className="object-cover" unoptimized/>
                    </div>
                    <p className="text-xs text-muted-foreground">{myItem.title}</p>
                </div>
                <ArrowRightLeft className="w-8 h-8 text-primary shrink-0" />
                <div className="flex-1 text-center space-y-2">
                    <p className="font-semibold text-sm">Their Item</p>
                    <div className="w-24 h-32 mx-auto relative rounded-md overflow-hidden border">
                        <Image src={theirItem.images[0]} alt={theirItem.title} fill className="object-cover" unoptimized/>
                    </div>
                    <p className="text-xs text-muted-foreground">{theirItem.title}</p>
                </div>
            </CardContent>
            {isReceiver && swap.status === 'pending' && (
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('rejected')} disabled={isLoading}>
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4" />}
                        Reject
                    </Button>
                    <Button size="sm" onClick={() => handleUpdateStatus('accepted')} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                        Accept
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
