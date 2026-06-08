'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SmartValuationBadge } from '@/components/smart-valuation-badge';
import { Repeat, ShoppingBag, Tag, Loader2 } from 'lucide-react';
import { getItemById, proposeSwap, redeemItem } from '@/lib/firebase/firestore';
import type { Item } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ProposeSwapDialog } from '@/components/propose-swap-dialog';

function getImageHint(category?: string) {
    if (!category) return 'fashion clothing';
    switch (category) {
        case 'Outerwear':
            return 'denim jacket';
        case 'Dresses':
            return 'summer dress';
        case 'Shoes':
            return 'leather boots';
        case 'Tops':
            return 'striped shirt';
        case 'Bottoms':
            return 'skinny jeans';
        case 'Accessories':
            return 'silk scarf';
        default:
            return 'fashion clothing';
    }
}

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchItem() {
      const fetchedItem = await getItemById(id);
      if (fetchedItem) {
        setItem(fetchedItem);
      }
      setLoading(false);
    }
    fetchItem();
  }, [id]);

  const handleRedeem = async () => {
    if (!user || !item) return;

    setIsRedeeming(true);
    try {
      await redeemItem(user.uid, item.id);
      toast({
        title: "Item Redeemed!",
        description: "The item has been added to your collection."
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleProposeSwap = async (selectedItemId: string) => {
    if (!user || !item) return;

    setIsProposing(true);
    try {
      await proposeSwap({
        proposerId: user.uid,
        proposerItemId: selectedItemId,
        receiverId: item.uploaderId,
        receiverItemId: item.id,
      });
      toast({
        title: "Swap Proposed!",
        description: "The other user has been notified of your swap proposal."
      });
      setIsSwapDialogOpen(false);
    } catch (error) {
      toast({
        title: "Swap Proposal Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsProposing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-8 w-1/2" />
            <Separator />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    notFound();
  }

  const isOwner = user?.uid === item.uploaderId;
  const imageHint = getImageHint(item.category);
  const imageUrl = (item.images && item.images.length > 0) ? item.images[0] : 'https://placehold.co/600x800.png';

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden border">
                <Image
                src={imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                data-ai-hint={imageHint}
                unoptimized
                />
            </div>
            {item.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                    {item.images.map((img, index) => (
                        <div key={index} className="aspect-square relative rounded-md overflow-hidden border">
                           <Image src={img} alt={`${item.title} - image ${index + 1}`} fill className="object-cover" unoptimized />
                        </div>
                    ))}
                </div>
            )}
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-headline">{item.title}</h1>
            <p className="text-xl text-muted-foreground mt-1">{item.brand}</p>
          </div>

          {item.valuationStatus === 'auto' && item.originalPrice && (
            <SmartValuationBadge originalPrice={item.originalPrice} points={item.points} />
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Tag className="w-6 h-6 text-primary"/>
                <span className="text-2xl font-bold text-primary">{item.points.toLocaleString()} Points</span>
            </div>
          </div>
          
          <Separator />

          <p className="text-muted-foreground leading-relaxed">{item.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-foreground">Category</p>
              <p className="text-muted-foreground">{item.category}</p>
            </div>
             <div>
              <p className="font-semibold text-foreground">Condition</p>
              <p className="text-muted-foreground">{item.condition}</p>
            </div>
          </div>

          <Card className="bg-background/50">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
               <Avatar>
                <AvatarImage src={`https://i.pravatar.cc/150?u=${item.uploaderName}`} />
                <AvatarFallback>{item.uploaderName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold">Listed by</p>
                <p className="text-sm text-muted-foreground">{item.uploaderName}</p>
              </div>
            </CardHeader>
          </Card>
          
          {!isOwner && user && item.status === 'available' && (
            <div className="flex flex-col gap-2">
              <Button size="lg" onClick={handleRedeem} disabled={isRedeeming}>
                {isRedeeming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ShoppingBag className="mr-2 h-4 w-4" /> Redeem with Points
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setIsSwapDialogOpen(true)}>
                <Repeat className="mr-2 h-4 w-4" /> Propose a Swap
              </Button>
            </div>
          )}

          {isOwner && (
            <p className="text-center text-muted-foreground">This is your item.</p>
          )}

          {item.status === 'swapped' && (
            <p className="text-center font-bold text-destructive">This item is no longer available.</p>
          )}

          {!user && (
            <p className="text-center text-muted-foreground">
                <Link href="/login" className="underline">Log in</Link> or <Link href="/signup" className="underline">sign up</Link> to interact with this item.
            </p>
          )}
        </div>
      </div>
       {user && (
        <ProposeSwapDialog
          isOpen={isSwapDialogOpen}
          onClose={() => setIsSwapDialogOpen(false)}
          onSubmit={handleProposeSwap}
          proposerId={user.uid}
          isProposing={isProposing}
        />
      )}
    </div>
  );
}
