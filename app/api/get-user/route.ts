import { NextResponse } from "next/server";
import { supabase } from "@/components/supabaseClient";

export const GET = async (req: Request) => {
	const url = new URL(req.url);
	const clerk_user_id = url.searchParams.get("clerk_user_id");

	if (!clerk_user_id) {
		return NextResponse.json(
			{ error: "Missing clerk_user_id" },
			{ status: 400 }
		);
	}

	try {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("clerk_user_id", clerk_user_id);

		if (error) {
			console.error("Error fetching user:", error.message);
			return NextResponse.json(
				{ error: "Failed to fetch user" },
				{ status: 500 }
			);
		}

		return NextResponse.json(data, { status: 200 });
	} catch (err) {
		console.error("Unhandled error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
};


export const POST = async (req: Request) => {
	try {
		const { email, clerk_user_id, name, first_name, last_name } =
			await req.json();

		if (!clerk_user_id || !email || !name || !first_name || !last_name) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase.from("users").insert(
			{
				email,
				clerk_user_id,
				name,
				first_name,
				last_name,
			}
		);

		if (error) {
			console.error("Database insertion error:", error.message);
			return NextResponse.json(
				{ error: "Failed to add user to the database" },
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ message: "User added successfully", user: data },
			{ status: 200 }
		);
	} catch (err) {
		console.error("Unhandled error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
};