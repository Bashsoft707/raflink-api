export const successfulSubscriptionTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Subscription Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 0;
        margin: 0;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
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
        margin-bottom: 10px;
      }
      .content {
        padding: 30px 20px;
      }
      .content h2 {
        color: #1b3b36;
        margin-bottom: 10px;
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
      .footer {
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #777;
        background-color: #f0f0f0;
      }
      .cta-button {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 24px;
        background-color: #1b3b36;
        color: #ffffff;
        text-decoration: none;
        border-radius: 24px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/dthbsdbxs/image/upload/v1741948747/logo_qewk5k.png" alt="Raflinks Logo" />
        <h1>Subscription Confirmed 🎉</h1>
      </div>
      <div class="content">
        <h2>Hello {name},</h2>
        <p>We're thrilled to confirm your subscription to <strong>Raflinks</strong>! Thank you for choosing us to help you track, manage, and monetize your links effortlessly.</p>

        <div class="details">
          <p><strong>Amount Paid:</strong> {amount.toFixed(2)} USD</p>
          <p><strong>Payment Method:</strong> {cardType} ending in {last4}</p>
          <p><strong>Status:</strong> Active</p>
        </div>

        <p style="margin-top: 20px;">You now have full access to premium features and insights designed to grow your influence and revenue.</p>

        <a href="https://raflinks.io/dashboard" class="cta-button">Go to Dashboard</a>

        <p style="margin-top: 30px;">If you have any questions or need help, feel free to contact us at <a href="mailto:{companyEmail}">{companyEmail}</a>.</p>

        <p>Welcome aboard! 🚀</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Raflinks. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;
