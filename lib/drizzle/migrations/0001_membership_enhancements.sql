-- Migration: Add registration & academic profile + membership approval columns to members table
-- Run this in your Supabase SQL Editor or via Drizzle migrate if any columns are missing.

ALTER TABLE "members" 
  ADD COLUMN IF NOT EXISTS "student_id" text,
  ADD COLUMN IF NOT EXISTS "campus" text DEFAULT 'Chiromo Campus',
  ADD COLUMN IF NOT EXISTS "is_chiromo" boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS "course" text,
  ADD COLUMN IF NOT EXISTS "year_of_study" text,
  ADD COLUMN IF NOT EXISTS "phone_number" text,
  ADD COLUMN IF NOT EXISTS "auth_provider" text DEFAULT 'email_password',
  ADD COLUMN IF NOT EXISTS "membership_status" text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "membership_fee_status" text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS "fee_amount_paid" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "mpesa_reference" text,
  ADD COLUMN IF NOT EXISTS "reviewed_by_id" uuid,
  ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "review_notes" text;
