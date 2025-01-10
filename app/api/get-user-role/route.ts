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
			.select("role")
			.eq("clerk_user_id", clerk_user_id)
			.single();

		if (error) {
			console.error("Error fetching user role:", error);
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching user role:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
};
