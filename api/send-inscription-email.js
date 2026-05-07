export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { type, to, title, extra } = req.body
  if (!type || !to || !title) return res.status(400).json({ error: 'Missing required fields' })

  const subjects = {
    'received':  `Your submission has been received — ${title}`,
    'approved':  `Your submission has been approved — ${title}`,
    'rejected':  `Update on your submission — ${title}`,
    'more-info': `We need more information — ${title}`,
  }

  const bodies = {
    'received': `
      <h1 style="font-size:22px;font-weight:400;color:#2a1f0a;margin:0 0 14px;">Submission received</h1>
      <p style="font-size:15px;color:#5a4a2a;line-height:1.7;margin:0 0 16px;">
        Thank you for submitting <strong>${title}</strong> to the Shilalekh archive.
      </p>
      <p style="font-size:15px;color:#5a4a2a;line-height:1.7;margin:0 0 24px;">
        Our editorial team will review your entry against our verification standards.
        You will receive an email when a decision has been made. This typically takes
        a few days.
      </p>`,

    'approved': `
      <h1 style="font-size:22px;font-weight:400;color:#2a1f0a;margin:0 0 14px;">Your entry is now live</h1>
      <p style="font-size:15px;color:#5a4a2a;line-height:1.7;margin:0 0 16px;">
        We are pleased to confirm that your submission <strong>${title}</strong> has been
        reviewed, verified, and is now published in the Shilalekh archive.
      </p>
      <p style="font-size:15px;color:#5a4a2a;line-height:1.7;margin:0 0 24px;">
        Thank you for contributing to the preservation of epigraphic heritage.
        Your entry strengthens the archive for scholars and researchers worldwide.
      </p>
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
        <tr>
          <td style="background:#3d2a0a;border-radius:8px;">
            <a href="https://shilalekh.org/inscriptions"
               style="display:inline-block;padding:14px 32px;color:#e8d8b0;
                      text-decoration:none;font-family:Georgia,serif;
                      font-size:15px;letter-spacing:.03em;">
              View the archive →
            </a>
          </td>
        </tr>
      </table>`,

    'rejected': `
      <h1 style="font-size:22px;font-weight:400;color:#2a1f0a;margin:0 0 14px;">Update on your submission</h1>
      <p style="font-size:15px;color:#5a4a2a;line-height:1.7;margin:0 0 16px;">
        Thank you for submitting <strong>${title}</strong> to the Shilalekh archive.
        After careful review, we are unable to include this entry at this time.
      </p>
      ${extra ? `
      <div style="background:#f0e8d8;border-left:3px solid #8a6c28;border-radius:0 6px 6px 0;padding:14px 18px;margin:0 0 20px;">
        <p style="font-size:12px;color:#6a4a1a;font-weight:500;margin:0 0 6px;letter-spacing:.05em;">REASON</p>
        <p style="font-size:14px;color:#5a4a2a;margin:0;line-height:1.6;">${extra}</p>
      </div>` : ''}
      <p style="font-size:15px;color:#5a4a2a;line-height:1.7;margin:0 0 24px;">
        If you believe this decision was made in error, or if you can provide
        additional source verification, please reply to this email or contact us at
        <a href="mailto:hello@shilalekh.org" style="color:#6a4a1a;">hello@shilalekh.org</a>.
      </p>`,

    'more-info': `
      <h1 style="font-size:22px;font-weight:400;color:#2a1f0a;margin:0 0 14px;">Additional information needed</h1>
      <p style="font-size:15px;color:#5a4a2a;line-height:1.7;margin:0 0 16px;">
        We are currently reviewing your submission <strong>${title}</strong> and
        have a question before we can proceed.
      </p>
      ${extra ? `
      <div style="background:#f0e8d8;border-left:3px solid #8a6c28;border-radius:0 6px 6px 0;padding:14px 18px;margin:0 0 20px;">
        <p style="font-size:12px;color:#6a4a1a;font-weight:500;margin:0 0 6px;letter-spacing:.05em;">MESSAGE FROM THE EDITORIAL TEAM</p>
        <p style="font-size:14px;color:#5a4a2a;margin:0;line-height:1.6;">${extra}</p>
      </div>` : ''}
      <p style="font-size:15px;color:#5a4a2a;line-height:1.7;margin:0 0 24px;">
        Please reply directly to this email with the requested information and
        we will continue the review process.
      </p>`,
  }

  const bodyContent = bodies[type]
  if (!bodyContent) return res.status(400).json({ error: 'Invalid email type' })

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0b07;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d0b07;padding:40px 16px;">
  <tr><td align="center">
  <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;border-radius:12px;overflow:hidden;">
    <tr>
      <td align="center" style="background:#1a1008;padding:36px 40px 24px;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px;">
          <tr><td>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="26" cy="22" r="9" stroke="#e8d8b0" stroke-width="1.5"/>
              <line x1="26" y1="6" x2="26" y2="10" stroke="#e8d8b0" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="26" y1="34" x2="26" y2="38" stroke="#e8d8b0" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="10" y1="22" x2="14" y2="22" stroke="#e8d8b0" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="38" y1="22" x2="42" y2="22" stroke="#e8d8b0" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="15.2" y1="11.2" x2="18" y2="14" stroke="#e8d8b0" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="34" y1="30" x2="36.8" y2="32.8" stroke="#e8d8b0" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="36.8" y1="11.2" x2="34" y2="14" stroke="#e8d8b0" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="18" y1="30" x2="15.2" y2="32.8" stroke="#e8d8b0" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="26" cy="22" r="2" fill="#e8d8b0"/>
              <path d="M14 42 Q26 36 38 42" stroke="#9c8a60" stroke-width="1" fill="none" stroke-linecap="round"/>
            </svg>
          </td></tr>
        </table>
        <div style="font-size:22px;color:#e8d8b0;letter-spacing:.04em;margin-bottom:6px;">
          <span style="font-size:24px;">शिलालेख</span> &nbsp;Shilalekh
        </div>
        <div style="font-size:11px;color:#9c8a60;letter-spacing:.14em;">यावच्चन्द्रदिवाकरौ</div>
      </td>
    </tr>
    <tr>
      <td style="background:#f5f0e4;padding:36px 40px 28px;">
        ${bodyContent}
        <p style="font-size:12px;color:#8a7050;line-height:1.65;border-top:1px solid #d8c89a;padding-top:18px;margin:0;">
          Questions? Contact us at
          <a href="mailto:hello@shilalekh.org" style="color:#6a4a1a;">hello@shilalekh.org</a>
        </p>
      </td>
    </tr>
    <tr>
      <td align="center" style="background:#120d04;padding:18px 40px;">
        <p style="font-size:11px;color:#6a5838;font-family:sans-serif;line-height:1.6;margin:0;">
          © 2025 Shilalekh &nbsp;·&nbsp; shilalekh.org
        </p>
      </td>
    </tr>
  </table>
  </td></tr>
</table>
</body>
</html>`

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Shilalekh <noreply@shilalekh.org>',
        to: [to],
        subject: subjects[type],
        html,
      }),
    })
    if (!response.ok) throw new Error('Resend error')
    return res.status(200).json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Failed to send email' })
  }
}