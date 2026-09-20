import { z } from "zod";

export const EventSlugEnum = z.enum([
  "startup-roulette",
  "the-war-room",
  "the-boardroom",
  "entre-prenormie",
  "bulls-and-bears",
]);

export type EventSlug = z.infer<typeof EventSlugEnum>;

export const registrationSchema = z.object({
  // 1. Basic Participant Details
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\s-]{10,15}$/, "Please enter a valid phone number"),

  // 2. Event Selection (single event selection for dedicated flow)
  selectedEvents: z
    .array(EventSlugEnum)
    .min(1, "Please select an event to register for"),

  // 3. Event-specific conditional fields
  // Startup Roulette
  startupRoulette: z
    .object({
      teamName: z.string().optional(),
      teamLeaderName: z.string().optional(),
      teamMembersNames: z.string().optional(),
      ideaName: z.string().optional(),
      ideaDescription: z.string().optional(),
    })
    .optional(),

  // The War Room
  theWarRoom: z
    .object({
      teamName: z.string().optional(),
      teamLeaderName: z.string().optional(),
      teamMembersNames: z.string().optional(),
    })
    .optional(),

  // The Boardroom
  theBoardroom: z
    .object({
      teamName: z.string().optional(),
      teamLeaderName: z.string().optional(),
      teamMembersNames: z.string().optional(),
    })
    .optional(),

  // Entre-Prenormie
  entrePrenormie: z
    .object({
      founderDiscussionTopic: z.string().optional(),
    })
    .optional(),

  // 4. Confirmation
  confirmedRules: z.literal(true, {
    errorMap: () => ({
      message: "You must agree to the rules and guidelines of Cabinet Valley",
    }),
  }),
}).superRefine((data, ctx) => {
  // Validate conditional requirements when event is chosen
  if (data.selectedEvents.includes("startup-roulette")) {
    if (!data.startupRoulette?.teamName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startupRoulette", "teamName"],
        message: "Team name is required for Startup Roulette",
      });
    }
    const rouletteMembers =
      data.startupRoulette?.teamMembersNames
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    if (rouletteMembers.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startupRoulette", "teamMembersNames"],
        message: "Startup Roulette requires 3 to 5 participants (1 Leader + at least 2 additional team members)",
      });
    }
  }

  if (data.selectedEvents.includes("the-war-room")) {
    if (!data.theWarRoom?.teamName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["theWarRoom", "teamName"],
        message: "Team name is required for The War Room",
      });
    }
    const warRoomMembers =
      data.theWarRoom?.teamMembersNames
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    if (warRoomMembers.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["theWarRoom", "teamMembersNames"],
        message: "The War Room requires 3 to 5 participants (1 Leader + at least 2 additional team members)",
      });
    }
  }

  if (data.selectedEvents.includes("the-boardroom")) {
    if (!data.theBoardroom?.teamName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["theBoardroom", "teamName"],
        message: "Team name is required for The Boardroom",
      });
    }
    if (!data.theBoardroom?.teamMembersNames?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["theBoardroom", "teamMembersNames"],
        message: "Please list duo partner name",
      });
    }
  }
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

