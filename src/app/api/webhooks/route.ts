import { headers } from "next/headers";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";

import { db } from "~/server/db";
import { propertyOwner } from "~/server/db/schema";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env",
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = (await req.json()) as Record<string, unknown>;
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data;
  const eventType = evt.type;

  if (evt.type === "user.created") {
    console.log("userId:", evt.data.id);
    const id = evt.data.id;
    const email = evt.data.email_addresses[0]?.email_address;
    const firstName = evt.data.first_name;
    const lastName = evt.data.last_name;

    if (email == null || firstName == null || lastName == null) {
      console.error("Error: Missing required fields");
    } else {
      console.log("Inserting user into database...");
      const insertedUser = await db
        .insert(propertyOwner)
        .values({
          id,
          email,
          firstName,
          lastName,
        })
        .returning();

      console.log(insertedUser);
      console.log("Added new user to database");
    }
  }

  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  console.log("Webhook payload:", body);

  return new Response("Webhook received", { status: 200 });
}
