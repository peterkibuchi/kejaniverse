import { headers } from "next/headers";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";

import { env } from "~/env";
import { db } from "~/server/db";
import { propertyOwner } from "~/server/db/schema";

export async function POST(req: Request) {
  // Create new Svix instance with secret
  const wh = new Webhook(env.CLERK_SIGNING_SECRET);

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

  const eventType = evt.type;

  const defaultResponse = new Response("Webhook received", { status: 200 });

  if (eventType !== "user.created") {
    return defaultResponse;
  }

  const { id } = evt.data;

  const email = evt.data.email_addresses[0]?.email_address;
  const firstName = evt.data.first_name;
  const lastName = evt.data.last_name;

  if (id === null || email == null || firstName == null || lastName == null) {
    console.error("Error: Missing required fields");
    return defaultResponse;
  }

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

  return defaultResponse;
}
