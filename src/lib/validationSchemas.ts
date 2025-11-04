import { z } from 'zod';

// Tournament validation schema
export const tournamentSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  tournament_style: z.string().min(1, "Tournament style is required"),
  ball_type: z.string().min(1, "Ball type is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  venue_id: z.string().uuid("Invalid venue ID").optional().nullable(),
  organizer_name: z.string().trim().min(2, "Organizer name must be at least 2 characters").max(100, "Organizer name too long"),
  organizer_email: z.string().email("Invalid email address").max(255, "Email too long").optional().or(z.literal('')),
  organizer_contact: z.string().regex(/^[\d\s\+\-\(\)]+$/, "Invalid phone number format").max(20, "Phone number too long").optional().or(z.literal('')),
  registration_fee: z.number().min(0, "Fee cannot be negative").max(1000000, "Fee too high").optional(),
  prize_money: z.number().min(0, "Prize money cannot be negative").max(100000000, "Prize money too high").optional(),
  max_teams: z.number().int().min(2, "Must have at least 2 teams").max(64, "Cannot exceed 64 teams").optional(),
  logo_url: z.string().url("Invalid URL").max(500, "URL too long").optional().or(z.literal('')),
  description: z.string().max(2000, "Description too long (max 2000 characters)").optional().or(z.literal('')),
  rules: z.string().max(5000, "Rules too long (max 5000 characters)").optional().or(z.literal('')),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional()
});

// Match validation schema
export const matchSchema = z.object({
  team1_id: z.string().uuid("Invalid team ID"),
  team2_id: z.string().uuid("Invalid team ID"),
  match_date: z.string().min(1, "Match date is required"),
  match_time: z.string().optional().or(z.literal('')),
  venue: z.string().trim().min(2, "Venue must be at least 2 characters").max(200, "Venue name too long"),
  format: z.string().min(1, "Match format is required"),
  overs: z.number().int().min(1, "Must have at least 1 over").max(50, "Cannot exceed 50 overs").optional().nullable(),
  tournament: z.string().max(200, "Tournament name too long").optional().or(z.literal('')),
  description: z.string().max(1000, "Description too long").optional().or(z.literal(''))
});

// Player validation schema
export const playerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  role: z.enum(['batsman', 'bowler', 'all-rounder', 'wicket-keeper'], {
    errorMap: () => ({ message: "Invalid player role" })
  }),
  team_id: z.string().uuid("Invalid team ID").optional().nullable(),
  batting_style: z.string().max(50, "Batting style too long").optional().or(z.literal('')),
  bowling_style: z.string().max(50, "Bowling style too long").optional().or(z.literal('')),
  photo_url: z.string().url("Invalid URL").max(500, "URL too long").optional().or(z.literal(''))
});

// Team validation schema
export const teamSchema = z.object({
  name: z.string().trim().min(2, "Team name must be at least 2 characters").max(100, "Team name too long"),
  city: z.string().trim().max(100, "City name too long").optional().or(z.literal(''))
});

// Venue validation schema
export const venueSchema = z.object({
  name: z.string().trim().min(2, "Venue name must be at least 2 characters").max(150, "Venue name too long"),
  location: z.string().trim().min(2, "Location must be at least 2 characters").max(300, "Location too long"),
  city: z.string().trim().max(100, "City name too long").optional().or(z.literal('')),
  capacity: z.number().int().min(0, "Capacity cannot be negative").max(200000, "Capacity too high").optional().nullable(),
  pitch_type: z.string().max(50, "Pitch type too long").optional().or(z.literal('')),
  contact_person: z.string().trim().max(100, "Contact person name too long").optional().or(z.literal('')),
  contact_number: z.string().regex(/^[\d\s\+\-\(\)]+$/, "Invalid phone number format").max(20, "Phone number too long").optional().or(z.literal('')),
  cost_per_match: z.number().min(0, "Cost cannot be negative").max(10000000, "Cost too high").optional().nullable()
});

// Tournament registration validation schema
export const tournamentRegistrationSchema = z.object({
  tournament_id: z.string().uuid("Invalid tournament ID"),
  team_id: z.string().uuid("Invalid team ID"),
  payment_status: z.enum(['pending', 'paid', 'failed']).default('pending')
});
