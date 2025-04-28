import emailjs from "@emailjs/browser";

export const sendEmailClient = async ({
                                          to,
                                          subject,
                                          body
                                      }: {
    to: string;
    subject: string;
    body: string;
}) => {
    const SERVICE_ID   = process.env.REACT_APP_EMAILJS_SERVICE_ID!;
    const TEMPLATE_ID  = process.env.REACT_APP_EMAILJS_TEMPLATE_ID!;
    const PUBLIC_KEY   = process.env.REACT_APP_EMAILJS_PUBLIC_KEY!;

    const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { to, subject, message: body },
        PUBLIC_KEY
    );

    return result;
};
