import { supabase } from "@/components/supabaseClient";
import { NextResponse } from "next/server";

// GET handler for fetching farms based on owner_id
export const GET = async (req: Request) => {
	try {
		const url = new URL(req.url);
		const id = url.searchParams.get("id");

		// Validate the presence of owner_id
		if (!id) {
			return NextResponse.json({ error: "Missing owner_id" }, { status: 400 });
		}

		// Fetch farms where owner_id matches
		const { data, error } = await supabase
			.from("farms")
			.select("*")
			.eq("id", id)
			.single();

		// Handle database errors
		if (error) {
			console.error("Error fetching farms:", error.message);
			return NextResponse.json(
				{ error: "Failed to fetch farms" },
				{ status: 500 }
			);
		}

		// Return the fetched data
		return NextResponse.json(data, { status: 200 });
	} catch (err) {
		console.error("Unhandled error in GET /api/farms:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
};

// POST handler for adding a new farm
export const POST = async (req: Request) => {
	try {
		const { name, location, owner_id } = await req.json();

		// Validate the presence of required fields
		if (!name || !location || !owner_id) {
			return NextResponse.json(
				{ error: "Missing required fields: name, location, or owner_id" },
				{ status: 400 }
			);
		}

		// Insert new farm into the database
		const { data, error } = await supabase.from("farms").insert([
			{
				name,
				location,
				owner_id,
			},
		]);

		// Handle database insertion errors
		if (error) {
			console.error("Database insertion error:", error.message);
			return NextResponse.json(
				{ error: "Failed to add farm to the database" },
				{ status: 500 }
			);
		}

		// Return success response
		return NextResponse.json(
			{ message: "Farm added successfully", farm: data },
			{ status: 201 }
		);
	} catch (err) {
		console.error("Unhandled error in POST /api/farms:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
};
