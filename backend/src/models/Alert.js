import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    area: {
      type: String,
      enum: ["Aseo", "TI", "Mantenimiento", "Construcción"],
      required: true,
      index: true,
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "awaiting_review", "approved", "declined"],
      default: "new",
      required: true,
      index: true,
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
      required: true,
      index: true,
    },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    building: { type: String, required: true, trim: true, maxlength: 120 },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    photoUrl: { type: String, maxlength: 2048 },
    evidenceUrl: { type: String, maxlength: 2048 },
  },
  { timestamps: true },
);

alertSchema.index({ area: 1, status: 1, createdAt: -1 });

alertSchema.set("toJSON", {
  transform(_document, result) {
    result.id = result._id.toString();
    result.createdAt = result.createdAt?.getTime();
    delete result._id;
    delete result.__v;
    delete result.updatedAt;
    return result;
  },
});

export const Alert = mongoose.model("Alert", alertSchema);
