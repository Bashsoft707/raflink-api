export const subscriptionExpirationTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Subscription Expiration</title>
    <!--[if mso]>
    <style type="text/css">
      table {border-collapse: collapse; border-spacing: 0; margin: 0;}
      div, td {padding: 0;}
      div {margin: 0 !important;}
    </style>
    <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
      /* Reset styles to prevent inconsistencies */
      body, html {
        margin: 0;
        padding: 0;
        width: 100% !important;
        height: 100% !important;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      
      /* Ensure proper table rendering */
      table, td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        border-collapse: collapse !important;
      }
      
      img {
        -ms-interpolation-mode: bicubic;
        max-width: 100%;
        display: block;
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }
      
      /* Base styles with fallbacks */
      body {
        font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
        background-color: #f4f4f4;
        color: #333333;
        line-height: 1.4;
      }
      
      /* Main layout styles */
      .container {
        max-width: 600px;
        margin: 30px auto;
        width: 100%;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
      }
      
      .header {
        background-color: #1b3b36;
        color: #ffffff;
        padding: 30px 20px;
        text-align: center;
      }
      
      .header img {
        width: 40px;
        height: 40px;
        margin: 0 auto 10px;
        display: block;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .content h2 {
        color: #1b3b36;
        margin: 0 0 10px 0;
        font-weight: bold;
        font-size: 20px;
      }
      
      .details {
        margin-top: 20px;
        background-color: #f9f9f9;
        padding: 15px 20px;
        border-left: 4px solid #1b3b36;
        border-radius: 4px;
      }
      
      .details p {
        margin: 8px 0;
      }
      
      p {
        margin: 16px 0;
      }
      
      .footer {
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #777777;
        background-color: #f0f0f0;
      }
      
      .cta-button {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 24px;
        background-color: #1b3b36;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 24px;
        mso-padding-alt: 12px 24px;
        font-weight: bold;
      }
      
      /* Add Outlook compatibility */
      @media all {
        .btn-container {
          min-width: 100% !important;
        }
        .mobile-link {
          color: inherit !important;
          text-decoration: none !important;
        }
      }
      
      /* Mobile responsiveness */
      @media screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          margin: 10px auto !important;
        }
        
        .content, .header, .footer, .details {
          padding: 15px !important;
        }
        
        h1 {
          font-size: 24px !important;
        }
        
        .cta-button {
          display: block !important;
          text-align: center !important;
          width: 80% !important;
          margin: 20px auto !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4; width: 100%; height: 100%;">
    <!--[if mso]>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
      <tr>
        <td align="center">
    <![endif]-->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 30px auto;">
      <tr>
        <td style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <!-- Header -->
            <tr>
              <td class="header" style="background-color: #1b3b36; color: #ffffff; padding: 30px 20px; text-align: center;">
                <img src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948747/logo_qewk5k.png" alt="Raflinks Logo" width="40" height="40" style="margin-bottom: 10px;" />
                <h1 style="margin: 0; font-size: 28px; color: #ffffff;">Subscription Confirmed 🎉</h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td class="content" style="padding: 30px 20px;">
                <h2 style="color: #1b3b36; margin-bottom: 10px;">Hello {name},</h2>
               
                <p>We wanted to take a moment to remind you that your subscription is set to expire soon. Here are the details:</p> 
                <div class="details" style="margin-top: 20px; background-color: #f9f9f9; padding: 15px 20px; border-left: 4px solid #1b3b36; border-radius: 4px;">
                  <p><strong>Plan Name:</strong> {planName}</p>
                  <p><strong>Expiration Date:</strong> {expirationDate}</p>
                    <p><strong>Current Year:</strong> ${new Date().getFullYear()}</p>
                </div>
                <p style="margin-top: 20px;">We appreciate your support and are committed to providing you with the best service possible.</p>
                <p>Thank you for being a valued member of our community!</p>
                <p>If you wish to continue enjoying our services without interruption, please ensure that your payment information is up to date.</p>


                <!-- CTA Button with fallback -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="btn-container" style="margin-top: 20px;">
                  <tr>
                    <td align="left">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://raflinks.io" style="height:45px;v-text-anchor:middle;width:200px;" arcsize="50%" stroke="f" fillcolor="#1b3b36">
                        <w:anchorlock/>
                        <center>
                      <![endif]-->
                      <a href="https://raflinks.io" class="cta-button" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #1b3b36; color: #ffffff; text-decoration: none; border-radius: 24px; font-weight: bold;">Go to Dashboard</a>
                      <!--[if mso]>
                        </center>
                      </v:roundrect>
                      <![endif]-->
                    </td>
                  </tr>
                </table>

                <p style="margin-top: 30px;">If you have any questions or need help, feel free to contact us at <a href="mailto:{raflink_email}" style="color: #1b3b36;">{raflink_email}</a>.</p>

                <p>Welcome aboard! 🚀</p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td class="footer" style="padding: 20px; text-align: center; font-size: 14px; color: #777777; background-color: #f0f0f0;">
                &copy; ${new Date().getFullYear()} Raflinks. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!--[if mso]>
        </td>
      </tr>
    </table>
    <![endif]-->
  </body>
</html>
`;
