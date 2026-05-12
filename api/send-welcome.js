export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, name } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const firstName = name?.split(' ')[0] || 'there'

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e4;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f0e4;padding:40px 16px;">
  <tr><td align="center">
  <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(61,42,10,0.10);">

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
        <h1 style="font-size:22px;font-weight:400;color:#2a1f0a;margin:0 0 14px;letter-spacing:.01em;">
          Welcome, ${firstName}
        </h1>
        <p style="font-size:15px;color:#5a4a2a;line-height:1.7;margin:0 0 28px;">
          You have joined Shilalekh — a global archive of stone inscriptions
          and epigraphic records. Every inscription in our database has been
          verified against ASI and state archaeology records, so you can
          trust what you find here.
        </p>

        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 28px;">
          <tr>
            <td style="background:#ede8da;border-radius:8px;padding:18px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr>
                  <td style="padding:8px 0;border-bottom:0.5px solid #d8c89a;">
                    <p style="font-size:13px;font-weight:500;color:#2a1f0a;margin:0 0 3px;">Browse the archive</p>
                    <p style="font-size:12px;color:#7a6040;margin:0;">Search by inscription, dynasty, script, location or period.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:0.5px solid #d8c89a;">
                    <p style="font-size:13px;font-weight:500;color:#2a1f0a;margin:0 0 3px;">Explore on the map</p>
                    <p style="font-size:12px;color:#7a6040;margin:0;">See inscriptions plotted across South Asia and beyond. Switch between default, street and satellite views.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <p style="font-size:13px;font-weight:500;color:#2a1f0a;margin:0 0 3px;">Contribute</p>
                    <p style="font-size:12px;color:#7a6040;margin:0;">Know an inscription not yet in our database? Submit it for review. Every verified entry strengthens the archive.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
          <tr>
            <td style="background:#3d2a0a;border-radius:8px;">
              <a href="https://shilalekh.org"
                 style="display:inline-block;padding:14px 32px;color:#e8d8b0;
                        text-decoration:none;font-family:Georgia,serif;
                        font-size:15px;letter-spacing:.03em;">
                Start exploring →
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size:12px;color:#8a7050;line-height:1.65;
                  border-top:1px solid #d8c89a;padding-top:18px;margin:0;">
          If you spot an error in any entry or have a question, write to us at
          <a href="mailto:hello@shilalekh.org" style="color:#6a4a1a;">hello@shilalekh.org</a>.
          We read every message.
        </p>
      </td>
    </tr>

    <tr>
      <td align="center" style="background:#2a1f0a;padding:18px 40px;">
        <p style="font-size:11px;color:#6a5838;font-family:sans-serif;line-height:1.6;margin:0;">
          © 2026 Shilalekh &nbsp;·&nbsp; shilalekh.org<br>
          You received this because you created a Shilalekh account.
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
        to: [email],
        subject: `Welcome to Shilalekh, ${firstName}`,
        html,
      }),
    })

    if (!response.ok) throw new Error('Resend error')
    return res.status(200).json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Failed to send welcome email' })
  }
}