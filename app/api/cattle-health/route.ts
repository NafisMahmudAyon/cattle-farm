import { supabase } from "@/components/supabaseClient";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
	try {
		const url = new URL(req.url);
		const id = url.searchParams.get("id");

		// Validate the presence of id
		if (!id) {
			return NextResponse.json({ error: "Missing id" }, { status: 400 });
		}

		// Fetch farms where id matches
		const { data, error } = await supabase
			.from("cattle_health_records")
			.select("*")
			.eq("cattle_id", id);

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
