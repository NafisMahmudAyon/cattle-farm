import { supabase } from "@/components/supabaseClient";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const farm_id = searchParams.get("farm_id");
		console.log(farm_id)

		if (!farm_id) {
			return new Response(
				JSON.stringify({ error: "Missing or invalid farm_id parameter" }),
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("cattle")
			.select("*")
			.eq("farm_id", farm_id);

		if (error) throw new Error(error.message);

		console.log(data)

		return new Response(JSON.stringify(data), { status: 200 });
	} catch (err) {
		console.error("GET Error:", err.message);
		return new Response(
			JSON.stringify({ error: err.message || "Internal server error" }),
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {
			farm_id,
			breed,
			name,
			nick_name,
			gender,
			dob,
			image_url,
			purchase_date,
			purchase_price,
			status,
		} = body;

		const { data, error } = await supabase
			.from("cattle")
			.insert([
				{ farm_id, breed, gender, name, nick_name, image_url, dob, purchase_date, purchase_price, status },
			]);
		if (error) throw new Error(error.message);

		console.log("Insert successful:", data);

		return new Response(JSON.stringify(data), { status: 201 });
	} catch (err) {
		console.error("POST Error:", err.message);
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
		});
	}
}
