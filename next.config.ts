import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				port: "",
				pathname: "/dl0jitzuw/image/upload/v1737540315/cattleFarm/**",
			},
			{
				protocol: "https",
				hostname: "picsum.photos",
				port: "",
			},
		],
	},
};

export default nextConfig;




