export const welcomeTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to raflink</title>
    <link rel="stylesheet" href="https://raflink.vercel.app/_static/styles/index.css" />
  </head>
  <body style="background-color: #fff">
    <table
      align="center"
      style="
        border-color: transparent;
        background-color: #f9f5ff;
        width: 366px;
        margin: auto;
      "
    >
      <tbody
        align="center"
        style="
          border-color: transparent;
          background-color: #f9f5ff;
          width: 366px;
        "
      >
        <tr
          align="center"
          style="
            border-color: transparent;
            background-color: #f9f5ff;
            width: 366px;
          "
        >
          <td
            align="center"
            style="
              font-family: 'Lato', sans-serif;
              width: 342px;
              height: 100%;
              margin: 0 auto;
              padding: 0;
              padding-top: 2em;
              padding-left: 0.5em;
              padding-right: 0.5em;
            "
          >
            <table
              style="width: 100%; height: 172px; background-repeat: no-repeat"
            >
              <tbody>
                <tr>
                  <td>
                    <div width="100%" height="143" align="center">
                      <img
                        align="center"
                        alt=""
                        src="https://raflink.vercel.app/_static/images/hero-bg.png"
                        style="border: 0; text-decoration: none; display: block"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              style="
                border-collapse: collapse;
                font-size: 14px;
                line-height: 1.5;
                width: 100%;
              "
              width="100%"
            >
              <tbody>
                <tr style="border-color: transparent">
                  <th
                    width="650"
                    style="
                      border-color: transparent;
                      font-weight: normal;
                      text-align: left;
                      vertical-align: top;
                    "
                    lign="left"
                    valign="top"
                  >
                    <table
                      width="100%"
                      style="
                        border-collapse: collapse;
                        font-size: 14px;
                        line-height: 1.5;
                        font-weight: normal;
                        margin: 0;
                      "
                    >
                      <tbody>
                        <tr style="border-color: transparent; color: #1e1e1e">
                          <td>
                            <div
                              class=""
                              style="
                                padding: 1.3rem;
                                padding: 15px 15px 15px 15px;
                                line-height: 2rem;
                                font-family: 'Lato Regular', system-ui,
                                  -apple-system, BlinkMacSystemFont, 'Segoe UI',
                                  Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
                                  'Helvetica Neue', sans-serif;
                                background-color: #fff;
                              "
                            >
                              <p><b>Hi {name},</b></p>
                                <p class="mail">
                                    Welcome to raflink, the payment service that works just for you. We understand how difficult and frustrating it is to make payments especially when you need to pay your fruit vendors, shoemakers, and pepper sellers and have put this as our primary objective to help you with.
                                </p>
                                <p class="mail">
                                    We started raflink with two simple goals, to help people make payments easily and help the SMBs collect payment easily without a smartphone with immediate payment confirmation.
                                </p>
                                <p class="mail">We genuinely care about how payment is made and processed in Nigeria, especially in-person payment, so if there’s anything at all we can do to help, please reach out to our amazing customer success team via email <a href="{raflink_email}">{raflink_email}</a>.</p>
                                <p class="mail">Thank you and welcome again to raflink.</p>
                                <p>Kind Regards, <br />The raflink team</p>
                              <hr
                                style="
                                  margin: 1rem 0;
                                  border: none;
                                  height: 2px;
                                  width: 100%;
                                  background: #e6e6e6;
                                "
                              />
                            </div>
                            <div
                              style="
                                width: 100%;
                                background: #9747ff;
                                padding: 2rem 0;
                              "
                            >
                              <p
                                style="
                                  font-family: 'Lato Bold', system-ui,
                                    -apple-system, BlinkMacSystemFont,
                                    'Segoe UI', Roboto, Oxygen, Ubuntu,
                                    Cantarell, 'Open Sans', 'Helvetica Neue',
                                    sans-serif;
                                  color: white;
                                  font-size: 2rem;
                                  text-align: center;
                                "
                              >
                                Bank reliably with raflink
                              </p>
                              <img
                                src="https://raflink.vercel.app/_static/images/banner.png"
                                alt=""
                                style="
                                  width: 80%;
                                  background-position: center;
                                  background-size: cover;
                                  margin: 2rem;
                                "
                              />
                              <div style="width: fit-content; margin: 0 auto">
                                <button
                                  style="
                                    margin-bottom: 0.7rem;
                                    background: #000;
                                    border-radius: 14px;
                                    padding: 0.9rem 1.8rem;
                                    display: flex;
                                    justify-content: space-between;
                                    gap: 1rem;
                                    align-items: center;
                                    text-align: center;
                                    width: auto;
                                    color: #fff;
                                    border: none;
                                    font-family: 'Lato Regular', system-ui,
                                      -apple-system, BlinkMacSystemFont,
                                      'Segoe UI', Roboto, Oxygen, Ubuntu,
                                      Cantarell, 'Open Sans', 'Helvetica Neue',
                                      sans-serif;
                                  "
                                >
                                  <img
                                    src="https://raflink.vercel.app/_static/icons/apple.png"
                                    alt="App Store"
                                    style="width: 1.3rem"
                                  />
                                  <div class="btn-details">
                                    <p class="btn-download">Download on</p>
                                    <p
                                      style="
                                        font-family: 'Lato Bold', system-ui,
                                          -apple-system, BlinkMacSystemFont,
                                          'Segoe UI', Roboto, Oxygen, Ubuntu,
                                          Cantarell, 'Open Sans',
                                          'Helvetica Neue', sans-serif;
                                        font-size: 1.3rem;
                                      "
                                    >
                                      Appstore
                                    </p>
                                  </div>
                                </button>
                                <button
                                  style="
                                    background: #000;
                                    border-radius: 14px;
                                    padding: 0.9rem 1.8rem;
                                    display: flex;
                                    justify-content: space-between;
                                    gap: 1rem;
                                    align-items: center;
                                    text-align: center;
                                    width: auto;
                                    color: #fff;
                                    border: none;
                                    font-family: 'Lato Regular', system-ui,
                                      -apple-system, BlinkMacSystemFont,
                                      'Segoe UI', Roboto, Oxygen, Ubuntu,
                                      Cantarell, 'Open Sans', 'Helvetica Neue',
                                      sans-serif;
                                  "
                                >
                                  <img
                                    src="https://raflink.vercel.app/_static/icons/playstore.png"
                                    alt="Play Store"
                                    style="width: 1.3rem"
                                  />
                                  <div class="btn-details">
                                    <p class="btn-download">Download on</p>
                                    <p
                                      style="
                                        font-family: 'Lato Bold', system-ui,
                                          -apple-system, BlinkMacSystemFont,
                                          'Segoe UI', Roboto, Oxygen, Ubuntu,
                                          Cantarell, 'Open Sans',
                                          'Helvetica Neue', sans-serif;
                                        font-size: 1.3rem;
                                      "
                                    >
                                      Playstore
                                    </p>
                                  </div>
                                </button>
                              </div>
                            </div>
                            <footer
                              style="
                                background-color: #fff;
                                padding-bottom: 2rem;
                                padding-top: 1rem;
                                margin-bottom: 1rem;
                              "
                            >
                              <p
                                style="
                                  width: 85%;
                                  margin: 1rem auto;
                                  font-family: 'Lato Regular', system-ui,
                                    -apple-system, BlinkMacSystemFont,
                                    'Segoe UI', Roboto, Oxygen, Ubuntu,
                                    Cantarell, 'Open Sans', 'Helvetica Neue',
                                    sans-serif;
                                  color: #666666;
                                  line-height: 1.7rem;
                                  text-align: center;
                                "
                              >
                                If you experience any problems using raflink,
                                kindly contact us at
                                <a href="{raflink_email}">{raflink_email}</a> or
                                send us a DM on our social media channels.
                              </p>
                              <div
                                style="
                                  display: flex;
                                  width: fit-content;
                                  gap: 2rem;
                                  margin: 0 auto;
                                  justify-content: space-between;
                                "
                              >
                                <a
                                  href="https://www.twitter.com/raflinkhq"
                                  target="_blank"
                                  ><img
                                    src="https://raflink.vercel.app/_static/icons/twitter.png"
                                    alt="Twitter"
                                /></a>
                                <a
                                  href="https://www.instagram.com/raflinkhq"
                                  target="_blank"
                                  ><img
                                    src="https://raflink.vercel.app/_static/icons/instagram.png"
                                    alt="Instagram"
                                /></a>
                                <a
                                  href="https://www.linkedin.com/company/raflinkhq"
                                  target="_blank"
                                  ><img
                                    src="https://raflink.vercel.app/_static/icons/linkedin.png"
                                    alt="Linkedin"
                                /></a>
                              </div>
                            </footer>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </th>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
