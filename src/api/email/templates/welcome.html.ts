export const welcomeTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Raflinks</title>
    <style>
      /* Base styles */
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333333;
      }

      /* Container styles */
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }

      /* Header styles */
      .header {
        background-image: url("https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948737/email_template_header_hql8cl.jpg");
        background-size: cover;
        background-position: center;
        padding: 20px;
        border-radius: 16px 16px 0 0;
      }

      .headerContent {
        background-color: #ffffff;
        border-radius: 12px;
        padding: 20px;
      }

      /* Content styles */
      .content {
        padding: 20px;
      }

      /* Feature box styles */
      .feature-box {
        padding: 20px;
        margin: 20px 0;
        border-radius: 12px;
        background-color: #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .feature-title {
        font-size: 20px;
        font-weight: bold;
        color: #1b3b36;
        margin-bottom: 8px;
      }

      .feature-description {
        color: #666666;
        margin-top: 0;
      }

      .feature-image {
        width: 100%;
        height: 180px;
        border-radius: 8px;
        margin: 16px 0;
      }

      /* Button styles */
      .cta-button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #1b3b36;
        color: #ffffff;
        text-decoration: none;
        border-radius: 24px;
        margin: 20px 0;
      }

      /* Footer styles */
      .footer {
        background-color: #f8f8f8;
        padding: 40px 20px;
        text-align: center;
      }

      .social-icons {
        margin: 20px 0;
      }

      .social-icon img {
        width: 15px;
        height: 15px;
        margin: 0 10px;
      }

      .footer-links {
        margin: 20px 0;
      }

      .footer-links a {
        color: #333333;
        text-decoration: underline;
        margin: 0 10px;
      }

      .footer-image {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 20px 0;
      }

      /* Responsive styles */
      @media screen and (max-width: 600px) {
        .container {
          width: 100% !important;
        }

        .content {
          padding: 15px !important;
        }

        .footer {
          padding: 20px 15px !important;
        }
      }
    </style>
  </head>
  <body>
    <table
      class="container"
      cellpadding="0"
      cellspacing="0"
      border="0"
      align="center"
    >
      <tr>
        <td>
          <!-- Header Section -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="header">
                <div class="headerContent">
                  <img
                    src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948747/logo_qewk5k.png"
                    alt="Raflinks Logo"
                    style="border: 0; display: block; width: 45px; height: 45px"
                  />
                  <h1 style="color: #1b3b36; margin-top: 20px">
                    Let's Start Tracking Your Links 🚀
                  </h1>
                  <p style="color: #666666">
                    Ease in tracking links, earning commissions, and growing
                    your influence starts today! 🎉
                  </p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Main Content Section -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="content">
                <p>Hello User,</p>
                <p>
                  We're so excited to have you on board! With Raflink, you have
                  everything you need to organize, share, and track your
                  links—all in one place. Whether you're growing your influence,
                  promoting affiliate products, or just keeping things together,
                  we've got you covered.
                </p>

                <p>Here's what you can look forward to:</p>

                <div class="feature-box">
                  <div class="feature-title">Add Your Links</div>
                  <p class="feature-description">
                    Organize all your affiliate and personal links in one place.
                  </p>
                  <img
                    src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742296986/add_your_link_ba0udt.png"
                    alt="Add Your Links Interface"
                    class="feature-image"
                  />
                </div>

                <div class="feature-box">
                  <div class="feature-title">Share & Earn</div>
                  <p class="feature-description">
                    Post your links anywhere and track your performance in
                    real-time.
                  </p>
                  <img
                    src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742296987/share_earn_edv5k6.png"
                    alt="Share and Earn Interface"
                    class="feature-image"
                  />
                </div>

                <div class="feature-box">
                  <div class="feature-title">Discover Brands</div>
                  <p class="feature-description">
                    Explore affiliate opportunities that match your audience.
                  </p>
                  <img
                    src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742296987/discover_brand_papbju.png"
                    alt="Discover Brands Interface"
                    class="feature-image"
                  />
                </div>

                <p>
                  You're just a few clicks away from making the most of your
                  links!
                </p>

                <a href="https://raflinks.io/auth/login" class="cta-button">
                  Get Started &rarr;
                </a>

                <p>
                  If you have any questions, we're here to help. Just hit reply!
                </p>

                <p>Excited to have you on board! 🙌</p>

                <p>Best regards,<br />The Reallink Team</p>
              </td>
            </tr>
          </table>

          <!-- Footer Section -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="footer">
                <div class="social-icons">
                  <a
                    href="https://www.facebook.com/myraflinks/"
                    class="social-icon"
                  >
                    <img
                      src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742298726/facebook_gyrgr2.png"
                      alt="Facebook"
                    />
                  </a>
                  <a
                    href="https://www.instagram.com/raflinks"
                    class="social-icon"
                  >
                    <img
                      src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742298725/instagram_ntxelk.png"
                      alt="Instagram"
                    />
                  </a>
                  <a
                    href="https://www.tiktok.com/@raflinks"
                    class="social-icon"
                  >
                    <img
                      src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742300003/Vector_jm9imz.png"
                      alt="TikTok"
                    />
                  </a>
                </div>

                <p style="color: #666666">
                  Copyright (c) 2025 Raflinks. All rights reserved.
                </p>
                <p style="color: #666666">
                  You are receiving this mail because you opted in via our
                  website.
                </p>

                <h2>Visit the Website</h2>
                <img
                  src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742297198/footer_image_ceqhps.png"
                  alt="Raflinks Dashboard"
                  class="footer-image"
                />

                <div class="footer-links">
                  <a href="#">Privacy Policy</a>
                  <a href="#">Terms of Use</a>
                  <a href="#">Unsubscribe</a>
                </div>

                <img
                  src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948747/logo_qewk5k.png"
                  alt="Raflinks Logo"
                  style="width: 80px; margin-top: 20px"
                />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
