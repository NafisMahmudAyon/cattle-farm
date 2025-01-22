// app/api/webhook/clerk/route.ts
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "svix";

// Initialize Supabase client
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
	// Get the headers
	const headerPayload = await headers();
	const svix_id = headerPayload.get("svix-id");
	const svix_timestamp = headerPayload.get("svix-timestamp");
	const svix_signature = headerPayload.get("svix-signature");

	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response("Error occured -- no svix headers", {
			status: 400,
		});
	}

	// Get the body
	const payload = await req.json();
	const body = JSON.stringify(payload);

	// Create a new Svix instance with your webhook secret
	const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

	let evt: WebhookEvent;

	// Verify the webhook
	try {
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return new Response("Error occured", {
			status: 400,
		});
	}

	// Handle the webhook
	const eventType = evt.type;

	if (eventType === "user.created") {
		const { id, email_addresses, first_name, last_name, created_at } = evt.data;

		try {
			// Insert the user data into Supabase
			const { error } = await supabase.from("users").insert({
				email: email_addresses[0].email_address,
				name: first_name,
				created_at: created_at,
			});

			if (error) throw error;

			return new Response("User successfully created in Supabase", {
				status: 200,
			});
		} catch (error) {
			console.error("Error inserting user into Supabase:", error);
			return new Response("Error creating user in Supabase", {
				status: 500,
			});
		}
	}

	return new Response("Webhook received", {
		status: 200,
	});
}

