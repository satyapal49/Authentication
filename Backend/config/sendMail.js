import {createTransport} from 'nodemailer';

// sendMail: simple helper that sends an email using SMTP (Gmail in this case).
// It expects SMTP credentials to be set in environment variables:
// - SMTP_USER: username/email used to authenticate with the SMTP server
// - SMTP_PASSWORD: password or app-specific password
const sendMail = async({email, subject, html}) => {
    const transport = createTransport({
        host : 'smtp.gmail.com',
        port : 465,
        auth : {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // `from` should match the authenticated SMTP user or be allowed by the provider
    await transport.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject,
        html
    });
};

export default sendMail;