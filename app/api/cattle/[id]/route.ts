import { supabase } from "@/components/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// GET handler
// export async function GET(
// 	request: NextRequest,
// 	context: { params: { id: string } }
// ) {
// 	const { id } = await context.params;

// 	try {
// 		const { data, error } = await supabase
// 			.from("cattle")
// 			.select("*")
// 			.eq("id", id)
// 			.single();

// 		if (error) throw new Error(error.message);

// 		return NextResponse.json(data, { status: 200 });
// 	} catch (err: any) {
// 		return NextResponse.json({ error: err.message }, { status: 404 });
// 	}
// }

export async function GET(
	request: NextRequest,
	context: { params: { id: string } }
) {
	const { id } = await context.params;
	try {
		// const url = new URL(req.url);
		// const cattle_id = url.searchParams.get("id");

		// Validate the presence of cattle_id
		if (!id) {
			return NextResponse.json({ error: "Missing cattle_id" }, { status: 400 });
		}

		// Fetch data from multiple tables
		const [cattleRes, healthRes, weightRes, milkRes, reproductiveRes] =
			await Promise.all([
				supabase.from("cattle").select("*").eq("id", id).single(),
				supabase
					.from("cattle_health_records")
					.select("*")
					.eq("cattle_id", id),
				supabase
					.from("cattle_weight_records")
					.select("*")
					.eq("cattle_id", id),
				supabase.from("milk_production").select("*").eq("cattle_id", id),
				supabase
					.from("reproductive_history")
					.select("*")
					.eq("cattle_id", id),
			]);

		// Check for errors in any of the responses
		if (
			cattleRes.error ||
			healthRes.error ||
			weightRes.error ||
			milkRes.error ||
			reproductiveRes.error
		) {
			const errorMessage = [
				cattleRes.error?.message,
				healthRes.error?.message,
				weightRes.error?.message,
				milkRes.error?.message,
				reproductiveRes.error?.message,
			]
				.filter(Boolean)
				.join(", ");
			console.error("Error fetching data:", errorMessage);
			return NextResponse.json(
				{ error: "Failed to fetch data" },
				{ status: 500 }
			);
		}

		// Aggregate the data
		const responseData = {
			cattle: cattleRes.data,
			healthRecords: healthRes.data,
			weightRecords: weightRes.data,
			milkProduction: milkRes.data,
			reproductiveHistory: reproductiveRes.data,
		};

		// Return the aggregated data
		return NextResponse.json(responseData, { status: 200 });
	} catch (err) {
		console.error("Unhandled error in GET /api/cattle-details:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
};


// PUT handler
export async function PUT(
	request: NextRequest,
	context: { params: { id: string } }
) {
	const { id } = await context.params;

	try {
		const body = await request.json();
		const {
			farm_id,
			breed,
			gender,
			dob,
			purchase_date,
			purchase_price,
			status,
		} = body;

		const { data, error } = await supabase
			.from("cattle")
			.update({
				farm_id,
				breed,
				gender,
				dob,
				purchase_date,
				purchase_price,
				status,
			})
			.eq("id", id);

		if (error) throw new Error(error.message);

		return NextResponse.json(data, { status: 200 });
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

// DELETE handler
export async function DELETE(
	request: NextRequest,
	context: { params: { id: string } }
) {
	const { id } = await context.params;

	try {
		const { error } = await supabase.from("cattle").delete().eq("id", id);

		if (error) throw new Error(error.message);

		return NextResponse.json(null, { status: 204 });
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
