'use server'

import fs from 'fs/promises';
import path from 'path';
import type { Item, Swap, SwapProposal, UserProfile } from "@/lib/types";
import { dummyItems } from '../dummy-data';

const dbPath = path.join(process.cwd(), 'src/lib/firebase/mock-db.json');

interface MockDB {
  users: Record<string, UserProfile & { password?: string }>;
  items: Item[];
  swaps: Swap[];
}

async function ensureFileExists() {
  try {
    await fs.access(dbPath);
  } catch {
    const initialDB: MockDB = {
      users: {},
      items: dummyItems,
      swaps: []
    };
    await fs.writeFile(dbPath, JSON.stringify(initialDB, null, 2), 'utf-8');
  }
}

export async function getMockDB(): Promise<MockDB> {
  await ensureFileExists();
  const content = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(content) as MockDB;
}

export async function saveMockDB(db: MockDB): Promise<void> {
  await ensureFileExists();
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

// Authentication Helpers
export async function mockSaveUser(uid: string, profile: UserProfile & { password?: string }) {
  const db = await getMockDB();
  db.users[uid] = profile;
  await saveMockDB(db);
}

export async function mockGetUser(uid: string): Promise<(UserProfile & { password?: string }) | null> {
  const db = await getMockDB();
  return db.users[uid] || null;
}

export async function mockGetUserByEmail(email: string): Promise<(UserProfile & { password?: string }) | null> {
  const db = await getMockDB();
  const users = Object.values(db.users);
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return found || null;
}

// Firestore operations mocked
export async function mockCreateUserProfile(uid: string, data: Omit<UserProfile, 'uid'>) {
  const db = await getMockDB();
  db.users[uid] = { uid, ...data };
  await saveMockDB(db);
}

export async function mockGetUserProfile(uid: string): Promise<UserProfile | null> {
  const db = await getMockDB();
  const u = db.users[uid];
  if (!u) return null;
  const { password, ...profile } = u;
  return profile;
}

export async function mockUpdateUserProfile(uid: string, data: Partial<UserProfile>) {
  const db = await getMockDB();
  if (db.users[uid]) {
    db.users[uid] = { ...db.users[uid], ...data };
    await saveMockDB(db);
  }
}

export async function mockAddItem(itemData: Omit<Item, 'id' | 'createdAt' | 'uploaderId' | 'status' | 'uploaderName'>, userId: string, userName: string): Promise<string> {
  const db = await getMockDB();
  const newId = `mock_item_${Date.now()}`;
  const newItem: Item = {
    ...itemData,
    id: newId,
    uploaderId: userId,
    uploaderName: userName,
    createdAt: new Date(),
    status: 'available'
  };
  db.items.push(newItem);
  await saveMockDB(db);
  return newId;
}

export async function mockGetAvailableItems(): Promise<Item[]> {
  const db = await getMockDB();
  return db.items.filter(item => item.status === 'available');
}

export async function mockGetItemById(id: string): Promise<Item | null> {
  const db = await getMockDB();
  const item = db.items.find(item => item.id === id);
  return item || null;
}

export async function mockGetUserItems(userId: string): Promise<Item[]> {
  const db = await getMockDB();
  return db.items.filter(item => item.uploaderId === userId);
}

export async function mockGetUserAvailableItems(userId: string): Promise<Item[]> {
  const db = await getMockDB();
  return db.items.filter(item => item.uploaderId === userId && item.status === 'available');
}

export async function mockRedeemItem(userId: string, itemId: string) {
  const db = await getMockDB();
  const user = db.users[userId];
  const item = db.items.find(i => i.id === itemId);

  if (!user || !item) {
    throw new Error("User or Item does not exist!");
  }

  if (user.points < item.points) {
    throw new Error("Not enough points to redeem this item.");
  }

  user.points -= item.points;
  item.status = 'swapped';
  await saveMockDB(db);
}

export async function mockProposeSwap(proposal: SwapProposal) {
  const db = await getMockDB();
  const newSwap: Swap = {
    ...proposal,
    id: `mock_swap_${Date.now()}`,
    status: 'pending',
    createdAt: new Date()
  };
  db.swaps.push(newSwap);
  await saveMockDB(db);
}

export async function mockGetUserSwaps(userId: string): Promise<Swap[]> {
  const db = await getMockDB();
  const filteredSwaps = db.swaps.filter(s => s.proposerId === userId || s.receiverId === userId);

  const itemsMap = new Map<string, Item>();
  db.items.forEach(item => itemsMap.set(item.id, item));

  return filteredSwaps.map(swap => ({
    ...swap,
    proposerItem: itemsMap.get(swap.proposerItemId),
    receiverItem: itemsMap.get(swap.receiverItemId)
  }));
}

export async function mockUpdateSwapStatus(swapId: string, status: 'accepted' | 'rejected') {
  const db = await getMockDB();
  const swap = db.swaps.find(s => s.id === swapId);
  if (!swap) {
    throw new Error("Swap proposal not found.");
  }

  swap.status = status;

  if (status === 'accepted') {
    const proposerItem = db.items.find(i => i.id === swap.proposerItemId);
    const receiverItem = db.items.find(i => i.id === swap.receiverItemId);
    if (proposerItem) proposerItem.status = 'swapped';
    if (receiverItem) receiverItem.status = 'swapped';
  }

  await saveMockDB(db);
}
