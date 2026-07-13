import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { connectToDB } from "./database";
import { User } from "../model/User";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDB();
        const { email, password } = credentials;
        const currentUser = await User.findOne({ email });
        if (!currentUser) {
          throw new Error("Invalid Email or Password");
        }
        const isPasswordMatch = await bcrypt.compare(
          password,
          currentUser.password
        );
        if (!isPasswordMatch) {
          throw new Error("Invalid Email or Password");
        }

        return {
          ...currentUser.toObject(),
          email: currentUser.email,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Only Google sign-ins need auto-provisioning here -- credentials users
    // are already created via /api/register. The previous version checked
    // `provider === "credentials"` and read `profile.name`/`profile.picture`,
    // fields that only exist on the OAuth profile object, so it never actually
    // ran for either provider.
    async signIn({ user, account, profile }) {
      try {
        await connectToDB();
        if (account?.provider === "google") {
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
              email: user.email,
              username: (profile?.name || user.name || user.email.split("@")[0])
                .replace(/\s+/g, "")
                .toLowerCase(),
              image: profile?.picture || user.image,
              role: "user",
            });
          }
        }
        return true;
      } catch (error) {
        console.error("signIn callback error", error);
        return false;
      }
    },
    // Persist role/id onto the token once, then reuse it -- avoids a Mongo
    // round-trip on every request. A role change made by a Super Admin only
    // takes effect once this token refreshes (default 30-day maxAge).
    async jwt({ token, user }) {
      try {
        if (user?.email) {
          await connectToDB();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
          }
        } else if (token?.email && !token.role) {
          await connectToDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
          }
        }
      } catch (error) {
        console.error("jwt callback error", error);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
};
