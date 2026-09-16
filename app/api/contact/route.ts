import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("📧 Contact form request received");
    console.log("🔍 Checking environment variables...");
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("RESEND_API_KEY value:", process.env.RESEND_API_KEY ? `***${process.env.RESEND_API_KEY.slice(-4)}` : "NOT SET");
    console.log("All env vars keys:", Object.keys(process.env).slice(0, 20));

    // Validate API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is not configured in environment");
      console.error("Available env vars:", Object.keys(process.env).filter(key => key.includes('RESEND') || key.includes('API')));
      return NextResponse.json(
        { error: "Email service not configured. Please contact the site owner." },
        { status: 500 }
      );
    }

    console.log("✓ API key found");

    // Initialize Resend client with API key from environment
    const resend = new Resend(process.env.RESEND_API_KEY);

    let body;
    try {
      body = await request.json();
      console.log("✓ Request body parsed:", { name: body.name, email: body.email });
    } catch (err) {
      console.error("❌ Failed to parse request body:", err);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error("❌ Missing required fields:", { name, email, subject, message });
      return NextResponse.json(
        { error: "Missing required fields: name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    console.log("✓ All fields validated");
    console.log(`📤 Sending email to lucaspmluz@hotmail.com from ${email}`);

    // Send email using Resend SDK
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your verified domain: "Lucas <noreply@yourdomain.com>"
      to: "lucaspmluz@hotmail.com",
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Message from Your Portfolio Contact Form</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6; margin: 0;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    // Handle Resend API errors
    if (error) {
      console.error("❌ Resend API error:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Email service error: ${error.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    // Success response
    console.log("✅ Email sent successfully:", data?.id);
    return NextResponse.json(
      { success: true, message: "Email sent successfully", id: data?.id },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Unexpected error in contact API:", err);
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Unexpected error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
