import { dbPool } from "../db";

export interface UserServerWallet {
  user_id: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export async function getUserServerWalletAddress(
  userId: string,
): Promise<string | null> {
  const { rows } = await dbPool.query<{ wallet_address: string }>(
    'select wallet_address from public.user_server_wallets where user_id = $1 limit 1',
    [userId],
  );
  return rows[0]?.wallet_address ?? null;
}

export async function upsertUserServerWallet(
  userId: string,
  address: string,
): Promise<void> {
  await dbPool.query(
    `insert into public.user_server_wallets (user_id, wallet_address)
     values ($1, $2)
     on conflict (user_id) do update set wallet_address = excluded.wallet_address, updated_at = now()`,
    [userId, address],
  );
}

export async function deleteUserServerWallet(userId: string): Promise<boolean> {
  const result = await dbPool.query(
    'delete from public.user_server_wallets where user_id = $1',
    [userId],
  );
  return (result.rowCount ?? 0) > 0;
}


