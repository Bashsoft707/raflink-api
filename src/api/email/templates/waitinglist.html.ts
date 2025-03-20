export const waitingListTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            background-image: url('https://raflink.vercel.app/images/email_template_header.jpeg');
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
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
        }

        .feature-box.green {
            background-color: #f0f7f0;
        }

        .feature-box.peach {
            background-color: #fff5eb;
        }

        .feature-box.purple {
            background-color: #f5f0ff;
        }

        /* Button styles */
        .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1B3B36;
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

        .social-icons img {
            width: 24px;
            height: 24px;
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
    <table class="container" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
            <td>
                <!-- Header Section -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td class="header">
                            <div class="headerContent">
                            <img src="https://raflink.vercel.app/images/logo.png" alt="Raflinks Logo" style="border: 0; display: block; width: 45px; height: 45px"">
                            <h1 style="color: #1B3B36; margin-top: 20px;">You're on the List! 🎉</h1>
                            <p style="color: #666666;">Big things are coming, and you're first in line!</p>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Section -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td class="content">
                            <p>Hello User,</p>
                            <p>You're officially on the Raflinks waiting list, and we couldn't be more excited! 🚀<br>
                            We're working behind the scenes to bring you the best way to organize, share, and track your links—all while unlocking new earning opportunities.</p>
                            
                            <p>Here's what to expect:</p>

                            <div class="feature-box green">
                                <strong>Early Access⭐</strong> – You'll be among the first to try Reallink before the public.
                            </div>

                            <div class="feature-box peach">
                                <strong>Exclusive Updates💡</strong> – We'll keep you in the loop with insider news and tips.
                            </div>

                            <div class="feature-box purple">
                                <strong>Special Perks🎁</strong> – Because early adopters deserve something extra. 😉
                            </div>

                            <p>We'll reach out soon with next steps. In the meantime, feel free to <strong>spread the word</strong>—the more, the merrier!</p>

                            <a href="#" class="cta-button">
                                Get Started <img src="https://raflink.vercel.app/svgs/arrow_forward.svg" alt="→" style="vertical-align: middle; margin-left: 8px;">
                            </a>

                            <p>If you have any questions, we're here to help. Just hit reply! Talk soon!</p>

                            <p>Best regards,<br>The Reallink Team</p>
                        </td>
                    </tr>
                </table>

                <!-- Footer Section -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td class="footer">
                                <div class="social-icons">
                                    <a href="#" class="social-icon">
                                    <img
                                        src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742298726/facebook_gyrgr2.png"
                                        alt="Facebook"
                                    />
                                    </a>
                                    <a href="#" class="social-icon">
                                    <img
                                        src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742298725/instagram_ntxelk.png"
                                        alt="Instagram"
                                    />
                                    </a>
                                    <a href="#" class="social-icon">
                                    <img
                                        src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1742298725/twitter_iobuam.png"
                                        alt="Twitter"
                                    />
                                    </a>
                                </div>

                            <p style="color: #666666;">Copyright (c) 2025 Raflinks. All rights reserved.</p>
                            <p style="color: #666666;">You are receiving this mail because you opted in via our website.</p>

                            <h2>Visit the Website</h2>
                            <img src="https://raflink.vercel.app/images/footer_image.png" alt="Raflinks Dashboard" class="footer-image">

                            <div class="footer-links">
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Use</a>
                                <a href="#">Unsubscribe</a>
                            </div>

                            <img src="https://raflink.vercel.app/images/logo.png" alt="Raflinks Logo" style="width: 80px; margin-top: 20px;">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
