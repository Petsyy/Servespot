import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: Date,
    duration: String,
    location: String,
    skills: [String],
    volunteersNeeded: { type: Number, default: 1 },

    volunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Volunteer",
      },
    ],

    completedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Volunteer",
      },
    ],

    completionProofs: [
      {
        volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" },
        message: String, // optional text message or notes
        fileUrl: String, // uploaded image or document proof
        filePublicId: String,
        fileResourceType: String,
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
        joinedOpportunities: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Opportunity",
          },
        ],
        submittedAt: { type: Date, default: Date.now },
        rejectedAt: { type: Date }, // when the proof was rejected
      },
    ],

    points: { type: Number, default: 10 },
    fileUrl: String,
    filePublicId: String,
    fileResourceType: String,

    // Opportunity lifecycle
    status: {
      type: String,
      enum: ["Open", "In Progress", "Completed", "Closed"],
      default: "Open",
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    forcedComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Opportunity", opportunitySchema);
