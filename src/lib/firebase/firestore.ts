import { collection, addDoc, serverTimestamp, getDocs, query, where, getDoc, doc, writeBatch, runTransaction, documentId } from "firebase/firestore"; 
import { db, isMockMode } from "./firebase";
import type { Item, Swap, SwapProposal, UserProfile } from "@/lib/types";
import { setDoc } from "firebase/firestore";
import {
  mockCreateUserProfile,
  mockGetUserProfile,
  mockUpdateUserProfile,
  mockAddItem,
  mockGetAvailableItems,
  mockGetItemById,
  mockGetUserItems,
  mockGetUserAvailableItems,
  mockRedeemItem,
  mockProposeSwap,
  mockGetUserSwaps,
  mockUpdateSwapStatus
} from "./mock-actions";

// User Profile Functions
export async function createUserProfile(uid: string, data: Omit<UserProfile, 'uid'>) {
    if (isMockMode) {
        return mockCreateUserProfile(uid, data);
    }
    try {
        await setDoc(doc(db, "users", uid), data);
    } catch (e) {
        console.error("Error creating user profile: ", e);
        throw new Error("Could not create user profile.");
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (isMockMode) {
        return mockGetUserProfile(uid);
    }
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { uid, ...docSnap.data() } as UserProfile;
    } else {
        return null;
    }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
    if (isMockMode) {
        return mockUpdateUserProfile(uid, data);
    }
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data, { merge: true });
}


// Item Functions
export async function addItem(itemData: Omit<Item, 'id' | 'createdAt' | 'uploaderId' | 'status' | 'uploaderName'>, userId: string, userName: string) {
  if (isMockMode) {
      return mockAddItem(itemData, userId, userName);
  }
  try {
    const docRef = await addDoc(collection(db, "items"), {
      ...itemData,
      uploaderId: userId,
      uploaderName: userName,
      createdAt: serverTimestamp(),
      status: 'available',
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not add item to the database.");
  }
}

export async function getAvailableItems(): Promise<Item[]> {
    if (isMockMode) {
        return mockGetAvailableItems();
    }
    const itemsCol = collection(db, 'items');
    const q = query(itemsCol, where('status', '==', 'available'));
    const itemSnapshot = await getDocs(q);
    const itemList = itemSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Item
    });
    return itemList;
}


export async function getItemById(id: string): Promise<Item | null> {
    if (isMockMode) {
        return mockGetItemById(id);
    }
    const docRef = doc(db, 'items', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Item;
    } else {
        console.log("No such document!");
        return null;
    }
}

export async function getUserItems(userId: string): Promise<Item[]> {
    if (isMockMode) {
        return mockGetUserItems(userId);
    }
    const itemsCol = collection(db, 'items');
    const q = query(itemsCol, where('uploaderId', '==', userId));
    const itemSnapshot = await getDocs(q);
    const itemList = itemSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Item
    });
    return itemList;
}

export async function getUserAvailableItems(userId: string): Promise<Item[]> {
    if (isMockMode) {
        return mockGetUserAvailableItems(userId);
    }
    const itemsCol = collection(db, 'items');
    const q = query(itemsCol, where('uploaderId', '==', userId), where('status', '==', 'available'));
    const itemSnapshot = await getDocs(q);
    const itemList = itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
    return itemList;
}

// Swap and Redeem Functions

export async function redeemItem(userId: string, itemId: string) {
    if (isMockMode) {
        return mockRedeemItem(userId, itemId);
    }
    await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", userId);
        const itemRef = doc(db, "items", itemId);

        const userDoc = await transaction.get(userRef);
        const itemDoc = await transaction.get(itemRef);

        if (!userDoc.exists() || !itemDoc.exists()) {
            throw new Error("User or Item does not exist!");
        }

        const userPoints = userDoc.data().points;
        const itemPoints = itemDoc.data().points;

        if (userPoints < itemPoints) {
            throw new Error("Not enough points to redeem this item.");
        }
        
        // Deduct points and update item status
        transaction.update(userRef, { points: userPoints - itemPoints });
        transaction.update(itemRef, { status: "swapped" });
    });
}

export async function proposeSwap(proposal: SwapProposal) {
    if (isMockMode) {
        return mockProposeSwap(proposal);
    }
    try {
        await addDoc(collection(db, "swaps"), {
            ...proposal,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error proposing swap: ", e);
        throw new Error("Could not propose swap.");
    }
}

export async function getUserSwaps(userId: string): Promise<Swap[]> {
    if (isMockMode) {
        return mockGetUserSwaps(userId);
    }
    const swapsRef = collection(db, "swaps");
    const q = query(swapsRef, where('status', '==', 'pending'), where(documentId(), 'in', [
        where('proposerId', '==', userId),
        where('receiverId', '==', userId)
    ]));

    const qProposer = query(swapsRef, where('proposerId', '==', userId));
    const qReceiver = query(swapsRef, where('receiverId', '==', userId));
    
    const [proposerSnapshot, receiverSnapshot] = await Promise.all([
        getDocs(qProposer),
        getDocs(qReceiver),
    ]);
    
    const swaps: Swap[] = [];
    proposerSnapshot.forEach(doc => {
        swaps.push({ id: doc.id, ...doc.data() } as Swap);
    });
    receiverSnapshot.forEach(doc => {
        // Avoid duplicates if a user proposes a swap to themselves
        if (!swaps.some(s => s.id === doc.id)) {
            swaps.push({ id: doc.id, ...doc.data() } as Swap);
        }
    });

    // We need to fetch the item details for each swap
    const itemIds = new Set<string>();
    swaps.forEach(swap => {
        itemIds.add(swap.proposerItemId);
        itemIds.add(swap.receiverItemId);
    });

    if(itemIds.size === 0) return [];

    const itemsRef = collection(db, 'items');
    const itemsQuery = query(itemsRef, where(documentId(), 'in', Array.from(itemIds)));
    const itemsSnapshot = await getDocs(itemsQuery);
    const itemsData = new Map<string, Item>();
    itemsSnapshot.forEach(doc => {
        itemsData.set(doc.id, { id: doc.id, ...doc.data() } as Item);
    });

    return swaps.map(swap => ({
        ...swap,
        proposerItem: itemsData.get(swap.proposerItemId),
        receiverItem: itemsData.get(swap.receiverItemId),
    }));
}

export async function updateSwapStatus(swapId: string, status: 'accepted' | 'rejected') {
    if (isMockMode) {
        return mockUpdateSwapStatus(swapId, status);
    }
    const swapRef = doc(db, 'swaps', swapId);
    
    if (status === 'rejected') {
        await setDoc(swapRef, { status: 'rejected' }, { merge: true });
        return;
    }

    // Handle 'accepted' status within a transaction
    await runTransaction(db, async (transaction) => {
        const swapDoc = await transaction.get(swapRef);
        if (!swapDoc.exists()) {
            throw "Swap document does not exist!";
        }
        const swapData = swapDoc.data() as Swap;

        const proposerItemRef = doc(db, 'items', swapData.proposerItemId);
        const receiverItemRef = doc(db, 'items', swapData.receiverItemId);

        // Mark items as swapped
        transaction.update(proposerItemRef, { status: 'swapped' });
        transaction.update(receiverItemRef, { status: 'swapped' });
        
        // Update swap status
        transaction.update(swapRef, { status: 'accepted' });
    });
}
