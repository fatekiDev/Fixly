import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["member", "manager", "admin"],
      default: "member",
      required: true,
    },
    area: {
      type: String,
      enum: ["Aseo", "TI", "Mantenimiento", "Construcción"],
      required() {
        return this.role === "manager";
      },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
  if (this.isModified("passwordHash")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
});

userSchema.set("toJSON", {
  transform(_document, result) {
    result.id = result._id.toString();
    delete result._id;
    delete result.__v;
    delete result.passwordHash;
    delete result.createdAt;
    delete result.updatedAt;
    return result;
  },
});

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model("User", userSchema);
