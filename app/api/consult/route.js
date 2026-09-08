import { NextResponse } from 'next/server';
import { addConsultation, getConsultations } from '@/lib/consultationsStore';
import { rateLimiter, sanitizeInput } from '@/lib/security';

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    
    // Rate limit: 5 consultation requests per 10 minutes per IP
    const rateCheck = rateLimiter.check(`consult_${ip}`, 5, 600);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: "Too many consultation requests. Please wait before submitting another inquiry.",
        retryAfter: rateCheck.retryAfter
      }, { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter) } });
    }

    const body = await req.json();

    const companyName = sanitizeInput(body.companyName || "");
    const contactName = sanitizeInput(body.contactName || "");
    const contactEmail = sanitizeInput(body.contactEmail || "").toLowerCase();
    const role = sanitizeInput(body.role || "CISO / Executive");
    const infraSize = sanitizeInput(body.infraSize || "");
    const serviceNeeded = sanitizeInput(body.serviceNeeded || "Penetration Testing & Remediation");
    const threatConcern = sanitizeInput(body.threatConcern || "");
    const urgency = sanitizeInput(body.urgency || "standard");

    if (!contactEmail || !contactEmail.includes("@")) {
      return NextResponse.json({ 
        success: false, 
        error: "Please provide a valid corporate email address for verification." 
      }, { status: 400 });
    }

    if (!companyName || companyName.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: "Please provide your enterprise / organization name." 
      }, { status: 400 });
    }

    if (!contactName || contactName.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: "Please provide your name and title." 
      }, { status: 400 });
    }

    const record = addConsultation({
      companyName,
      contactName,
      contactEmail,
      role,
      infraSize,
      serviceNeeded,
      threatConcern,
      urgency
    });

    return NextResponse.json({
      success: true,
      message: "Consultation inquiry received. A Hackproof Technologies Principal Security Architect will contact you within 4 hours.",
      consultationId: record.id,
      record
    }, { status: 201 });

  } catch (err) {
    console.error("Consultation booking error:", err);
    return NextResponse.json({
      success: false,
      error: "Internal server error processing consultation request."
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const list = getConsultations();
    return NextResponse.json({
      success: true,
      count: list.length,
      consultations: list
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Failed to load consultations."
    }, { status: 500 });
  }
}
