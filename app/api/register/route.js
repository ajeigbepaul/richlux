import { connectToDB } from "@/utils/database";
import { User } from "@/model/User";
import bcrypt from "bcrypt";

export const POST = async (req, res) => {
  const { username, email, password } = await req.json();
  try {
    connectToDB();
    // Do a check for already existing email.
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return new Response("User already exist", { status: 409 });
    // Hash password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(password, salt);
    const user = new User({
      username: username,
      email: email,
      password: hashPassword,
    });
    await user.save();
    return new Response(JSON.stringify(user), { status: 201 });
  } catch (error) {
    return new Response("Failed to create new user", { status: 500 });
  }
};
