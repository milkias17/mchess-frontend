import type { User } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";

type DecodedAccessToken = {
  email: string;
  exp: number;
  first_name: string;
  last_name: string;
  sub: string;
};

export function accessTokenToUser(accessToken: string): User {
  const userData = jwtDecode<DecodedAccessToken>(accessToken);
  return {
    userId: userData.sub,
    firstName: userData.first_name,
    lastName: userData.last_name,
    email: userData.email,
    token: accessToken,
  };
}
