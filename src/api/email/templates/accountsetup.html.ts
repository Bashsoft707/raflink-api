// export const accountSetupTemplate = `<!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>Welcome to Raflinks</title>
//     <style>
//       /* Reset styles */
//       body,
//       p,
//       h1,
//       h2,
//       h3,
//       h4,
//       h5,
//       h6 {
//         margin: 0;
//         padding: 0;
//       }

//       body {
//         font-family: Arial, sans-serif;
//         line-height: 1.6;
//         color: #333;
//         margin: 0;
//         padding: 0;
//         background-color: #f7f7f7;
//       }

//       .email-container {
//         max-width: 600px;
//         margin: 0 auto;
//         background-color: #ffffff;
//       }

//       .header {
//         background-image: url("https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948737/email_template_header_hql8cl.jpg");
//         background-size: cover;
//         background-position: center;
//         padding: 20px;
//         border-radius: 8px 8px 0 0;
//       }

//       .header-content {
//         background-color: white;
//         border-radius: 8px;
//         padding: 24px;
//         margin: 40px 0;
//       }

//       .logo {
//         display: flex;
//         align-items: center;
//         gap: 10px;
//         margin-bottom: 20px;
//       }

//       .logo img {
//         width: 48px;
//         height: 48px;
//       }

//       .logo-text {
//         font-size: 24px;
//         font-weight: bold;
//         color: #0b3b2c;
//       }

//       .welcome-heading {
//         font-size: 28px;
//         font-weight: bold;
//         margin-bottom: 12px;
//         color: #333;
//       }

//       .welcome-subtext {
//         font-size: 16px;
//         color: #666;
//       }

//       .email-body {
//         padding: 40px 20px;
//       }

//       .greeting {
//         font-size: 16px;
//         margin-bottom: 20px;
//       }

//       .message {
//         font-size: 16px;
//         margin-bottom: 20px;
//         color: #444;
//       }

//       .cta-button {
//         display: inline-block;
//         background-color: #0b3b2c;
//         color: white;
//         padding: 12px 20px;
//         text-decoration: none;
//         border-radius: 6px;
//         font-weight: bold;
//         margin: 20px 0;
//       }

//       .signature {
//         margin: 30px 0;
//       }

//       .team-name {
//         font-weight: bold;
//         margin-top: 5px;
//       }

//       .social-links {
//         text-align: center;
//         padding: 20px 0;
//         border-top: 1px solid #eee;
//       }

//       .social-icon {
//         display: inline-block;
//         margin: 0 10px;
//       }

//       .social-icon img {
//         width: 24px;
//         height: 24px;
//         opacity: 0.7;
//       }

//       .footer {
//         text-align: center;
//         padding: 20px;
//         color: #777;
//         font-size: 14px;
//         border-top: 1px solid #eee;
//       }

//       .address {
//         margin: 15px 0;
//       }

//       .disclaimer {
//         margin: 20px 0;
//         font-size: 13px;
//         color: #888;
//       }

//       .website-promo {
//         text-align: center;
//         margin: 30px 0;
//       }

//       .website-button {
//         display: block;
//         text-decoration: none;
//         color: #333;
//         font-weight: bold;
//         margin-bottom: 15px;
//       }

//       .website-image {
//         max-width: 100%;
//         border-radius: 8px;
//         border: 1px solid #eee;
//       }

//       .footer-links {
//         margin-top: 20px;
//         text-align: center;
//       }

//       .footer-link {
//         color: #0b3b2c;
//         text-decoration: none;
//         margin: 0 10px;
//         font-size: 14px;
//       }

//       .footer-logo {
//         text-align: center;
//         margin-top: 30px;
//       }

//       .footer-logo img {
//         width: 32px;
//         height: 32px;
//       }

//       .footer-brand {
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         gap: 8px;
//         margin-top: 20px;
//       }

