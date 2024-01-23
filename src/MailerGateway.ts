export default class MailerGateway {

	async send (subject: string, recipient: string, message: string) {
		console.log(subject, recipient, message);
	}
}
