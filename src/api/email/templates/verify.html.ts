export const verifyTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Nunito:family=Open+Sans:wght@300&display=swap"
      rel="stylesheet"
    />
    <title>Aufera</title>
  </head>
  <body style="background-color: #fff; position: relative; height: 100vh">
    <table align="center">
      <tbody align="center">
        <tr align="center" style="border-color: transparent">
          <td
            align="center"
            style="
              font-family: 'Nunito', sans-serif;
              width: 400px;
              height: 100%;
              margin: 0;
              padding: 0;
            "
          >
            <table
              style="
                width: 400px;
                background-color: #eef2fb;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                padding: 1em;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <div style="vertical-align: middle">
                      <a href="www.aufera.com"
                        ><img
                          src="https://i.ibb.co/ykkb0FJ/Asset-6-150x-1.png"
                          alt="Aufera"
                          border="0"
                          style="
                            padding: 1em 0 3em;
                            width: 104px;
                            height: 36px;
                          "
                      /></a>
                    </div>
                    <div>
                      <h3
                        style="
                          font-family: 'Nunito', sans-serif;
                          font-style: normal;
                          font-weight: 800;
                          font-size: 24px;
                        "
                      >
                        Verify Email
                      </h3>
                      <p
                        style="
                          font-family: 'Nunito', sans-serif;
                          font-style: normal;
                          font-weight: normal;
                          font-size: 16px;
                          line-height: 22px;
                        "
                      >
                        You have requested email verification. Find your 6-digit
                        verification code below.
                      </p>

                      <p
                        align="center"
                        style="
                          font-family: 'Open Sans', sans-serif;
                          font-style: normal;
                          font-weight: 600;
                          font-size: 48px;
                          line-height: 48px;
                          text-align: center;
                          color: #407bff;
                          text-align: center;
                        "
                      >
                        {code}
                      </p>
                      <a href="/"
                        ><button
                          style="
                            width: 100%;
                            padding: 1em 0;
                            background-color: #4653ec;
                            color: #fff;
                            outline: none;
                            border: none;
                            font-family: 'Nunito', sans-serif;
                            font-style: normal;
                            font-weight: 800;
                            font-size: 18px;
                            line-height: 25px;
                            text-align: center;
                            border-radius: 50px;
                            margin-bottom: 1.5em;
                          "
                        >
                          Go to App
                        </button></a
                      >
                      <span
                        style="
                          font-family: 'Nunito', sans-serif;
                          font-style: normal;
                          font-weight: normal;
                          font-size: 16px;
                          line-height: 22px;

                          /* Light Grey */

                          color: #c4c4c4;
                        "
                        >If you did not take this action, please contact us
                        immediately at</span
                      >
                      <p>
                        <a
                          href="mailto:contact@aufera.com"
                          style="
                            font-family: 'Nunito', sans-serif;
                            font-style: normal;
                            font-weight: normal;
                            font-size: 16px;
                            line-height: 22px;
                            /* identical to box height */

                            /* Secondary Blue */
                            color: #407bff;
                          "
                          >{auferaMail}</a
                        >
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`;
