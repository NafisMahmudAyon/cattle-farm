import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";

cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
	const data = await req.formData();
	const file = data.get("file") as Blob;

	if (!file) {
		return NextResponse.json({ error: "File is required" }, { status: 400 });
	}

	try {
		const fileBuffer = Buffer.from(await file.arrayBuffer());
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.v2.uploader.upload_stream(
				{ folder: "cattleFarm" },
				(error, result) => {
					if (error) return reject(error);

					// Only return the secure URL of the uploaded image
					resolve(NextResponse.json({ url: result?.secure_url }));
				}
			);

			uploadStream.end(fileBuffer);
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}