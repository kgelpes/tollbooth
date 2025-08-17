import { authClient } from "../lib/authClient";

export function useUser() {
	const { data: userData } = authClient.useSession();

	return userData;
}