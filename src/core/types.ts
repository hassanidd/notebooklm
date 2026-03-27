import type z from "zod";
import type {
  refreshTokenSchema,
  signinSchema,
  signupSchema,
  userSchema,
} from "./validations";

export type TUser = z.infer<typeof userSchema>;

export type TSignupInput = z.input<typeof signupSchema>;
export type TSigninInput = z.input<typeof signinSchema>;
export type TRefreshToken = z.infer<typeof refreshTokenSchema>;

export type TSignupResponse = {
  user: TUser;
  accessToken: string;
  refreshToken: string;
};

export type TSigninResponse = {
  user: TUser;
  accessToken: string;
  refreshToken: string;
};

export type TRefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};
