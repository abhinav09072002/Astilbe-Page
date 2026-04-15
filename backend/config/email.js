const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Send confirmation email to new subscriber
const sendConfirmationEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'You\'re on the AP Newsletter waitlist.',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width"/>
          <title>AP Newsletter</title>
        </head>
        <body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:60px 0;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#000;border:0.5px solid rgba(255,255,255,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding:48px 48px 32px;border-bottom:0.5px solid rgba(255,255,255,0.07);">
                      <p style="margin:0;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.3);">AP Newsletter</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:48px 48px 40px;">
                      <h1 style="margin:0 0 20px;font-size:42px;font-weight:300;line-height:1;color:#fff;font-family:Georgia,serif;font-style:italic;">
                        You're on the list.
                      </h1>
                      <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.4);line-height:1.8;font-weight:300;letter-spacing:0.04em;">
                        Thank you for joining the AP Newsletter waitlist. We're building something exceptional — a premium newsletter for those who think ahead.
                      </p>
                      <p style="margin:0 0 40px;font-size:14px;color:rgba(255,255,255,0.4);line-height:1.8;font-weight:300;letter-spacing:0.04em;">
                        You'll be among the first to receive access when we launch. We'll be in touch.
                      </p>
                      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.2);font-family:Georgia,serif;font-style:italic;">
                        — The AP Team
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:24px 48px;border-top:0.5px solid rgba(255,255,255,0.07);">
                      <p style="margin:0;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.14);">
                        © 2026 AP Newsletter &nbsp;·&nbsp; Launching Soon
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })
    console.log(`📧 Confirmation email sent to ${email}`)
    return true
  } catch (err) {
    // Don't crash if email fails — just log it
    console.error(`⚠️  Email send failed for ${email}:`, err.message)
    return false
  }
}

module.exports = { sendConfirmationEmail }
