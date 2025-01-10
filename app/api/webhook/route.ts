import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/components/supabaseClient";

export const POST = async (req: Request) => {
	try {
		const payload = await req.text();
		const signature = req.headers.get("clerk-signature") || "";
		const secret = process.env.CLERK_WEBHOOK_SECRET || "";

		if (!verifyClerkWebhook(payload, signature, secret)) {
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		const { type, data } = JSON.parse(payload);

		if (type === "user.created") {
			const {
				id: clerk_user_id,
				email_addresses,
				first_name,
				last_name,
			} = data;
			const email = email_addresses[0].email_address;
			const name =
				`${first_name || ""} ${last_name || ""}`.trim() || "Unnamed User";

			const { error } = await supabase.from("users").upsert(
				{ clerk_user_id, name, email },
				{ onConflict: "clerk_user_id" } // Ensures no duplicate entries
			);

			if (error) {
				console.error("Error inserting user:", error);
				return NextResponse.json(
					{ error: "Failed to add user" },
					{ status: 500 }
				);
			}

			return NextResponse.json({ message: "User added successfully" });
		}

		return NextResponse.json(
			{ error: "Unhandled event type" },
			{ status: 400 }
		);
	} catch (error) {
		console.error("Error processing webhook:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
};

// Verify Clerk webhook signature
const verifyClerkWebhook = (
	payload: string,
	signature: string,
	secret: string
): boolean => {
	const computedSignature = crypto
		.createHmac("sha256", secret)
		.update(payload)
		.digest("base64");
	return computedSignature === signature;
};
