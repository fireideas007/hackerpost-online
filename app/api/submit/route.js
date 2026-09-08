import { NextResponse } from 'next/server';
import { addSubmission, getSubmissions } from '@/lib/submissionsStore';
import { rateLimiter, sanitizeInput } from '@/lib/security';

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    
    // Rate limit: 5 submissions per 10 minutes per IP
    const rateCheck = rateLimiter.check(`submit_${ip}`, 5, 600);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: "Too many submissions. Please wait before submitting another pitch.",
        retryAfter: rateCheck.retryAfter
      }, { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter) } });
    }

    const body = await req.json();

    // Validation
    const companyName = sanitizeInput(body.companyName || "");
    const contactName = sanitizeInput(body.contactName || "");
    const contactEmail = sanitizeInput(body.contactEmail || "").toLowerCase();
    const title = sanitizeInput(body.title || "");
    const summary = sanitizeInput(body.summary || "");
    const website = sanitizeInput(body.website || "");
    const pressReleaseUrl = sanitizeInput(body.pressReleaseUrl || "");
    const category = sanitizeInput(body.category || "SecTech & Startups");
    const fundingAmount = sanitizeInput(body.fundingAmount || "");
    const fundingRound = sanitizeInput(body.fundingRound || "");
    const tier = sanitizeInput(body.tier || "Free");
    const type = sanitizeInput(body.type || "press_release");

    if (!title || title.length < 5) {
      return NextResponse.json({ success: false, error: "Please provide a descriptive headline/title (min 5 chars)." }, { status: 400 });
    }

    if (!contactEmail || !contactEmail.includes("@")) {
      return NextResponse.json({ success: false, error: "Please provide a valid corporate contact email for verification." }, { status: 400 });
    }

    if (!summary || summary.length < 20) {
      return NextResponse.json({ success: false, error: "Please provide a summary or press release details (min 20 chars)." }, { status: 400 });
    }

    const record = addSubmission({
      companyName,
      contactName,
      contactEmail,
      title,
      summary,
      website,
      pressReleaseUrl,
      category,
      fundingAmount,
      fundingRound,
      tier,
      type
    });

    return NextResponse.json({
      success: true,
      message: tier === "Free" 
        ? "Your pitch has been submitted to the HackerPost editorial queue. Our team reviews submissions within 48-72 hours."
        : "Fast-Track submission initiated! Our CISO editorial desk has prioritized your story for immediate verification.",
      submission: {
        id: record.id,
        tier: record.tier,
        status: record.status,
        submittedAt: record.submittedAt
      }
    });
  } catch (err) {
    console.error("Error in /api/submit:", err);
    return NextResponse.json({ success: false, error: "Internal server error processing pitch submission." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const list = getSubmissions();
    const stats = {
      totalReceived: list.length,
      approved: list.filter(s => s.status === "approved_published").length,
      pending: list.filter(s => s.status === "pending_review").length
    };
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch submission stats" }, { status: 500 });
  }
}
