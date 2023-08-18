import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "../../../../utils/database";
import { User } from "../../../../model/User";
import bcrypt from "bcrypt";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Do the logic to logIn with email and password.
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials, req) {
        await connectToDB();
        // Add logic her to look up the user from the credentials supplied
        const { email, password } = credentials;
        console.log(email, password);
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
    async session({ session }) {
      const sessionUser = await User.findOne({
        email: session.user.email,
      });

      session.user.id = sessionUser?._id.toString();
      return session;
    },
    async signIn({ provider, profile, email, callbackUrl }) {
      try {
        await connectToDB();
        if (provider === "credentials") {
          const userExist = await User.findOne({
            email: email,
          });
          if (!userExist) {
            await User.create({
              email: email,
              username: profile.name.replace(" ", "").toLowerCase(),
              image: profile.picture,
            });
          }
        }
        // Use the callbackUrl here if needed
        //    console.log(callbackUrl);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      } else {
        return "/";
      }
    },
  },
});

export { handler as GET, handler as POST };
