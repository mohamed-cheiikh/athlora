import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "athlora_session";

const getKey = () =>
  new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-secret-change-in-production");

export async function createSessionToken(payload: {
  sub: string;
  email: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(await Promise.resolve(getKey()));
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    return payload as { sub: string; email: string };
  } catch {
    return null;
  }
}