//       .footer-brand-text {
//         color: #0b3b2c;
//         font-weight: bold;
//       }
// /* For arrow in the button */
//       .arrow {
//         display: inline-block;
//         margin-left: 8px;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="email-container">
//       <div class="header">
//         <div class="header-content">
//           <div class="logo">
//             <img
//               src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948747/logo_qewk5k.png"
//               alt="Raflinks Logo"
//             />
//             <span class="logo-text">Raflinks</span>
//           </div>
//           <h1 class="welcome-heading">Welcome {name}! 🎉</h1>
//           <p class="welcome-subtext">
//             You are part of the amazing team members at Raflinks
//           </p>
//         </div>
//       </div>

//       <div class="email-body">
//         <p class="greeting">Hello {name}</p>

//         <p class="message">
//           You have been added as {role} on Raflink. We have everything ready
//           and waiting for you.
//         </p>

//         <p class="message">
//           Please click the button below to set up your account
//         </p>

//         <a href={link} class="cta-button"
//           >Setup Account <span class="arrow">→</span></a
//         >

//         <p class="message">
//           If you have any questions, we're here to help. Just hit reply!
//         </p>

//         <p class="message">Excited to have you on board! 🙌</p>

//         <div class="signature">
//           <p>Best regards,</p>
//           <p class="team-name">The Raflink Team</p>
//         </div>
//       </div>

//       <div class="social-links">
//         <a href="#" class="social-icon">
//           <img
//             src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1740501549/facebook-logo_ofnr8r.svg"
//             alt="Facebook"
//           />
//         </a>
//         <a href="#" class="social-icon">
//           <img
//             src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1740501547/instagram-logo_k8ib25.svg"
//             alt="Instagram"
//           />
//         </a>
//         <a href="#" class="social-icon">
//           <img
//             src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1740501547/x-logo_ej3czi.svg"
//             alt="Twitter"
//           />
//         </a>
//       </div>

//       <div class="footer">
//         <p>Copyright (c) 2025 Raflinks. All rights reserved.</p>

//         <p class="address">
//           166 Geary Street 15th Floor, San Francisco,<br />
//           CA, 94108
//         </p>

//         <p class="disclaimer">
//           You are receiving this mail because you opted in<br />
//           via our website.
//         </p>

//         <!-- <div class="website-promo">
//           <a href="#" class="website-button">Visit the Website</a>
//           <img
//             src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948747/logo_qewk5k.png"
//             alt="Website Preview"
//             class="website-image"
//           />
//         </div> -->

//         <div class="footer-links">
//           <a href="#" class="footer-link">Privacy Policy</a>
//           <a href="#" class="footer-link">Terms of Use</a>
//           <a href="#" class="footer-link">Unsubscribe</a>
//         </div>

//         <div class="footer-brand">
//           <img
//             src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948747/logo_qewk5k.png"
//             alt="Raflinks Logo"
//             style="width: 24px; height: 24px"
//           />
//           <span class="footer-brand-text">Raflinks</span>
//         </div>
//       </div>
//     </div>
//   </body>
// </html>`;

