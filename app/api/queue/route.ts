import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, response: NextResponse) {
	return NextResponse.json(
		{
			message: "Hello, world!",
		}, {
			status: 200,
		}
	);
}