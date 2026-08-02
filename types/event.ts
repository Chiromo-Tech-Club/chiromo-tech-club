export interface ClubEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  capacity: number | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  memberId: string;
  registeredAt: string;
  attended: boolean;
}
