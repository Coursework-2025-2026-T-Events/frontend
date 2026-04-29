import { z } from "zod";
import { ApiError } from "@/lib/api/client";
import type { LoginResponse, RegisterResponse, UserResponse } from "@/lib/api/types";

const userSchema = z
  .object({
    user_id: z.number(),
    email: z.string(),
    full_name: z.string(),
    role: z.enum(["participant", "stander", "admin"]),
  })
  .strict();

const accessTokenSchema = z.string().min(1);

const authResponseSchema = z
  .object({
    data: z
      .object({
        access_token: accessTokenSchema,
        user: userSchema,
      })
      .strict(),
  })
  .strict();

const userResponseSchema = z
  .object({
    data: userSchema,
  })
  .strict();

function toContractMismatch(error: unknown): ApiError {
  return new ApiError("Auth API response does not match the expected contract", 200, "contract_mismatch", error, "contract");
}

export function parseLoginResponse(value: unknown): LoginResponse {
  const result = authResponseSchema.safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data satisfies LoginResponse;
}

export function parseRegisterResponse(value: unknown): RegisterResponse {
  const result = authResponseSchema.safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data satisfies RegisterResponse;
}

export function parseUserResponse(value: unknown): UserResponse {
  const result = userResponseSchema.safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data satisfies UserResponse;
}
