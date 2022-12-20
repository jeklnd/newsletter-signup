const express = require("express");
const https = require("https");
const path = require("path");
const bodyParser = require("body-parser")
const mailchimp = require("@mailchimp/mailchimp_marketing");
const { response } = require("express");

const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

require("dotenv").config();
const apiKey = process.env.API_KEY;
const audienceId = process.env.AUDIENCE_ID;
const serverPrefix = process.env.SERVER_PREFIX;

const apiRootUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`
const apiSubUnsubUrl = `${apiRootUrl}/lists/${audienceId}`

app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({extended: false}));

mailchimp.setConfig({
    apiKey: apiKey,
    server: serverPrefix,
});

// routes
app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
});


app.post("/", (req, res) => {
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;
    console.log(firstName, lastName, email);
    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }
            }
        ]
    };
    const jsonData = JSON.stringify(data)
    const options = {
        method: "POST",
        auth: `jeklnd:${apiKey}`,
    }
    // request to mailchimps API endpoint
    const request = https.request(apiSubUnsubUrl, options, (response) => {
        response.on("data", (data) => {
            console.log(JSON.parse(data));

        });
        console.log(response.statusCode);
        if (response.statusCode === 200) {
            res.sendFile(`${__dirname}/success.html`);
        } else {
            res.sendFile(`${__dirname}/failure.html`)
        }
    });
    request.write(jsonData);
    request.end();
});

app.post("/failure", (req, res) => {
    res.redirect("/")
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
})
