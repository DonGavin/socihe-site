const MAX_BODY_LENGTH = 12_000;

const ACADEMIC_LEVELS = {
  undergraduate: "Undergraduate student",
  graduate: "Graduate student",
  doctoral: "Doctoral student",
  postdoctoral: "Postdoctoral researcher",
  faculty: "Faculty or staff",
  "industry-professional": "Industry professional",
  "institutional-contact": "Institutional representative",
};

const INQUIRY_TYPES = {
  "individual-membership": "Individual membership",
  "institutional-block": "Institutional membership block",
  "scholarship-inquiry": "Scholarship inquiry",
  "general-question": "General question",
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength + 1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTextValue(value) {
  return value || "Not provided";
}

function formatHtmlValue(value) {
  return escapeHtml(formatTextValue(value)).replaceAll("\n", "<br>");
}

function validateSubmission(payload) {
  const submission = {
    firstName: cleanString(payload.firstName, 80),
    lastName: cleanString(payload.lastName, 80),
    email: cleanString(payload.email, 254).toLowerCase(),
    institution: cleanString(payload.institution, 160),
    academicLevel: cleanString(payload.academicLevel, 40),
    inquiryType: cleanString(payload.inquiryType, 40),
    message: cleanString(payload.message, 2_000),
    website: cleanString(payload.website, 200),
    privacyAcknowledgment: payload.privacyAcknowledgment === true,
  };

  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!submission.firstName || submission.firstName.length > 80) {
    errors.push("Enter a valid first name.");
  }
  if (!submission.lastName || submission.lastName.length > 80) {
    errors.push("Enter a valid last name.");
  }
  if (!emailPattern.test(submission.email) || submission.email.length > 254) {
    errors.push("Enter a valid email address.");
  }
  if (!submission.institution || submission.institution.length > 160) {
    errors.push("Enter an institution of 160 characters or fewer.");
  }
  if (!Object.hasOwn(ACADEMIC_LEVELS, submission.academicLevel)) {
    errors.push("Select a valid academic level.");
  }
  if (!Object.hasOwn(INQUIRY_TYPES, submission.inquiryType)) {
    errors.push("Select a valid inquiry type.");
  }
  if (!submission.message || submission.message.length > 2_000) {
    errors.push("Enter a message of 2,000 characters or fewer.");
  }
  if (!submission.privacyAcknowledgment) {
    errors.push("Confirm the privacy acknowledgment before submitting.");
  }

  return { submission, errors };
}

