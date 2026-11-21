import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kind: { type: String, enum: ["report", "evidence"], required: true },
    filename: { type: String, required: true, unique: true },
    contentType: {
      type: String,
      enum: ["image/jpeg", "image/png", "image/webp"],
      required: true,
    },
    size: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Upload = mongoose.model("Upload", uploadSchema);