export const accountSetupTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Welcome to Raflinks</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; background-color: #f7f7f7; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <!-- Main Table Structure -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;">
      <tr>
        <td align="center" valign="top">
          <!-- Email Container -->
          <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff;">
            <!-- Header Section -->
            <tr>
              <td align="center" valign="top" style="background-color: #ffffff; background-image: url('https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948737/email_template_header_hql8cl.jpg'); background-size: cover; background-position: center; padding: 20px; border-radius: 8px 8px 0 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" valign="top">
                      <table border="0" cellpadding="0" cellspacing="0" width="85%" style="background-color: white; border-radius: 8px; padding: 24px; margin: 40px 0;">
                        <tr>
                          <td align="left" valign="top">
                            <!-- Logo -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                              <tr>
                                <td valign="middle" width="48">
                                  <img src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948747/logo_qewk5k.png" alt="Raflinks Logo" width="48" height="48" style="display: block; border: 0;" />
                                </td>
                                <td valign="middle" style="padding-left: 10px;">
                                  <span style="font-size: 24px; font-weight: bold; color: #0b3b2c;">Raflinks</span>
                                </td>
                              </tr>
                            </table>
                            <!-- Welcome Text -->
                            <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 12px 0; color: #333333;">Welcome {name}! 🎉</h1>
                            <p style="font-size: 16px; margin: 0; color: #666666;">You are part of the amazing team members at Raflinks</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Email Body -->
            <tr>
              <td align="center" valign="top" style="padding: 40px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size: 16px; margin-bottom: 20px;">Hello {name}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; margin-bottom: 20px; color: #444444; padding-top: 15px;">
                      You have been added as {role} on Raflink. We have everything ready
                      and waiting for you.
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; margin-bottom: 20px; color: #444444; padding-top: 15px;">
                      Please click the button below to set up your account
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="padding: 20px 0;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{link}" style="height:40px;v-text-anchor:middle;width:200px;" arcsize="10%" stroke="f" fillcolor="#0b3b2c">
                        <w:anchorlock/>
                        <center>
                      <![endif]-->
                      <a href="{link}"
                         style="background-color:#0b3b2c;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:16px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:200px;border-radius:6px;-webkit-text-size-adjust:none;">Setup Account &rarr;</a>
                      <!--[if mso]>
                        </center>
                      </v:roundrect>
                      <![endif]-->
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; margin-bottom: 20px; color: #444444; padding-top: 15px;">
                      If you have any questions, we're here to help. Just hit reply!
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; margin-bottom: 20px; color: #444444; padding-top: 15px;">
                      Excited to have you on board! 🙌
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 30px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td>Best regards,</td>
                        </tr>
                        <tr>
                          <td style="font-weight: bold; padding-top: 5px;">The Raflink Team</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Social Links -->
            <tr>
              <td align="center" style="padding: 20px 0; border-top: 1px solid #eeeeee;">
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <a href="#" style="display: inline-block; margin: 0 10px;">
                        <img src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742298726/facebook_gyrgr2.png" alt="Facebook" width="24" height="24" style="opacity: 0.7; border: 0;" />
                      </a>
                    </td>
                    <td>
                      <a href="#" style="display: inline-block; margin: 0 10px;">
                        <img src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742298725/instagram_ntxelk.png" alt="Instagram" width="24" height="24" style="opacity: 0.7; border: 0;" />
                      </a>
                    </td>
                    <td>
                      <a href="#" style="display: inline-block; margin: 0 10px;">
                        <img src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742298725/twitter_iobuam.png" alt="Twitter" width="24" height="24" style="opacity: 0.7; border: 0;" />
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 20px; color: #777777; font-size: 14px; border-top: 1px solid #eeeeee;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">Copyright (c) 2025 Raflinks. All rights reserved.</td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 15px 0;">
                      166 Geary Street 15th Floor, San Francisco,<br />
                      CA, 94108
                    </td>
                  </tr>
                  <tr>
                  <td align="center" style="font-size: 13px; color: #888888; padding-bottom: 20px;">
                      You are receiving this mail because you opted in<br />
                      via our website.
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 20px;">
                      <a href="#" style="color: #0b3b2c; text-decoration: none; margin: 0 10px; font-size: 14px;">Privacy Policy</a>
                      <a href="#" style="color: #0b3b2c; text-decoration: none; margin: 0 10px; font-size: 14px;">Terms of Use</a>
                      <a href="#" style="color: #0b3b2c; text-decoration: none; margin: 0 10px; font-size: 14px;">Unsubscribe</a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 30px;">
                      <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td valign="middle">
                            <img src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948747/logo_qewk5k.png" alt="Raflinks Logo" width="24" height="24" style="border: 0;" />
                          </td>
                          <td valign="middle" style="padding-left: 8px; color: #0b3b2c; font-weight: bold;">
                            Raflinks
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