function buildEmails(submission, env, reference, receivedAt) {
  const academicLevel = ACADEMIC_LEVELS[submission.academicLevel];
  const inquiryType = INQUIRY_TYPES[submission.inquiryType];
  const fullName = `${submission.firstName} ${submission.lastName}`;
  const replyTo = env.SCHE_REPLY_TO || env.MEMBERSHIP_INBOX;

  const internalText = [
    "A new SCHE membership form was submitted.",
    "",
    `Reference: ${reference}`,
    `Received: ${receivedAt}`,
    `Name: ${fullName}`,
    `Email: ${submission.email}`,
    `Institution: ${formatTextValue(submission.institution)}`,
    `Academic level: ${academicLevel}`,
    `Inquiry type: ${inquiryType}`,
    "",
    "Message:",
    formatTextValue(submission.message),
  ].join("\n");

  const internalHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#213421;max-width:680px;margin:auto">
      <h1 style="color:#6c1f2b;font-size:24px">New SCHE membership inquiry</h1>
      <p><strong>Reference:</strong> ${escapeHtml(reference)}<br>
      <strong>Received:</strong> ${escapeHtml(receivedAt)}</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #d8ded2"><strong>Name</strong></td><td style="padding:8px;border:1px solid #d8ded2">${escapeHtml(fullName)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #d8ded2"><strong>Email</strong></td><td style="padding:8px;border:1px solid #d8ded2">${escapeHtml(submission.email)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #d8ded2"><strong>Institution</strong></td><td style="padding:8px;border:1px solid #d8ded2">${formatHtmlValue(submission.institution)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #d8ded2"><strong>Academic level</strong></td><td style="padding:8px;border:1px solid #d8ded2">${escapeHtml(academicLevel)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #d8ded2"><strong>Inquiry type</strong></td><td style="padding:8px;border:1px solid #d8ded2">${escapeHtml(inquiryType)}</td></tr>
      </table>
      <h2 style="color:#3f6b35;font-size:19px">Message</h2>
      <p style="white-space:normal">${formatHtmlValue(submission.message)}</p>
    </div>`;

  const confirmationText = [
    `Hello ${submission.firstName},`,
    "",
    "Thank you for contacting The Society of Cannabis in Higher Education. We received your submission and will review it shortly.",
    "",
    `Inquiry type: ${inquiryType}`,
    `Reference: ${reference}`,
    `Received: ${receivedAt}`,
    "",
    "Please do not send sensitive personal, medical, financial, or payment information by reply.",
    "",
    "The Society of Cannabis in Higher Education",
  ].join("\n");

  const confirmationHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#213421;max-width:640px;margin:auto">
      <div style="border-top:6px solid #6c1f2b;padding:24px;border-left:1px solid #d8ded2;border-right:1px solid #d8ded2;border-bottom:1px solid #d8ded2">
        <h1 style="color:#3f6b35;font-size:24px">We received your submission</h1>
        <p>Hello ${escapeHtml(submission.firstName)},</p>
        <p>Thank you for contacting <strong>The Society of Cannabis in Higher Education</strong>. We received your submission and will review it shortly.</p>
        <p><strong>Inquiry type:</strong> ${escapeHtml(inquiryType)}<br>
        <strong>Reference:</strong> ${escapeHtml(reference)}<br>
        <strong>Received:</strong> ${escapeHtml(receivedAt)}</p>
        <p style="font-size:13px;color:#5c6659">Please do not send sensitive personal, medical, financial, or payment information by reply.</p>
      </div>
    </div>`;

  return [
    {
      from: env.RESEND_FROM_EMAIL,
      to: [env.MEMBERSHIP_INBOX],
      reply_to: submission.email,
      subject: `New SCHE inquiry — ${inquiryType}`,
      text: internalText,
      html: internalHtml,
      tags: [{ name: "inquiry_type", value: submission.inquiryType }],
    },
    {
      from: env.RESEND_FROM_EMAIL,
      to: [submission.email],
      reply_to: replyTo,
      subject: `SCHE submission received — ${reference}`,
      text: confirmationText,
      html: confirmationHtml,
      tags: [{ name: "email_type", value: "confirmation" }],
    },
  ];
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");

  if (origin && origin !== requestUrl.origin) {
    return jsonResponse({ success: false, message: "Request origin is not allowed." }, 403);
  }

  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse({ success: false, message: "Submit the form as JSON." }, 415);
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse({ success: false, message: "The form could not be read." }, 400);
  }

  if (!rawBody || rawBody.length > MAX_BODY_LENGTH) {
    return jsonResponse({ success: false, message: "The submission is empty or too large." }, 413);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ success: false, message: "The submission format is invalid." }, 400);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonResponse({ success: false, message: "The submission format is invalid." }, 400);
  }

  const { submission, errors } = validateSubmission(payload);

  // A completed honeypot is treated as accepted so automated senders receive no useful signal.
  if (submission.website) {
    return jsonResponse({ success: true, message: "Thank you. Your submission was received." });
  }

  if (errors.length) {
    return jsonResponse(
      { success: false, message: "Please correct the form and try again.", errors },
      422,
    );
  }

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.MEMBERSHIP_INBOX) {
    console.error("Membership form email configuration is incomplete.");
    return jsonResponse(
      { success: false, message: "The form is temporarily unavailable. Please try again later." },
      503,
    );
  }

  const now = new Date();
  const reference = `SCHE-${now.toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const receivedAt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(now);
  const emails = buildEmails(submission, env, reference, receivedAt);

  let resendResponse;
  try {
    resendResponse = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `membership/${reference}`,
      },
      body: JSON.stringify(emails),
    });
  } catch (error) {
    console.error("Resend request failed:", error instanceof Error ? error.name : "UnknownError");
    return jsonResponse(
      { success: false, message: "Your submission could not be sent. Please try again." },
      502,
    );
  }

  if (!resendResponse.ok) {
    console.error("Resend batch request returned status", resendResponse.status);
    return jsonResponse(
      { success: false, message: "Your submission could not be sent. Please try again." },
      502,
    );
  }

  return jsonResponse({
    success: true,
    message: "Thank you. Your submission was received. A confirmation email is on its way.",
    reference,
  });
}

export function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return jsonResponse({ success: false, message: "Method not allowed." }, 405);
}
